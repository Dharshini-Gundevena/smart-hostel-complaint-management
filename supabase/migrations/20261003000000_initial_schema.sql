BEGIN;

CREATE TYPE public.app_role AS ENUM ('STUDENT', 'ADMIN', 'MAINTENANCE');
CREATE TYPE public.complaint_status AS ENUM (
  'PENDING',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
  'ESCALATED'
);
CREATE TYPE public.complaint_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE public.hostels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) > 0),
  location text NOT NULL CHECK (length(trim(location)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hostels_name_location_unique UNIQUE (name, location)
);

CREATE TABLE public.blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE RESTRICT,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blocks_hostel_name_unique UNIQUE (hostel_id, name),
  CONSTRAINT blocks_id_hostel_unique UNIQUE (id, hostel_id)
);

CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid NOT NULL REFERENCES public.blocks(id) ON DELETE RESTRICT,
  room_number text NOT NULL CHECK (length(trim(room_number)) > 0),
  floor integer NOT NULL DEFAULT 0,
  capacity integer NOT NULL CHECK (capacity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rooms_block_number_unique UNIQUE (block_id, room_number),
  CONSTRAINT rooms_id_block_unique UNIQUE (id, block_id)
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text UNIQUE,
  phone text,
  role public.app_role NOT NULL DEFAULT 'STUDENT',
  hostel_id uuid REFERENCES public.hostels(id) ON DELETE SET NULL,
  block_id uuid REFERENCES public.blocks(id) ON DELETE SET NULL,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_block_hostel_fk
    FOREIGN KEY (block_id, hostel_id) REFERENCES public.blocks(id, hostel_id) ON DELETE SET NULL,
  CONSTRAINT profiles_room_block_fk
    FOREIGN KEY (room_id, block_id) REFERENCES public.rooms(id, block_id) ON DELETE SET NULL,
  CONSTRAINT profiles_location_order_check
    CHECK ((block_id IS NULL OR hostel_id IS NOT NULL) AND (room_id IS NULL OR block_id IS NOT NULL))
);

CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(trim(title)) > 0),
  description text NOT NULL CHECK (length(trim(description)) > 0),
  category text NOT NULL CHECK (length(trim(category)) > 0),
  subcategory text,
  priority public.complaint_priority NOT NULL DEFAULT 'MEDIUM',
  severity smallint NOT NULL DEFAULT 1 CHECK (severity BETWEEN 1 AND 5),
  status public.complaint_status NOT NULL DEFAULT 'PENDING',
  image_url text,
  ai_summary text,
  ai_confidence numeric(5, 4) CHECK (ai_confidence BETWEEN 0 AND 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz,
  resolved_at timestamptz
);

CREATE TABLE public.complaint_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  assigned_to uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  assigned_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  unassigned_at timestamptz,
  CONSTRAINT complaint_assignment_time_check CHECK (unassigned_at IS NULL OR unassigned_at >= assigned_at)
);

CREATE TABLE public.complaint_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  updated_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  old_status public.complaint_status,
  new_status public.complaint_status,
  comment text NOT NULL CHECK (length(trim(comment)) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  complaint_id uuid REFERENCES public.complaints(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(trim(title)) > 0),
  message text NOT NULL CHECK (length(trim(message)) > 0),
  type text NOT NULL CHECK (length(trim(type)) > 0),
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT feedback_one_per_complaint_unique UNIQUE (complaint_id)
);

CREATE INDEX complaints_status_idx ON public.complaints(status);
CREATE INDEX complaints_category_idx ON public.complaints(category);
CREATE INDEX complaints_priority_idx ON public.complaints(priority);
CREATE INDEX complaints_student_id_idx ON public.complaints(student_id);
CREATE INDEX complaints_room_id_idx ON public.complaints(room_id);
CREATE INDEX complaints_created_at_idx ON public.complaints(created_at DESC);
CREATE INDEX complaint_assignments_assigned_to_idx ON public.complaint_assignments(assigned_to);
CREATE INDEX complaint_assignments_active_assigned_to_idx
  ON public.complaint_assignments(assigned_to, complaint_id) WHERE unassigned_at IS NULL;
CREATE UNIQUE INDEX complaint_assignments_one_active_per_complaint_idx
  ON public.complaint_assignments(complaint_id) WHERE unassigned_at IS NULL;
CREATE INDEX complaint_updates_complaint_created_idx
  ON public.complaint_updates(complaint_id, created_at DESC);
CREATE INDEX notifications_user_created_idx ON public.notifications(user_id, created_at DESC);
CREATE INDEX feedback_student_id_idx ON public.feedback(student_id);

