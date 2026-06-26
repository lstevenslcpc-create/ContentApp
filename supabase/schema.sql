create extension if not exists pgcrypto;

create table if not exists business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  business_name text not null,
  industry text,
  services_offered text,
  target_audience text,
  location_served text,
  brand_voice text,
  main_goal text,
  website_link text,
  social_handles jsonb default '{}'::jsonb,
  offer_promotion text,
  call_to_action text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists brand_brains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_name text not null,
  tagline text,
  mission text,
  personality_sliders jsonb default '{}'::jsonb,
  voice_tone jsonb default '{}'::jsonb,
  forbidden_ai_phrases text[] default '{}',
  audience_profiles jsonb default '[]'::jsonb,
  therapy_services jsonb default '[]'::jsonb,
  product_catalog jsonb default '[]'::jsonb,
  visual_identity jsonb default '{}'::jsonb,
  clinical_safety_rules jsonb default '{}'::jsonb,
  ai_instruction_layer jsonb default '{}'::jsonb,
  seo_priorities text[] default '{}',
  preferred_cta_styles text[] default '{}',
  preferred_platforms text[] default '{}',
  content_goals text[] default '{}',
  conversion_priorities text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists brand_brains_user_id_idx
on brand_brains(user_id);

create table if not exists generated_content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  business_profile_id uuid references business_profiles(id) on delete set null,
  topic text,
  platform text,
  content_type text,
  content_goal text,
  content_angle text,
  hook text,
  caption text,
  hashtags text[] default '{}',
  visual_idea text,
  script text,
  status text default 'draft',
  scheduled_for timestamptz,
  posted_at timestamptz,
  media_url text,
  media_provider text,
  media_job_id text,
  media_status text,
  canva_design_url text,
  canva_template_id text,
  converted_at timestamptz,
  is_generation_history boolean default true,
  archived boolean default false,
  content_intelligence_brief jsonb default '{}'::jsonb,
  why_this_works jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint generated_content_status_check check (status in ('draft', 'needs_review', 'approved', 'scheduled', 'posted', 'failed')),
  constraint generated_content_media_status_check check (media_status is null or media_status in ('not_started', 'processing', 'completed', 'failed'))
);

create table if not exists content_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  explanation text,
  strongest_emotional_hook text,
  curiosity_angle text,
  save_worthy_angle text,
  share_worthy_angle text,
  comment_bait_potential text,
  emotional_trigger_category text,
  audience text,
  content_pillar text,
  platform_recommendations jsonb default '{}'::jsonb,
  seo_keywords text[] default '{}',
  virality_score integer,
  emotional_resonance_score integer,
  save_potential_score integer,
  trust_building_score integer,
  conversion_score integer,
  seo_score integer,
  pinterest_potential_score integer,
  ai_search_potential_score integer,
  emotional_angle text,
  visual_direction text,
  product_tie_in text,
  service_tie_in text,
  cta text,
  clinical_sensitivity text,
  status text default 'idea',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint content_opportunities_clinical_sensitivity_check check (clinical_sensitivity is null or clinical_sensitivity in ('low', 'medium', 'high')),
  constraint content_opportunities_status_check check (status in ('idea', 'draft', 'generated', 'archived'))
);

create table if not exists media_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  description text,
  asset_type text not null,
  source text,
  platform text,
  content_pillar text,
  product_tie_in text,
  service_tie_in text,
  campaign_id uuid,
  linked_content_id uuid references generated_content(id) on delete set null,
  media_url text,
  thumbnail_url text,
  text_content text,
  prompt text,
  tags text[] default '{}',
  status text default 'saved',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint media_library_status_check check (status in ('draft', 'saved', 'approved', 'used', 'archived'))
);

create table if not exists gold_standard_examples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  platform text,
  topic text,
  subtopic text,
  audience text,
  content_type text,
  hook text,
  full_content text not null,
  cta text,
  tags text[] default '{}',
  collection text,
  story_framework text,
  emotional_destination text,
  why_gold_standard text,
  notes text,
  status text default 'approved',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint gold_standard_examples_status_check check (status in ('draft', 'approved', 'archived'))
);

create index if not exists gold_standard_examples_user_idx
on gold_standard_examples(user_id);

create index if not exists gold_standard_examples_user_topic_idx
on gold_standard_examples(user_id, topic);

