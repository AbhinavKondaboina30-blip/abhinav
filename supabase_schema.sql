-- CareerMatch AI: Supabase Schema for Analyses History
-- Run this in the Supabase SQL Editor if the table does not exist:

create table if not exists analyses (
  id text primary key,
  job_title text not null,
  company text default '',
  score integer not null,
  score_rating text,
  analysis_json jsonb not null,
  is_demo boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (optional / standard practice)
alter table analyses enable row level security;

-- Allow anonymous read and insert for the hackathon MVP
create policy "Allow public read access"
  on analyses for select
  using (true);

create policy "Allow public insert access"
  on analyses for insert
  with check (true);
