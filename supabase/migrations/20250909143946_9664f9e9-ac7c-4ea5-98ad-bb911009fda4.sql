-- Create audit log table for better security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Only super admins can view audit logs"
ON public.audit_logs
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'super_admin'
    )
);

-- Create function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
    action_type TEXT,
    table_name TEXT,
    record_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        created_at
    ) VALUES (
        auth.uid(),
        action_type,
        table_name,
        record_id,
        now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add data retention policy function
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs() 
RETURNS void AS $$
BEGIN
    -- Delete audit logs older than 1 year
    DELETE FROM public.audit_logs 
    WHERE created_at < now() - interval '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;