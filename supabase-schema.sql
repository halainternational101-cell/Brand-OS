-- Brand OS — Supabase Schema
-- Run this in the Supabase SQL editor after creating your project

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles ────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific profile data
create table public.profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  email        text not null,
  display_name text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Brand Blueprints ────────────────────────────────────────────────────────
create table public.brand_blueprints (
  id                    uuid default uuid_generate_v4() primary key,
  user_id               uuid references public.profiles(id) on delete cascade not null,
  positioning_statement text not null,
  ica                   jsonb not null,   -- ideal client avatar
  voice_guide           jsonb not null,
  content_pillars       jsonb not null,   -- array of 3 pillars
  input_type            text not null check (input_type in ('ikigai', 'niche')),
  input_data            jsonb not null,   -- raw inputs used to generate
  created_at            timestamptz default now() not null
);

alter table public.brand_blueprints enable row level security;

create policy "Users can view own blueprints"
  on public.brand_blueprints for select
  using (auth.uid() = user_id);

create policy "Users can insert own blueprints"
  on public.brand_blueprints for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own blueprints"
  on public.brand_blueprints for delete
  using (auth.uid() = user_id);

-- ── Generated Posts ─────────────────────────────────────────────────────────
create table public.generated_posts (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  blueprint_id uuid references public.brand_blueprints(id) on delete set null,
  platform     text not null check (platform in ('linkedin', 'twitter', 'instagram')),
  post_type    text not null,   -- Story, Listicle, Framework, etc.
  topic        text not null,
  hook         text not null,
  body         text not null,
  cta          text not null,
  created_at   timestamptz default now() not null
);

alter table public.generated_posts enable row level security;

create policy "Users can view own posts"
  on public.generated_posts for select
  using (auth.uid() = user_id);

create policy "Users can insert own posts"
  on public.generated_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own posts"
  on public.generated_posts for delete
  using (auth.uid() = user_id);

-- ── YouTube Versions ────────────────────────────────────────────────────────
create table public.youtube_versions (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid references public.profiles(id) on delete cascade not null,
  original_title   text not null,
  hook_type        text,
  pattern          text,
  remixed_title    text not null,
  alt_titles       jsonb not null,   -- array of strings
  hook_lines       jsonb not null,   -- 7-step hook object
  script_outline   jsonb not null,   -- array of sections
  cta              text not null,
  thumbnail_brief  jsonb not null,
  created_at       timestamptz default now() not null
);

alter table public.youtube_versions enable row level security;

create policy "Users can view own youtube versions"
  on public.youtube_versions for select
  using (auth.uid() = user_id);

create policy "Users can insert own youtube versions"
  on public.youtube_versions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own youtube versions"
  on public.youtube_versions for delete
  using (auth.uid() = user_id);

-- ── Indexes ─────────────────────────────────────────────────────────────────
create index idx_brand_blueprints_user_id on public.brand_blueprints(user_id);
create index idx_generated_posts_user_id on public.generated_posts(user_id);
create index idx_generated_posts_blueprint_id on public.generated_posts(blueprint_id);
create index idx_youtube_versions_user_id on public.youtube_versions(user_id);