create index if not exists gold_standard_examples_user_platform_idx
on gold_standard_examples(user_id, platform);

create index if not exists gold_standard_examples_user_content_type_idx
on gold_standard_examples(user_id, content_type);

create index if not exists gold_standard_examples_tags_idx
on gold_standard_examples using gin(tags);

create table if not exists story_frameworks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  framework_name text not null,
  purpose text,
  when_to_use text,
  best_platforms text[] default '{}',
  best_content_types text[] default '{}',
  writing_rhythm text,
  psychological_goal text,
  emotional_destination text,
  typical_hook_styles text[] default '{}',
  paragraph_rhythm text,
  sentence_rhythm text,
  education_level integer,
  emotion_level integer,
  curiosity_level integer,
  story_level integer,
  therapist_insight_level integer,
  saveability_score integer,
  shareability_score integer,
  example_gold_standard_posts text[] default '{}',
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint story_frameworks_status_check check (status in ('active', 'archived'))
);

alter table gold_standard_examples add column if not exists story_framework text;
alter table gold_standard_examples add column if not exists emotional_destination text;

create index if not exists story_frameworks_user_idx
on story_frameworks(user_id);

create index if not exists story_frameworks_user_status_idx
on story_frameworks(user_id, status);

create index if not exists story_frameworks_name_idx
on story_frameworks(framework_name);

create table if not exists content_packs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid references content_opportunities(id) on delete set null,
  title text not null,
  status text default 'draft',
  source_topic text,
  audience text,
  content_pillar text,
  product_tie_in text,
  service_tie_in text,
  clinical_sensitivity text,
  design_status text default 'not_started',
  canva_template_id uuid,
  canva_design_id text,
  canva_design_url text,
  canva_autofill_enabled boolean default false,
  placeholder_mapping jsonb default '{}'::jsonb,
  pack jsonb default '{}'::jsonb,
  canva_brief jsonb default '{}'::jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint content_packs_status_check check (status in ('draft', 'needs_review', 'approved', 'scheduled', 'posted', 'failed')),
  constraint content_packs_design_status_check check (design_status in ('not_started', 'ready_for_canva', 'design_started', 'designed_in_canva')),
  constraint content_packs_clinical_sensitivity_check check (clinical_sensitivity is null or clinical_sensitivity in ('low', 'medium', 'high'))
);

create table if not exists canva_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  canva_template_id text,
  template_name text not null,
  canva_template_link text not null,
  content_type text,
  format_type text not null,
  dimensions text,
  platform_size text,
  number_of_slides integer,
  aesthetic_vibe text,
  visual_style_notes text,
  color_palette text,
  font_style text,
  graphic_style text,
  best_use_case text,
  audience_fit text,
  content_pillar_fit text,
  slide_structure_rules jsonb default '{}'::jsonb,
  canva_design_id text,
  canva_design_url text,
  canva_autofill_enabled boolean default false,
  placeholder_mapping jsonb default '{}'::jsonb,
  recommended_for text[] default '{}',
  approval_status text default 'draft',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint canva_templates_approval_status_check check (approval_status in ('draft', 'approved', 'archived'))
);

create index if not exists canva_templates_user_status_idx
on canva_templates(user_id, approval_status);

create index if not exists canva_templates_format_type_idx
on canva_templates(format_type);

create index if not exists canva_templates_content_type_idx
on canva_templates(content_type);

create index if not exists canva_templates_canva_template_id_idx
on canva_templates(canva_template_id);

create table if not exists content_calendar_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_pack_id uuid references content_packs(id) on delete set null,
  planned_date date not null,
  status text default 'idea',
  campaign_label text,
  focus_label text,
  seasonal_prompt text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint content_calendar_plans_status_check check (status in ('idea', 'draft', 'needs_review', 'approved', 'scheduled', 'posted', 'failed'))
);

create index if not exists content_calendar_plans_user_date_idx
on content_calendar_plans(user_id, planned_date);

create index if not exists content_calendar_plans_pack_idx
on content_calendar_plans(content_pack_id);

create table if not exists content_calendar_focuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  focus text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists content_calendar_focuses_user_week_idx
on content_calendar_focuses(user_id, week_start);

create table if not exists social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  platform text not null,
  account_name text,
  status text default 'not_connected',
  access_token_encrypted text,
  created_at timestamptz default now()
);