CREATE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER hostels_set_updated_at BEFORE UPDATE ON public.hostels
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER blocks_set_updated_at BEFORE UPDATE ON public.blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER rooms_set_updated_at BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER complaints_set_updated_at BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER notifications_set_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE FUNCTION public.protect_profile_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() = OLD.id AND NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'A user cannot change their own role' USING ERRCODE = '42501';
  END IF;
  IF auth.uid() IS NOT NULL AND public.current_app_role() IS DISTINCT FROM 'ADMIN' AND (
    NEW.role IS DISTINCT FROM OLD.role OR
    NEW.email IS DISTINCT FROM OLD.email OR
    NEW.hostel_id IS DISTINCT FROM OLD.hostel_id OR
    NEW.block_id IS DISTINCT FROM OLD.block_id OR
    NEW.room_id IS DISTINCT FROM OLD.room_id
  ) THEN
    RAISE EXCEPTION 'Only administrators can change privileged profile fields' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_protect_privileged_fields
  BEFORE UPDATE OF role, email, hostel_id, block_id, room_id ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_fields();

CREATE FUNCTION public.create_profile_for_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    'STUDENT'
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_auth_user();

CREATE FUNCTION public.current_app_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.role FROM public.profiles AS p WHERE p.id = (SELECT auth.uid())
$$;

CREATE FUNCTION public.is_assigned_maintenance(target_complaint_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.complaint_assignments AS ca
    WHERE ca.complaint_id = target_complaint_id
      AND ca.assigned_to = (SELECT auth.uid())
      AND ca.unassigned_at IS NULL
  )
$$;

CREATE FUNCTION public.guard_maintenance_complaint_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF public.current_app_role() = 'MAINTENANCE' AND (
    NEW.student_id IS DISTINCT FROM OLD.student_id OR
    NEW.room_id IS DISTINCT FROM OLD.room_id OR
    NEW.title IS DISTINCT FROM OLD.title OR
    NEW.description IS DISTINCT FROM OLD.description OR
    NEW.category IS DISTINCT FROM OLD.category OR
    NEW.subcategory IS DISTINCT FROM OLD.subcategory OR
    NEW.priority IS DISTINCT FROM OLD.priority OR
    NEW.severity IS DISTINCT FROM OLD.severity OR
    NEW.image_url IS DISTINCT FROM OLD.image_url OR
    NEW.ai_summary IS DISTINCT FROM OLD.ai_summary OR
    NEW.ai_confidence IS DISTINCT FROM OLD.ai_confidence OR
    NEW.due_at IS DISTINCT FROM OLD.due_at
  ) THEN
    RAISE EXCEPTION 'Maintenance users may only update complaint workflow fields' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER complaints_guard_maintenance_update BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.guard_maintenance_complaint_update();

CREATE FUNCTION public.validate_complaint_assignment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = NEW.assigned_to AND p.role = 'MAINTENANCE'
  ) THEN
    RAISE EXCEPTION 'Complaints can only be assigned to maintenance users' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER complaint_assignments_validate_target
  BEFORE INSERT OR UPDATE OF assigned_to ON public.complaint_assignments
  FOR EACH ROW EXECUTE FUNCTION public.validate_complaint_assignment();

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.protect_profile_privileged_fields() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_profile_for_auth_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_app_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_assigned_maintenance(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.guard_maintenance_complaint_update() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_complaint_assignment() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_assigned_maintenance(uuid) TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_self_or_admin ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR public.current_app_role() = 'ADMIN');
CREATE POLICY profiles_insert_admin ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.current_app_role() = 'ADMIN');
CREATE POLICY profiles_update_self_or_admin ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()) OR public.current_app_role() = 'ADMIN')
  WITH CHECK (id = (SELECT auth.uid()) OR public.current_app_role() = 'ADMIN');
CREATE POLICY profiles_delete_admin ON public.profiles
  FOR DELETE TO authenticated
  USING (public.current_app_role() = 'ADMIN');

CREATE POLICY hostels_read_authenticated ON public.hostels
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY hostels_manage_admin ON public.hostels
  FOR ALL TO authenticated
  USING (public.current_app_role() = 'ADMIN')
  WITH CHECK (public.current_app_role() = 'ADMIN');
CREATE POLICY blocks_read_authenticated ON public.blocks
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY blocks_manage_admin ON public.blocks
  FOR ALL TO authenticated
  USING (public.current_app_role() = 'ADMIN')
  WITH CHECK (public.current_app_role() = 'ADMIN');
CREATE POLICY rooms_read_authenticated ON public.rooms
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY rooms_manage_admin ON public.rooms
  FOR ALL TO authenticated
  USING (public.current_app_role() = 'ADMIN')
  WITH CHECK (public.current_app_role() = 'ADMIN');

CREATE POLICY complaints_select_authorized ON public.complaints
  FOR SELECT TO authenticated
  USING (
    public.current_app_role() = 'ADMIN' OR
    student_id = (SELECT auth.uid()) OR
    (public.current_app_role() = 'MAINTENANCE' AND public.is_assigned_maintenance(id))
  );
CREATE POLICY complaints_insert_own_student ON public.complaints
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_app_role() = 'STUDENT' AND
    student_id = (SELECT auth.uid()) AND
    status = 'PENDING' AND
    priority = 'MEDIUM' AND
    severity = 1 AND
    resolved_at IS NULL AND
    due_at IS NULL AND
    ai_summary IS NULL AND
    ai_confidence IS NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = (SELECT auth.uid()) AND p.room_id = complaints.room_id
    )
  );
