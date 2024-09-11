insert into public.suppliers (name, domain)
values ('Zoft', 'zoft.com');

insert into auth.users(id, aud, role, email, encrypted_password, email_confirmed_at, created_at, raw_app_meta_data)
  values(uuid_generate_v4(),'authenticated', 'authenticated', '1@zoft.com', crypt('Contra123!', gen_salt('bf')), now(), now(), '{"provider":"email","providers":["email"]}');

insert into auth.users(id, aud, role, email, encrypted_password, email_confirmed_at, created_at, raw_app_meta_data)
  values(uuid_generate_v4(),'authenticated', 'authenticated', '2@gmail.com', crypt('Contra123!', gen_salt('bf')), now(), now(), '{"provider":"email","providers":["email"]}');
