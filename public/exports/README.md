# ICAN CBT — Database Export Guide

## What's Included

### 1. Schema File: `full-schema.sql`
Contains the complete database structure:
- All 8 tables (exams, exam_sections, questions, sub_questions, exam_attempts, user_credits, profiles, user_roles)
- All RLS policies for security
- All triggers (auto-create profiles, updated_at)
- All functions (has_role, handle_new_user)
- Storage bucket for exam images
- Performance indexes

### 2. How to Use

#### Step 1: Create an External Supabase Project
1. Go to https://supabase.com and create a new project
2. Go to **SQL Editor** in the Supabase dashboard

#### Step 2: Run the Schema
1. Open `full-schema.sql`
2. Paste the entire contents into the SQL Editor
3. Click **Run** — this creates all tables, policies, triggers, and functions

#### Step 3: Import Exam Data
Since this project has a JSON import feature built in, the easiest way to import exams is:
1. Export each exam as JSON from your current app's admin panel
2. Use the JSON Import dialog in your new deployment to re-import them

Alternatively, you can use the Supabase dashboard's **Table Editor** to manually insert data.

#### Step 4: Configure Edge Functions
1. Copy `supabase/functions/grade-answers/index.ts` to your new project
2. Deploy using `supabase functions deploy grade-answers`
3. Set the `DEEPSEEK_API_KEY` secret: `supabase secrets set DEEPSEEK_API_KEY=your_key`

#### Step 5: Update Frontend Config
In your frontend code, update:
- `VITE_SUPABASE_URL` → your new project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` → your new anon key

#### Step 6: Create Admin User
After a user signs up, manually add them as admin:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin');
```

## Current Data Summary
- **16 exams** across all ICAN subjects
- **26 questions** with scenarios, financial tables, and LaTeX formulas
- **~25+ sub-questions** with model answers, hints, and key points
- **5 users** registered
- **2 users** with credits
- Multiple exam attempts recorded
