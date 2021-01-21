CREATE TABLE app.tenants(
    id uuid not null primary key default uuid_generate_v4(),
    dominio varchar(255),
    nome_exibicao varchar(255),
    logo_url  varchar(1024)
);
CREATE TABLE app.applications(
    id uuid not null primary key default uuid_generate_v4(),
    nome varchar(255),
    nome_exibicao varchar(255),
    logo_url  varchar(1024),
    role_principal  varchar(255),
    roles json
);

alter table app.users
	add last_app varchar(255);

alter table app.users
	add active boolean default true not null;

alter table app.applications
	add active boolean default true not null;	

alter table app.tenants
	add active boolean default true not null;		

alter table app.tenants
    add available_apps json;	

create table app.events
(
	id uuid default uuid_generate_v4() not null
		constraint events_pk
			primary key,
	username varchar(255),
	description text,
	source varchar(255),
	event_date timestamptz
);

create table app.user_state
(
	id uuid default uuid_generate_v4() not null
		constraint user_state_pk
			primary key,
	username varchar(255) not null,
	state_key varchar(255) not null,
	state_value json
);

create unique index user_state_username_state_key_uindex
	on app.user_state (username, state_key);

alter table app.user_state
add state_date timestamptz default now() not null;