CREATE POLICY complaints_update_admin ON public.complaints
  FOR UPDATE TO authenticated
  USING (public.current_app_role() = 'ADMIN')
  WITH CHECK (public.current_app_role() = 'ADMIN');
CREATE POLICY complaints_update_assigned_maintenance ON public.complaints
  FOR UPDATE TO authenticated
  USING (public.current_app_role() = 'MAINTENANCE' AND public.is_assigned_maintenance(id))
  WITH CHECK (public.current_app_role() = 'MAINTENANCE' AND public.is_assigned_maintenance(id));
CREATE POLICY complaints_delete_admin ON public.complaints
  FOR DELETE TO authenticated
  USING (public.current_app_role() = 'ADMIN');

CREATE POLICY complaint_assignments_select_related ON public.complaint_assignments
  FOR SELECT TO authenticated
  USING (assigned_to = (SELECT auth.uid()) OR public.current_app_role() = 'ADMIN');
CREATE POLICY complaint_assignments_insert_admin ON public.complaint_assignments
  FOR INSERT TO authenticated
  WITH CHECK (public.current_app_role() = 'ADMIN' AND assigned_by = (SELECT auth.uid()));
CREATE POLICY complaint_assignments_update_admin ON public.complaint_assignments
  FOR UPDATE TO authenticated
  USING (public.current_app_role() = 'ADMIN')
  WITH CHECK (public.current_app_role() = 'ADMIN');
CREATE POLICY complaint_assignments_delete_admin ON public.complaint_assignments
  FOR DELETE TO authenticated
  USING (public.current_app_role() = 'ADMIN');

CREATE POLICY complaint_updates_select_related ON public.complaint_updates
  FOR SELECT TO authenticated
  USING (
    public.current_app_role() = 'ADMIN' OR
    EXISTS (
      SELECT 1 FROM public.complaints AS c
      WHERE c.id = complaint_id AND (
        c.student_id = (SELECT auth.uid()) OR public.is_assigned_maintenance(c.id)
      )
    )
  );
CREATE POLICY complaint_updates_insert_authorized ON public.complaint_updates
  FOR INSERT TO authenticated
  WITH CHECK (
    updated_by = (SELECT auth.uid()) AND (
      public.current_app_role() = 'ADMIN' OR
      (public.current_app_role() = 'MAINTENANCE' AND public.is_assigned_maintenance(complaint_id))
    )
  );

CREATE POLICY notifications_select_related ON public.notifications
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    public.current_app_role() = 'ADMIN' OR
    (public.current_app_role() = 'MAINTENANCE' AND complaint_id IS NOT NULL
      AND public.is_assigned_maintenance(complaint_id))
  );
CREATE POLICY notifications_insert_admin ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.current_app_role() = 'ADMIN');
CREATE POLICY notifications_update_read_related ON public.notifications
  FOR UPDATE TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    public.current_app_role() = 'ADMIN' OR
    (public.current_app_role() = 'MAINTENANCE' AND complaint_id IS NOT NULL
      AND public.is_assigned_maintenance(complaint_id))
  )
  WITH CHECK (
    user_id = (SELECT auth.uid()) OR
    public.current_app_role() = 'ADMIN' OR
    (public.current_app_role() = 'MAINTENANCE' AND complaint_id IS NOT NULL
      AND public.is_assigned_maintenance(complaint_id))
  );
CREATE POLICY notifications_delete_admin ON public.notifications
  FOR DELETE TO authenticated
  USING (public.current_app_role() = 'ADMIN');

CREATE POLICY feedback_select_owner_or_admin ON public.feedback
  FOR SELECT TO authenticated
  USING (student_id = (SELECT auth.uid()) OR public.current_app_role() = 'ADMIN');
CREATE POLICY feedback_insert_own_resolved_complaint ON public.feedback
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_app_role() = 'STUDENT' AND
    student_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.complaints AS c
      WHERE c.id = complaint_id AND c.student_id = (SELECT auth.uid()) AND c.status = 'RESOLVED'
    )
  );

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON TYPE public.app_role, public.complaint_status, public.complaint_priority TO authenticated;
REVOKE ALL ON
  public.profiles, public.hostels, public.blocks, public.rooms, public.complaints,
  public.complaint_assignments, public.complaint_updates, public.notifications, public.feedback
FROM anon, PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.profiles, public.hostels, public.blocks, public.rooms, public.complaints,
  public.complaint_assignments, public.complaint_updates, public.notifications, public.feedback
TO authenticated;
REVOKE UPDATE, DELETE ON public.complaint_updates, public.feedback FROM authenticated;
REVOKE UPDATE, DELETE ON public.feedback FROM authenticated;
REVOKE UPDATE ON public.notifications FROM authenticated;
GRANT UPDATE (read) ON public.notifications TO authenticated;

COMMIT;