drop table app.users;
create table app.users(
    id uuid not null primary key default uuid_generate_v4(),
    username varchar(1024) not null,
    user_email varchar(1024) not null,
    display_name varchar(1024) not null,
    login_methods json not null,
    user_roles json not null,
    user_apps json not null,
    user_tenant varchar(255) not null,
    password varchar(1024) not null
);
insert into app.users(username, user_email, display_name, login_methods,
                      user_roles, user_apps, user_tenant, password)
values ('admin', 'admin@licitasys.com.br', 'admin', '["internal"]',
        '["SuperAdmin"]', '["ciam"]', 'sys-evolution',  crypt('ADMlct#123', gen_salt('bf')));

-- select row_to_json(rj) from (
--     select u.id, u.login_methods
--     from app.users u
--     where (u.username = 'admin' or u.user_email = 'admin')
-- ) as rj;