create table if not exists integration_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  account_name text,
  status text default 'prepared',
  access_token_encrypted text,
  refresh_token_encrypted text,
  expires_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint integration_connections_provider_check check (provider in ('canva', 'instagram', 'facebook', 'tiktok', 'linkedin', 'youtube')),
  constraint integration_connections_status_check check (status in ('not_connected', 'prepared', 'connected', 'expired', 'revoked'))
);

create unique index if not exists integration_connections_user_provider_idx
on integration_connections(user_id, provider);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  content_id uuid references generated_content(id) on delete set null,
  platform text,
  event_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table business_profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table brand_brains add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table brand_brains add column if not exists brand_name text;
alter table brand_brains add column if not exists tagline text;
alter table brand_brains add column if not exists mission text;
alter table brand_brains add column if not exists personality_sliders jsonb default '{}'::jsonb;
alter table brand_brains add column if not exists voice_tone jsonb default '{}'::jsonb;
alter table brand_brains add column if not exists forbidden_ai_phrases text[] default '{}';
alter table brand_brains add column if not exists audience_profiles jsonb default '[]'::jsonb;
alter table brand_brains add column if not exists therapy_services jsonb default '[]'::jsonb;
alter table brand_brains add column if not exists product_catalog jsonb default '[]'::jsonb;
alter table brand_brains add column if not exists visual_identity jsonb default '{}'::jsonb;
alter table brand_brains add column if not exists clinical_safety_rules jsonb default '{}'::jsonb;
alter table brand_brains add column if not exists ai_instruction_layer jsonb default '{}'::jsonb;
alter table brand_brains add column if not exists seo_priorities text[] default '{}';
alter table brand_brains add column if not exists preferred_cta_styles text[] default '{}';
alter table brand_brains add column if not exists preferred_platforms text[] default '{}';
alter table brand_brains add column if not exists content_goals text[] default '{}';
alter table brand_brains add column if not exists conversion_priorities text[] default '{}';
alter table generated_content add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table generated_content alter column status set default 'draft';
alter table generated_content add column if not exists topic text;
alter table generated_content add column if not exists content_angle text;
alter table generated_content add column if not exists canva_design_url text;
alter table generated_content add column if not exists canva_template_id text;
alter table generated_content add column if not exists content_pack_id uuid references content_packs(id) on delete set null;
alter table generated_content add column if not exists converted_at timestamptz;
alter table generated_content add column if not exists is_generation_history boolean default true;
create index if not exists generated_content_content_pack_id_idx
on generated_content(content_pack_id);
alter table generated_content add column if not exists archived boolean default false;
alter table generated_content add column if not exists content_intelligence_brief jsonb default '{}'::jsonb;
alter table generated_content add column if not exists why_this_works jsonb default '{}'::jsonb;
alter table content_opportunities add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table content_opportunities add column if not exists topic text;
alter table content_opportunities add column if not exists explanation text;
alter table content_opportunities add column if not exists strongest_emotional_hook text;
alter table content_opportunities add column if not exists curiosity_angle text;
alter table content_opportunities add column if not exists save_worthy_angle text;
alter table content_opportunities add column if not exists share_worthy_angle text;
alter table content_opportunities add column if not exists comment_bait_potential text;
alter table content_opportunities add column if not exists emotional_trigger_category text;
alter table content_opportunities add column if not exists audience text;
alter table content_opportunities add column if not exists content_pillar text;
alter table content_opportunities add column if not exists platform_recommendations jsonb default '{}'::jsonb;
alter table content_opportunities add column if not exists seo_keywords text[] default '{}';
alter table content_opportunities add column if not exists virality_score integer;
alter table content_opportunities add column if not exists emotional_resonance_score integer;
alter table content_opportunities add column if not exists save_potential_score integer;
alter table content_opportunities add column if not exists trust_building_score integer;
alter table content_opportunities add column if not exists conversion_score integer;
alter table content_opportunities add column if not exists seo_score integer;
alter table content_opportunities add column if not exists pinterest_potential_score integer;
alter table content_opportunities add column if not exists ai_search_potential_score integer;
alter table content_opportunities add column if not exists emotional_angle text;
alter table content_opportunities add column if not exists visual_direction text;
alter table content_opportunities add column if not exists product_tie_in text;
alter table content_opportunities add column if not exists service_tie_in text;
alter table content_opportunities add column if not exists cta text;
alter table content_opportunities add column if not exists clinical_sensitivity text;
alter table content_opportunities add column if not exists status text default 'idea';
alter table media_library add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table media_library add column if not exists title text;
alter table media_library add column if not exists description text;
alter table media_library add column if not exists asset_type text;
alter table media_library add column if not exists source text;
alter table media_library add column if not exists platform text;
alter table media_library add column if not exists content_pillar text;
alter table media_library add column if not exists product_tie_in text;
alter table media_library add column if not exists service_tie_in text;
alter table media_library add column if not exists campaign_id uuid;
alter table media_library add column if not exists linked_content_id uuid references generated_content(id) on delete set null;
alter table media_library add column if not exists media_url text;
alter table media_library add column if not exists thumbnail_url text;
alter table media_library add column if not exists text_content text;
alter table media_library add column if not exists prompt text;
alter table media_library add column if not exists tags text[] default '{}';
alter table media_library add column if not exists status text default 'saved';
alter table media_library add column if not exists metadata jsonb default '{}'::jsonb;
alter table content_packs add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table content_packs add column if not exists opportunity_id uuid references content_opportunities(id) on delete set null;
alter table content_packs add column if not exists title text;
alter table content_packs add column if not exists status text default 'draft';
alter table content_packs add column if not exists source_topic text;
alter table content_packs add column if not exists audience text;
alter table content_packs add column if not exists content_pillar text;
alter table content_packs add column if not exists product_tie_in text;
alter table content_packs add column if not exists service_tie_in text;
alter table content_packs add column if not exists clinical_sensitivity text;
alter table content_packs add column if not exists design_status text default 'not_started';
alter table content_packs add column if not exists canva_template_id uuid;
alter table content_packs add column if not exists canva_design_id text;
alter table content_packs add column if not exists canva_design_url text;
alter table content_packs add column if not exists canva_autofill_enabled boolean default false;
alter table content_packs add column if not exists placeholder_mapping jsonb default '{}'::jsonb;
alter table content_packs add column if not exists pack jsonb default '{}'::jsonb;
alter table content_packs add column if not exists canva_brief jsonb default '{}'::jsonb;
alter table content_packs add column if not exists metadata jsonb default '{}'::jsonb;
alter table canva_templates add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table canva_templates add column if not exists canva_template_id text;
alter table canva_templates add column if not exists template_name text;
alter table canva_templates add column if not exists canva_template_link text;
alter table canva_templates add column if not exists content_type text;
alter table canva_templates add column if not exists format_type text;
alter table canva_templates add column if not exists dimensions text;
alter table canva_templates add column if not exists platform_size text;
alter table canva_templates add column if not exists number_of_slides integer;
alter table canva_templates add column if not exists aesthetic_vibe text;
alter table canva_templates add column if not exists visual_style_notes text;
alter table canva_templates add column if not exists color_palette text;
alter table canva_templates add column if not exists font_style text;
alter table canva_templates add column if not exists graphic_style text;
alter table canva_templates add column if not exists best_use_case text;
alter table canva_templates add column if not exists audience_fit text;
alter table canva_templates add column if not exists content_pillar_fit text;
alter table canva_templates add column if not exists slide_structure_rules jsonb default '{}'::jsonb;
alter table canva_templates add column if not exists canva_design_id text;
alter table canva_templates add column if not exists canva_design_url text;
alter table canva_templates add column if not exists canva_autofill_enabled boolean default false;
alter table canva_templates add column if not exists placeholder_mapping jsonb default '{}'::jsonb;
alter table canva_templates add column if not exists recommended_for text[] default '{}';
alter table canva_templates add column if not exists approval_status text default 'draft';
alter table canva_templates add column if not exists notes text;
alter table content_calendar_plans add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table content_calendar_plans add column if not exists content_pack_id uuid references content_packs(id) on delete set null;
alter table content_calendar_plans add column if not exists planned_date date;
alter table content_calendar_plans add column if not exists status text default 'idea';
alter table content_calendar_plans add column if not exists campaign_label text;
alter table content_calendar_plans add column if not exists focus_label text;
alter table content_calendar_plans add column if not exists seasonal_prompt text;
alter table content_calendar_plans add column if not exists notes text;
alter table content_calendar_focuses add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table content_calendar_focuses add column if not exists week_start date;
alter table content_calendar_focuses add column if not exists focus text default '';
alter table social_accounts add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table analytics_events add column if not exists user_id uuid references auth.users(id) on delete cascade;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists business_profiles_updated_at on business_profiles;
create trigger business_profiles_updated_at
before update on business_profiles
for each row execute procedure set_updated_at();

