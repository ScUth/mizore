create table if not exits users (
    id serial primary key,
    username varchar(255) not null,
    password varchar(60) not null,
    role varchar(255) not null,
    create_at timestamptz not null default now()
);

create table if not exits path (
    id serial primary key,
    name varchar(255) not null,
    path text not null,
    user_id serial references users(id)
);