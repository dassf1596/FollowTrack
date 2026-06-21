-- Enable uuid generation if not present
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Snapshots Table
create table public.snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  follower_count integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Followers Table
create table public.followers (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.snapshots(id) on delete cascade,
  username text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Comparisons Table
create table public.comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  snapshot_a uuid not null references public.snapshots(id) on delete cascade,
  snapshot_b uuid not null references public.snapshots(id) on delete cascade,
  added_count integer not null default 0,
  removed_count integer not null default 0,
  growth_rate numeric not null default 0.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Comparison Added Table
create table public.comparison_added (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid not null references public.comparisons(id) on delete cascade,
  username text not null
);

-- 6. Comparison Removed Table
create table public.comparison_removed (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid not null references public.comparisons(id) on delete cascade,
  username text not null
);

-- 7. Activity Logs Table
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create optimized indexes
create index if not exists idx_profiles_id on public.profiles(id);
create index if not exists idx_snapshots_user_id on public.snapshots(user_id);
create index if not exists idx_snapshots_created_at on public.snapshots(created_at desc);
create index if not exists idx_followers_snapshot_id on public.followers(snapshot_id);
create index if not exists idx_followers_username on public.followers(username);
create index if not exists idx_comparisons_user_id on public.comparisons(user_id);
create index if not exists idx_comparisons_created_at on public.comparisons(created_at desc);
create index if not exists idx_comparison_added_comparison_id on public.comparison_added(comparison_id);
create index if not exists idx_comparison_removed_comparison_id on public.comparison_removed(comparison_id);
create index if not exists idx_activity_logs_user_id_created_at on public.activity_logs(user_id, created_at desc);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.snapshots enable row level security;
alter table public.followers enable row level security;
alter table public.comparisons enable row level security;
alter table public.comparison_added enable row level security;
alter table public.comparison_removed enable row level security;
alter table public.activity_logs enable row level security;

-- Define RLS Policies
-- Profiles
create policy "Allow users to view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Allow users to update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Snapshots
create policy "Allow users to manage own snapshots" 
  on public.snapshots for all 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Followers
create policy "Allow users to manage followers of own snapshots" 
  on public.followers for all 
  using (
    exists (
      select 1 from public.snapshots 
      where public.snapshots.id = public.followers.snapshot_id 
      and public.snapshots.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.snapshots 
      where public.snapshots.id = public.followers.snapshot_id 
      and public.snapshots.user_id = auth.uid()
    )
  );

-- Comparisons
create policy "Allow users to manage own comparisons" 
  on public.comparisons for all 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Comparison Added
create policy "Allow users to manage added records of own comparisons" 
  on public.comparison_added for all 
  using (
    exists (
      select 1 from public.comparisons 
      where public.comparisons.id = public.comparison_added.comparison_id 
      and public.comparisons.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.comparisons 
      where public.comparisons.id = public.comparison_added.comparison_id 
      and public.comparisons.user_id = auth.uid()
    )
  );

-- Comparison Removed
create policy "Allow users to manage removed records of own comparisons" 
  on public.comparison_removed for all 
  using (
    exists (
      select 1 from public.comparisons 
      where public.comparisons.id = public.comparison_removed.comparison_id 
      and public.comparisons.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.comparisons 
      where public.comparisons.id = public.comparison_removed.comparison_id 
      and public.comparisons.user_id = auth.uid()
    )
  );

-- Activity Logs
create policy "Allow users to view own activity logs" 
  on public.activity_logs for select 
  using (auth.uid() = user_id);

create policy "Allow users to create own activity logs" 
  on public.activity_logs for insert 
  with check (auth.uid() = user_id);

-- Trigger for profile creation on new signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
