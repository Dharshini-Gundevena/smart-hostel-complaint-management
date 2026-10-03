BEGIN;

DROP TRIGGER complaints_notify_admins_of_urgent_priority ON public.complaints;
CREATE TRIGGER complaints_notify_admins_of_urgent_priority
  AFTER UPDATE OF ai_priority ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_of_urgent_complaint();

COMMIT;