drop trigger if exists brand_brains_updated_at on brand_brains;
create trigger brand_brains_updated_at
before update on brand_brains
for each row execute procedure set_updated_at();

drop trigger if exists generated_content_updated_at on generated_content;
create trigger generated_content_updated_at
before update on generated_content
for each row execute procedure set_updated_at();

drop trigger if exists content_opportunities_updated_at on content_opportunities;
create trigger content_opportunities_updated_at
before update on content_opportunities
for each row execute procedure set_updated_at();

drop trigger if exists media_library_updated_at on media_library;
create trigger media_library_updated_at
before update on media_library
for each row execute procedure set_updated_at();

drop trigger if exists gold_standard_examples_updated_at on gold_standard_examples;
create trigger gold_standard_examples_updated_at
before update on gold_standard_examples
for each row execute procedure set_updated_at();

drop trigger if exists story_frameworks_updated_at on story_frameworks;
create trigger story_frameworks_updated_at
before update on story_frameworks
for each row execute procedure set_updated_at();

drop trigger if exists content_packs_updated_at on content_packs;
create trigger content_packs_updated_at
before update on content_packs
for each row execute procedure set_updated_at();

drop trigger if exists canva_templates_updated_at on canva_templates;
create trigger canva_templates_updated_at
before update on canva_templates
for each row execute procedure set_updated_at();

