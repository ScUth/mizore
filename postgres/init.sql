create table if not exists users (
    id serial primary key,
    username varchar(255) not null,
    password varchar(60) not null,
    role varchar(255) not null default('owner'),
    created_at timestamptz not null default now()
);

create table if not exists path (
    id serial primary key,
    name varchar(255) not null,
    path text not null,
    user_id serial references users(id)
);

create table if not exists subUsers (
    id serial PRIMARY KEY,
    name varchar(255) not null,
    user_id serial REFERENCES users(id),
    role VARCHAR(255) not null,
    created_at TIMESTAMP not null DEFAULT now()
);