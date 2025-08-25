# Micro Feed

A tiny "micro feed" built with Next.js, TypeScript, and Supabase where authenticated users can create, interact with, and manage short posts.

## Features

- 🔐 **Authentication**: GitHub OAuth via Supabase
- ✍️ **Create Posts**: Text posts up to 280 characters
- 📱 **Interactive Feed**: Paginated posts with real-time like counts
- 🔍 **Search**: Server-side search filtering
- ❤️ **Like/Unlike**: Optimistic UI updates
- ✏️ **Edit/Delete**: Manage your own posts
- 🔄 **Filter**: View all posts or just your own
- 📱 **Responsive**: Works on desktop and mobile

## Setup Instructions

### Prerequisites

- Node.js 18.17.0 or higher
- A Supabase account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd micro-feed
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the schema:

```sql
-- auth.users is given
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

-- row level security
alter table profiles enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;

-- profiles: read all, write self
create policy "read profiles" on profiles for select using (true);
create policy "upsert self profile" on profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

-- posts: read all; insert/update/delete only own
create policy "read posts" on posts for select using (true);
create policy "insert own posts" on posts for insert with check (auth.uid() = author_id);
create policy "update own posts" on posts for update using (auth.uid() = author_id);
create policy "delete own posts" on posts for delete using (auth.uid() = author_id);

-- likes: read all; like/unlike as self
create policy "read likes" on likes for select using (true);
create policy "like" on likes for insert with check (auth.uid() = user_id);
create policy "unlike" on likes for delete using (auth.uid() = user_id);
```

3. Set up GitHub OAuth:
   - Go to Authentication > Providers in your Supabase dashboard
   - Enable GitHub provider
   - Create a GitHub OAuth app with callback URL: `https://your-project.supabase.co/auth/v1/callback`
   - Add the GitHub client ID and secret to Supabase

### 3. Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Database Seeding (Optional)

After authentication setup, you can create a test profile by logging in. The app will automatically create a profile entry when you first sign in.

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Design Notes

### Architecture Decisions

**Route Handlers vs Server Actions**: I chose **API Route handlers** over Server Actions for this project because:
- **Explicit API boundaries**: Route handlers provide clear REST-like endpoints that are easier to test and debug
- **Better error handling**: More granular control over HTTP status codes and error responses
- **Client-side flexibility**: Easier to implement optimistic updates and complex client-side state management
- **Future extensibility**: API routes make it easier to add features like rate limiting, analytics, or external integrations

### Error Handling Strategy

- **Client-side validation**: Zod schemas validate inputs before submission
- **Server-side validation**: Double validation on the API routes with proper error responses
- **Optimistic UI**: Immediate feedback with graceful rollback on failures
- **User-friendly messages**: Error states show actionable messages rather than technical details

### Optimistic Updates

- **Likes**: Immediately toggle heart and update count, revert on API failure
- **Post creation**: Add post to feed immediately, remove if API call fails
- **Performance benefit**: Users see instant feedback without waiting for server roundtrip

### Row Level Security (RLS) Assumptions

- **Profiles**: Users can read all profiles but only modify their own
- **Posts**: Public read access, but users can only create/edit/delete their own posts
- **Likes**: Public read access, users can only like/unlike as themselves
- **Cascading deletes**: When a user is deleted, all their posts and likes are automatically removed

## Tradeoffs & Timeboxing

### What's Included ✅
- Full CRUD operations for posts
- Real-time like functionality
- Search and filtering
- Responsive design
- Optimistic UI updates
- Proper error handling
- Row-level security

### What Was Skipped ⏭️
- **Rich text editing**: Kept to plain text for simplicity
- **Image uploads**: Text-only posts to focus on core functionality  
- **Real-time subscriptions**: Could add Supabase realtime for live updates
- **Advanced pagination**: Used cursor-based but could optimize further
- **Push notifications**: Would require service worker setup
- **Admin features**: No moderation or admin panel
- **Testing**: Focused on functionality over test coverage
- **Performance optimization**: Basic optimization, could add caching layers

### Future Enhancements 🚀
- User profiles and avatars
- Post threading/replies
- Hashtags and mentions
- Real-time notifications
- Mobile app version
- Advanced search filters
- Content moderation tools

## Project Structure

```
app/
  layout.tsx              # Root layout with global styles
  page.tsx               # Main feed page component
  globals.css            # Tailwind CSS imports
  api/
    posts/route.ts       # POST /api/posts, GET /api/posts
    posts/[id]/route.ts  # PATCH, DELETE /api/posts/:id
    posts/[id]/like/route.ts # POST, DELETE like endpoints
components/
  post-card.tsx          # Individual post display and actions
  composer.tsx           # Post creation form
  search-bar.tsx         # Search input with debouncing
  toolbar.tsx            # Filter controls and search
hooks/
  use-posts.ts           # Posts fetching and pagination
  use-mutate-post.ts     # Create, update, delete operations
  use-like.ts            # Like/unlike with optimistic updates
lib/
  db.ts                  # Supabase client configurations
  validators.ts          # Zod schemas for validation
  pagination.ts          # Cursor encoding/decoding utilities
types/
  post.ts               # TypeScript interfaces
```

## Technologies Used

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with GitHub OAuth
- **Validation**: Zod for schema validation
- **Deployment**: Vercel (recommended)

---

Built as part of the Integral Engineering assignment. Focused on clean architecture, proper error handling, and user experience.