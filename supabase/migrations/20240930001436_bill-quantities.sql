CREATE
OR REPLACE function public.update_invoice_state () returns trigger AS $$
    declare
        invoice invoice_data%rowtype;
begin
    select * into invoice from public.invoice_data where invoice_id = new.invoice_id;

    if (invoice.state = 'approved') then
        update public.base_bills
        set approved_quantity=approved_quantity+new.billed_quantity
        where base_bills.base_bill_id = new.base_bill_id;

        update public.invoice_data set state = 'pending' where invoice_id = new.invoice_id;
    elseif (invoice.state = 'pending') then
        update public.base_bills
        set pending_quantity=pending_quantity+new.billed_quantity
        where base_bills.base_bill_id = new.base_bill_id;

    else
        update public.invoice_data set state = 'pending' where invoice_id = new.invoice_id;

        update public.base_bills
        set pending_quantity=pending_quantity+new.billed_quantity
        where base_bills.base_bill_id = new.base_bill_id;
    end if;

    return new;
end;
$$ language plpgsql security definer;


CREATE TRIGGER update_base_bill_quantity_after_insert
AFTER insert ON public.supplier_data FOR each ROW
EXECUTE procedure public.update_invoice_state ();


CREATE FUNCTION public.update_invoice_state_after_update () returns trigger AS $$
begin
    update public.invoice_data set state = state where invoice_id = new.invoice_id;

    return new;
end;
$$ language plpgsql security definer;


CREATE TRIGGER update_base_bill_quantity_after_update
AFTER
UPDATE ON public.supplier_data FOR each ROW
EXECUTE procedure public.update_invoice_state_after_update ();


CREATE
OR REPLACE function public.handle_invoice_state_change () returns trigger AS $$
    declare
        _quantity integer default 0;
        _bill_record record;
begin
    if (old.state = new.state) then
        return new;
    end if;

    for _bill_record in select distinct base_bill_id from public.supplier_data where invoice_id = new.invoice_id loop
        select sum(billed_quantity) into _quantity from public.supplier_data where invoice_id = new.invoice_id and base_bill_id = _bill_record.base_bill_id;

        if (old.state = 'approved') then
            if (new.state = 'pending') then
                update public.base_bills
                set pending_quantity=pending_quantity+_quantity, approved_quantity=approved_quantity-_quantity
                where base_bills.base_bill_id = _bill_record.base_bill_id;
            else
                update public.base_bills
                set approved_quantity=approved_quantity-_quantity
                where base_bills.base_bill_id = _bill_record.base_bill_id;
            end if;
        elseif (old.state = 'pending') then
            if (new.state = 'approved') then
                raise warning 'Quantity %', _quantity;
                update public.base_bills
                set approved_quantity=approved_quantity+_quantity, pending_quantity=pending_quantity-_quantity
                where base_bills.base_bill_id = _bill_record.base_bill_id;
            else
                update public.base_bills
                set pending_quantity=pending_quantity-_quantity
                where base_bills.base_bill_id = _bill_record.base_bill_id;
            end if;
        else
            if (new.state = 'approved') then
                update public.base_bills
                set approved_quantity=approved_quantity+_quantity
                where base_bills.base_bill_id = _bill_record.base_bill_id;
            else
                update public.base_bills
                set pending_quantity=pending_quantity+_quantity
                where base_bills.base_bill_id = _bill_record.base_bill_id;
            end if;
        end if;
    end loop;

    return new;
end;
$$ language plpgsql security definer;


CREATE TRIGGER handle_invoice_state_change
AFTER
UPDATE ON public.invoice_data FOR each ROW
EXECUTE procedure public.handle_invoice_state_change ();
