-- Revoke EXECUTE privilege on SECURITY DEFINER function public.rls_auto_enable() from public API roles (anon and authenticated)
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- Grant EXECUTE privilege exclusively to service_role and postgres superuser
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO service_role, postgres;