drop trigger if exists content_calendar_plans_updated_at on content_calendar_plans;
create trigger content_calendar_plans_updated_at
before update on content_calendar_plans
for each row execute procedure set_updated_at();

drop trigger if exists content_calendar_focuses_updated_at on content_calendar_focuses;
create trigger content_calendar_focuses_updated_at
before update on content_calendar_focuses
for each row execute procedure set_updated_at();

drop trigger if exists integration_connections_updated_at on integration_connections;
create trigger integration_connections_updated_at
before update on integration_connections
for each row execute procedure set_updated_at();

alter table business_profiles enable row level security;
alter table brand_brains enable row level security;
alter table generated_content enable row level security;
alter table content_opportunities enable row level security;
alter table media_library enable row level security;
alter table gold_standard_examples enable row level security;
alter table story_frameworks enable row level security;
alter table content_packs enable row level security;
alter table canva_templates enable row level security;
alter table content_calendar_plans enable row level security;
alter table content_calendar_focuses enable row level security;
alter table social_accounts enable row level security;
alter table analytics_events enable row level security;
alter table integration_connections enable row level security;

drop policy if exists "Users can manage their business profiles" on business_profiles;
create policy "Users can manage their business profiles"
on business_profiles for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their brand brain" on brand_brains;
create policy "Users can manage their brand brain"
on brand_brains for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their generated content" on generated_content;
create policy "Users can manage their generated content"
on generated_content for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their content opportunities" on content_opportunities;
create policy "Users can manage their content opportunities"
on content_opportunities for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their media library" on media_library;
create policy "Users can manage their media library"
on media_library for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their gold standard examples" on gold_standard_examples;
create policy "Users can manage their gold standard examples"
on gold_standard_examples for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their story frameworks" on story_frameworks;
create policy "Users can manage their story frameworks"
on story_frameworks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their content packs" on content_packs;
create policy "Users can manage their content packs"
on content_packs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their canva templates" on canva_templates;
create policy "Users can manage their canva templates"
on canva_templates for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their content calendar plans" on content_calendar_plans;
create policy "Users can manage their content calendar plans"
on content_calendar_plans for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their content calendar focuses" on content_calendar_focuses;
create policy "Users can manage their content calendar focuses"
on content_calendar_focuses for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their social accounts" on social_accounts;
create policy "Users can manage their social accounts"
on social_accounts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their analytics events" on analytics_events;
create policy "Users can manage their analytics events"
on analytics_events for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their integrations" on integration_connections;
create policy "Users can manage their integrations"
on integration_connections for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
