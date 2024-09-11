-- trigger when profile is inserted, if it has a domain, check if supplier exists and insert supplier employee
CREATE FUNCTION public.check_profile_domain() RETURNS trigger AS
$$
DECLARE
    _supplier_id int DEFAULT NULL;
BEGIN
    IF new.email ~* '@' THEN
        SELECT s.supplier_id
        INTO _supplier_id
        FROM public.suppliers s
        WHERE s.domain = SUBSTRING(new.email FROM '@(.*)$');

        IF found THEN
            INSERT INTO public.supplier_employees (profile_id, supplier_id)
            VALUES (new.profile_id, _supplier_id);
        END IF;
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_profile_domain
    AFTER INSERT
    ON public.profiles
    FOR EACH ROW
EXECUTE PROCEDURE public.check_profile_domain();
