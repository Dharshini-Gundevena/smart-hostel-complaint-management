BEGIN;

CREATE FUNCTION public.notify_complaint_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  complaint_student_id uuid;
BEGIN
  SELECT c.student_id INTO complaint_student_id
  FROM public.complaints AS c
  WHERE c.id = NEW.complaint_id;

  IF complaint_student_id IS NOT NULL AND complaint_student_id IS DISTINCT FROM NEW.updated_by THEN
    INSERT INTO public.notifications (user_id, complaint_id, title, message, type)
    VALUES (
      complaint_student_id,
      NEW.complaint_id,
      'Complaint updated',
      coalesce(NEW.comment, 'There is an update to your complaint.'),
      'complaint_update'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER complaint_updates_notify_student
  AFTER INSERT ON public.complaint_updates
  FOR EACH ROW EXECUTE FUNCTION public.notify_complaint_update();

CREATE FUNCTION public.notify_new_complaint_admins()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, complaint_id, title, message, type)
  SELECT p.id, NEW.id, 'New complaint submitted', NEW.title, 'new_complaint'
  FROM public.profiles AS p
  WHERE p.role = 'ADMIN';
  RETURN NEW;
END;
$$;

CREATE TRIGGER complaints_notify_admins
  AFTER INSERT ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_complaint_admins();

CREATE FUNCTION public.notify_complaint_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  complaint_title text;
BEGIN
  IF NEW.unassigned_at IS NULL AND (TG_OP = 'INSERT' OR OLD.unassigned_at IS NOT NULL OR OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) THEN
    SELECT c.title INTO complaint_title FROM public.complaints AS c WHERE c.id = NEW.complaint_id;
    INSERT INTO public.notifications (user_id, complaint_id, title, message, type)
    VALUES (NEW.assigned_to, NEW.complaint_id, 'Complaint assigned to you', complaint_title, 'complaint_assigned');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER complaint_assignments_notify_user
  AFTER INSERT OR UPDATE OF assigned_to, unassigned_at ON public.complaint_assignments
  FOR EACH ROW EXECUTE FUNCTION public.notify_complaint_assignment();

CREATE FUNCTION public.transition_complaint(
  target_complaint_id uuid,
  target_status public.complaint_status,
  update_comment text DEFAULT NULL
)
RETURNS public.complaints
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  existing public.complaints;
  updated public.complaints;
  actor_role public.app_role;
  can_transition boolean := false;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication is required' USING ERRCODE = '42501';
  END IF;

  actor_role := public.current_app_role();
  IF actor_role IS NULL THEN
    RAISE EXCEPTION 'A valid profile is required' USING ERRCODE = '42501';
  END IF;

  SELECT c.* INTO existing
  FROM public.complaints AS c
  WHERE c.id = target_complaint_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Complaint not found' USING ERRCODE = 'P0002';
  END IF;

  IF actor_role = 'MAINTENANCE' AND NOT public.is_assigned_maintenance(target_complaint_id) THEN
    RAISE EXCEPTION 'Complaint is not assigned to you' USING ERRCODE = '42501';
  END IF;
  IF actor_role NOT IN ('ADMIN', 'MAINTENANCE') THEN
    RAISE EXCEPTION 'You cannot change complaint status' USING ERRCODE = '42501';
  END IF;

  can_transition := CASE existing.status
    WHEN 'PENDING' THEN target_status IN ('ASSIGNED', 'REJECTED', 'ESCALATED')
    WHEN 'ASSIGNED' THEN target_status IN ('IN_PROGRESS', 'PENDING', 'REJECTED', 'ESCALATED')
    WHEN 'IN_PROGRESS' THEN target_status IN ('ASSIGNED', 'RESOLVED', 'ESCALATED')
    WHEN 'ESCALATED' THEN target_status IN ('ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')
    WHEN 'RESOLVED' THEN actor_role = 'ADMIN' AND target_status = 'IN_PROGRESS'
    WHEN 'REJECTED' THEN false
  END;
  IF NOT can_transition THEN
    RAISE EXCEPTION 'Invalid complaint status transition' USING ERRCODE = '22023';
  END IF;

  UPDATE public.complaints AS c
  SET status = target_status,
      resolved_at = CASE WHEN target_status = 'RESOLVED' THEN now() ELSE NULL END
  WHERE c.id = target_complaint_id
  RETURNING c.* INTO updated;

  INSERT INTO public.complaint_updates (complaint_id, updated_by, old_status, new_status, comment)
  VALUES (
    target_complaint_id,
    (SELECT auth.uid()),
    existing.status,
    target_status,
    coalesce(nullif(trim(update_comment), ''), 'Status changed to ' || target_status::text || '.')
  );

  RETURN updated;
