# Micro Feed

A lightweight social feed built with Next.js, TypeScript, and Supabase where authenticated users can create, interact with, and manage short posts.

## Features

- 🔐 **Authentication**: Email, GitHub, Google OAuth via Supabase
- ✍️ **Create Posts**: Text posts up to 280 characters
- 📱 **Interactive Feed**: Paginated posts with real-time like counts
- 🔍 **Search & Filter**: Server-side search with user filtering
- ❤️ **Like/Unlike**: Optimistic UI updates
- ✏️ **Edit/Delete**: Manage your own posts
- 📱 **Responsive Design**: Works on desktop and mobile

## Setup Instructions

### Prerequisites
- Node.js 23.6.1 or higher
- A Supabase account

### 1. Clone and Install
```bash
git clone https://github.com/oladokun-o/Micro-Feed.git
cd micro-feed
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Use https://your-app.netlify.app for production
```

### 3. Database Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema in the SQL Editor:

<details>
<summary>Click to expand SQL schema</summary>

```sql
-- Create tables
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 280),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists likes (
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

-- Enable RLS
alter table profiles enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;

-- Profiles policies
create policy "read profiles" on profiles for select using (true);
create policy "upsert self profile" on profiles for all using (auth.uid() = id);

-- Posts policies
create policy "read posts" on posts for select using (true);
create policy "insert own posts" on posts for insert with check (auth.uid() = author_id);
create policy "update own posts" on posts for update using (auth.uid() = author_id);
create policy "delete own posts" on posts for delete using (auth.uid() = author_id);

-- Likes policies
create policy "read likes" on likes for select using (true);
create policy "like" on likes for insert with check (auth.uid() = user_id);
create policy "unlike" on likes for delete using (auth.uid() = user_id);
```

</details>

3. **Set up OAuth providers**:
   - Go to Authentication > Providers in Supabase dashboard
   - Enable GitHub, Google, and Email providers
   - For GitHub: Create OAuth app with callback `https://your-project.supabase.co/auth/v1/callback?flowName=GeneralOAuthFlow`
   - For Google: Set up OAuth app in Google Console with same callback pattern
   - Configure each provider with their respective client IDs and secrets
   - **Important**: Update callback URLs to include your Netlify domain for production

### 4. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000`

## Design Notes

**Routing Strategy**: I chose **API Route handlers** over Server Actions for explicit API boundaries, better error handling with granular HTTP status codes, and easier client-side optimistic updates. This approach provides more flexibility for complex state management and future extensibility (rate limiting, analytics, external integrations).

**Error Handling & Optimistic UI**: The app implements client-side Zod validation with server-side double validation. Optimistic updates provide immediate feedback for likes and post creation, with graceful rollback on API failures. Users see instant responses without waiting for server roundtrips, improving perceived performance.

**Row Level Security**: Profiles are publicly readable but users can only modify their own. Posts have public read access with author-only write permissions. Likes follow the same pattern with cascading deletes to maintain data consistency when users are removed.

## Tradeoffs & Timeboxing

**Prioritized for MVP**: Full CRUD operations, real-time likes, search/filtering, responsive design, optimistic UI, and proper security with RLS.

**Consciously Skipped**: 
- **Rich text/images**: Kept text-only to focus on core functionality and avoid complex upload handling
- **Real-time subscriptions**: Could add Supabase realtime but adds complexity without major UX benefit for this scale
- **Advanced features**: User profiles, threading, hashtags, notifications, admin tools - all valuable but beyond scope
- **Testing**: Prioritized working features over test coverage given time constraints
- **Performance optimization**: Basic optimization implemented, advanced caching/CDN could be added later

These decisions allowed focus on core social feed functionality with proper architecture that supports future enhancements.

## Technologies Used

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Supabase PostgreSQL
- **Authentication**: Supabase Auth (Email, GitHub, Google)
- **Validation**: Zod schemas
- **Deployment**: Netlify

## Live Demo

🚀 **[View Live App](https://micro-feed.netlify.app/)**

---

*Built for Integral Engineering assignment - focused on clean architecture, user experience, and scalable foundations.*