BEGIN;

ALTER TABLE public.complaints
  ADD COLUMN ai_category text CHECK (ai_category IS NULL OR ai_category IN (
    'ELECTRICAL', 'PLUMBING', 'CLEANING', 'INTERNET', 'FURNITURE',
    'SECURITY', 'WATER', 'FOOD', 'ROOM_MAINTENANCE', 'OTHER'
  )),
  ADD COLUMN ai_priority public.complaint_priority,
  ADD COLUMN ai_department text CHECK (ai_department IS NULL OR ai_department IN (
    'ELECTRICAL', 'PLUMBING', 'CLEANING', 'INTERNET', 'SECURITY', 'HOUSEKEEPING', 'GENERAL_MAINTENANCE'
  )),
  ADD COLUMN ai_suggested_action text,
  ADD COLUMN ai_reason text,
  ADD COLUMN ai_status text NOT NULL DEFAULT 'PENDING'
    CHECK (ai_status IN ('PENDING', 'ANALYZED', 'UNAVAILABLE'));

CREATE FUNCTION public.store_complaint_ai_recommendation(
  target_complaint_id uuid,
  analysis jsonb
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
    RAISE EXCEPTION 'Administrator access is required to persist AI recommendations' USING ERRCODE = '42501';
  END IF;

  IF analysis IS NULL THEN
    UPDATE public.complaints AS c
    SET ai_status = 'UNAVAILABLE'
    WHERE c.id = target_complaint_id
    RETURNING c.* INTO updated;
    RETURN updated;
  END IF;
  IF jsonb_typeof(analysis) IS DISTINCT FROM 'object'
    OR jsonb_typeof(analysis -> 'category') IS DISTINCT FROM 'string'
    OR jsonb_typeof(analysis -> 'priority') IS DISTINCT FROM 'string'
    OR jsonb_typeof(analysis -> 'summary') IS DISTINCT FROM 'string'
    OR jsonb_typeof(analysis -> 'department') IS DISTINCT FROM 'string'
    OR jsonb_typeof(analysis -> 'suggested_action') IS DISTINCT FROM 'string'
    OR jsonb_typeof(analysis -> 'reason') IS DISTINCT FROM 'string' THEN
    RAISE EXCEPTION 'AI analysis payload is invalid' USING ERRCODE = '22023';
  END IF;

  IF analysis ->> 'category' NOT IN (
    'ELECTRICAL', 'PLUMBING', 'CLEANING', 'INTERNET', 'FURNITURE',
    'SECURITY', 'WATER', 'FOOD', 'ROOM_MAINTENANCE', 'OTHER'
  ) THEN
    RAISE EXCEPTION 'AI category is invalid' USING ERRCODE = '22023';
  END IF;
  IF analysis ->> 'department' NOT IN (
    'ELECTRICAL', 'PLUMBING', 'CLEANING', 'INTERNET', 'SECURITY', 'HOUSEKEEPING', 'GENERAL_MAINTENANCE'
  ) THEN
    RAISE EXCEPTION 'AI department is invalid' USING ERRCODE = '22023';
  END IF;
    PERFORM (analysis ->> 'priority')::public.complaint_priority;

  UPDATE public.complaints AS c
    SET ai_category = analysis ->> 'category',
      ai_priority = (analysis ->> 'priority')::public.complaint_priority,
      ai_summary = analysis ->> 'summary',
      ai_department = analysis ->> 'department',
      ai_suggested_action = analysis ->> 'suggested_action',
      ai_reason = analysis ->> 'reason',
      ai_status = 'ANALYZED'
  WHERE c.id = target_complaint_id
  RETURNING c.* INTO updated;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Complaint not found' USING ERRCODE = 'P0002';
  END IF;
  RETURN updated;
END;
$$;

CREATE FUNCTION public.notify_admins_of_urgent_complaint()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.ai_priority IN ('HIGH', 'CRITICAL') AND OLD.ai_priority IS DISTINCT FROM NEW.ai_priority THEN
    INSERT INTO public.notifications (user_id, complaint_id, title, message, type)
    SELECT p.id, NEW.id,
      CASE NEW.ai_priority WHEN 'CRITICAL' THEN 'Critical complaint identified' ELSE 'High-priority complaint identified' END,
      NEW.ai_summary,
      'urgent_complaint'
    FROM public.profiles AS p
    WHERE p.role = 'ADMIN'
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications AS n
        WHERE n.user_id = p.id AND n.complaint_id = NEW.id AND n.type = 'urgent_complaint'
      );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER complaints_notify_admins_of_urgent_priority
  AFTER UPDATE OF priority ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_of_urgent_complaint();

REVOKE ALL ON FUNCTION public.store_complaint_ai_recommendation(uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_admins_of_urgent_complaint() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.store_complaint_ai_recommendation(uuid, jsonb) TO authenticated;

COMMIT;