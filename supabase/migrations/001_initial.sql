-- ========================================
-- いぬルーツ 初期スキーマ
-- ========================================

-- ユーザープロフィール（auth.usersに紐付け）
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  prefecture text,
  created_at timestamptz default now()
);

-- 犬の基本情報
create table if not exists dogs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles on delete cascade not null,
  name text not null,
  breed text not null,
  breed_en text,
  gender text check (gender in ('male','female')),
  birth_date date,
  color text,
  photo_url text,
  ai_portrait_url text,
  is_public boolean default true,
  created_at timestamptz default now()
);

-- 血統書情報
create table if not exists pedigree_records (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid references dogs on delete cascade not null,
  registration_no text,
  registration_org text,
  registered_name text,
  created_at timestamptz default now()
);

-- 家系関係（親子リンク）
create table if not exists dog_relationships (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references dogs on delete cascade not null,
  parent_id uuid references dogs on delete cascade not null,
  role text check (role in ('sire','dam')) not null,
  generation int default 1,
  unique(child_id, role)
);

-- ドッグラン・カフェ施設
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('dog_run','dog_cafe','vet','groomer','other')) not null,
  address text,
  prefecture text,
  lat double precision,
  lng double precision,
  google_place_id text unique,
  phone text,
  website text,
  hours jsonb,
  features text[],
  avg_rating double precision,
  review_count int default 0,
  created_at timestamptz default now()
);

-- 施設レビュー
create table if not exists location_reviews (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations on delete cascade not null,
  user_id uuid references profiles on delete cascade not null,
  dog_id uuid references dogs on delete set null,
  rating int check (rating between 1 and 5),
  comment text,
  photos text[],
  created_at timestamptz default now(),
  unique(location_id, user_id)
);

-- 手作りフードレシピ
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete set null,
  title text not null,
  description text,
  target_breed text,
  target_size text check (target_size in ('small','medium','large','all')),
  target_age text check (target_age in ('puppy','adult','senior','all')),
  ingredients jsonb not null default '[]',
  steps jsonb not null default '[]',
  nutrition_notes text,
  caution text,
  is_ai_generated boolean default false,
  likes_count int default 0,
  created_at timestamptz default now()
);

-- コミュニティ投稿
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade not null,
  dog_id uuid references dogs on delete set null,
  breed text not null,
  content text not null,
  photos text[],
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamptz default now()
);

-- コメント
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts on delete cascade not null,
  user_id uuid references profiles on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- ========================================
-- RLS（Row Level Security）の設定
-- ========================================
alter table profiles enable row level security;
alter table dogs enable row level security;
alter table pedigree_records enable row level security;
alter table dog_relationships enable row level security;
alter table locations enable row level security;
alter table location_reviews enable row level security;
alter table recipes enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;

-- ── profiles ──
create policy "誰でも公開プロフィールを閲覧可" on profiles
  for select using (true);

create policy "自分のプロフィールを管理" on profiles
  for all using (auth.uid() = id);

-- ── dogs ──
create policy "公開されている犬は誰でも閲覧可" on dogs
  for select using (is_public = true);

create policy "オーナーは自分の犬を全操作" on dogs
  for all using (auth.uid() = owner_id);

-- ── pedigree_records ──
create policy "犬のオーナーが血統書を管理" on pedigree_records
  for all using (
    auth.uid() = (select owner_id from dogs where id = dog_id)
  );

create policy "公開犬の血統書は閲覧可" on pedigree_records
  for select using (
    exists (select 1 from dogs where id = dog_id and is_public = true)
  );

-- ── dog_relationships ──
create policy "犬のオーナーが家系を管理" on dog_relationships
  for all using (
    auth.uid() = (select owner_id from dogs where id = child_id)
  );

create policy "公開犬の家系は閲覧可" on dog_relationships
  for select using (
    exists (select 1 from dogs where id = child_id and is_public = true)
  );

-- ── locations ──
create policy "施設は誰でも閲覧可" on locations
  for select using (true);

-- ── location_reviews ──
create policy "レビューは誰でも閲覧可" on location_reviews
  for select using (true);

create policy "自分のレビューを管理" on location_reviews
  for all using (auth.uid() = user_id);

-- ── recipes ──
create policy "レシピは誰でも閲覧可" on recipes
  for select using (true);

create policy "自分のレシピを管理" on recipes
  for all using (auth.uid() = user_id);

-- ── posts ──
create policy "投稿は誰でも閲覧可" on posts
  for select using (true);

create policy "自分の投稿を管理" on posts
  for all using (auth.uid() = user_id);

-- ── comments ──
create policy "コメントは誰でも閲覧可" on comments
  for select using (true);

create policy "自分のコメントを管理" on comments
  for all using (auth.uid() = user_id);

-- ========================================
-- ユーザー登録時にプロフィールを自動作成
-- ========================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ========================================
-- Storage バケット設定（Supabase Dashboardで設定、参照のみ）
-- ========================================
-- バケット名: dog-photos
-- 公開: true
-- 最大ファイルサイズ: 5MB
-- 許可MIME: image/jpeg, image/png, image/webp