END;
$$;

CREATE FUNCTION public.admin_assign_complaint(
  target_complaint_id uuid,
  target_maintenance_id uuid,
  assignment_comment text DEFAULT NULL
)
RETURNS public.complaint_assignments
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  current_assignment public.complaint_assignments;
  new_assignment public.complaint_assignments;
  current_complaint public.complaints;
BEGIN
  IF (SELECT auth.uid()) IS NULL OR public.current_app_role() IS DISTINCT FROM 'ADMIN' THEN
    RAISE EXCEPTION 'Administrator access is required' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = target_maintenance_id AND p.role = 'MAINTENANCE'
  ) THEN
    RAISE EXCEPTION 'Target user is not a maintenance user' USING ERRCODE = '22023';
  END IF;

  SELECT c.* INTO current_complaint
  FROM public.complaints AS c
  WHERE c.id = target_complaint_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Complaint not found' USING ERRCODE = 'P0002';
  END IF;
  IF current_complaint.status IN ('RESOLVED', 'REJECTED') THEN
    RAISE EXCEPTION 'A resolved or rejected complaint cannot be assigned' USING ERRCODE = '22023';
  END IF;

  SELECT ca.* INTO current_assignment
  FROM public.complaint_assignments AS ca
  WHERE ca.complaint_id = target_complaint_id AND ca.unassigned_at IS NULL
  FOR UPDATE;

  IF FOUND AND current_assignment.assigned_to = target_maintenance_id THEN
    RETURN current_assignment;
  END IF;

  IF FOUND THEN
    UPDATE public.complaint_assignments AS ca
    SET unassigned_at = now()
    WHERE ca.id = current_assignment.id;
  END IF;

  INSERT INTO public.complaint_assignments (complaint_id, assigned_to, assigned_by)
  VALUES (target_complaint_id, target_maintenance_id, (SELECT auth.uid()))
  RETURNING * INTO new_assignment;

  UPDATE public.complaints AS c
  SET status = 'ASSIGNED', resolved_at = NULL
  WHERE c.id = target_complaint_id AND c.status IS DISTINCT FROM 'ASSIGNED';

  IF current_complaint.status IS DISTINCT FROM 'ASSIGNED' THEN
    INSERT INTO public.complaint_updates (complaint_id, updated_by, old_status, new_status, comment)
    VALUES (
      target_complaint_id,
      (SELECT auth.uid()),
      current_complaint.status,
      'ASSIGNED',
      coalesce(nullif(trim(assignment_comment), ''), 'Complaint assigned to maintenance.')
    );
  ELSE
    INSERT INTO public.complaint_updates (complaint_id, updated_by, old_status, new_status, comment)
    VALUES (
      target_complaint_id,
      (SELECT auth.uid()),
      'ASSIGNED',
      'ASSIGNED',
      coalesce(nullif(trim(assignment_comment), ''), 'Complaint assignment changed.')
    );
  END IF;

  RETURN new_assignment;
END;
$$;

CREATE FUNCTION public.admin_update_complaint_priority(
  target_complaint_id uuid,
  target_priority public.complaint_priority,
  update_comment text DEFAULT NULL
)
RETURNS public.complaints
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  updated public.complaints;
BEGIN
  IF (SELECT auth.uid()) IS NULL OR public.current_app_role() IS DISTINCT FROM 'ADMIN' THEN
    RAISE EXCEPTION 'Administrator access is required' USING ERRCODE = '42501';
  END IF;

  UPDATE public.complaints AS c
  SET priority = target_priority
  WHERE c.id = target_complaint_id
  RETURNING c.* INTO updated;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Complaint not found' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.complaint_updates (complaint_id, updated_by, old_status, new_status, comment)
  VALUES (
    target_complaint_id,
    (SELECT auth.uid()),
    updated.status,
    updated.status,
    coalesce(nullif(trim(update_comment), ''), 'Priority changed to ' || target_priority::text || '.')
  );
  RETURN updated;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_complaint_update() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_new_complaint_admins() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_complaint_assignment() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.transition_complaint(uuid, public.complaint_status, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_assign_complaint(uuid, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_complaint_priority(uuid, public.complaint_priority, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transition_complaint(uuid, public.complaint_status, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_assign_complaint(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_complaint_priority(uuid, public.complaint_priority, text) TO authenticated;

COMMIT;