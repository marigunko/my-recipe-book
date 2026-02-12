# My Recipe Book

A personal project inspired by my mom’s handwritten recipe book.  
This application allows users to create their own digital recipe collection, organize recipes into sections, and store ingredients and cooking instructions in a structured way.

---

## Technologies

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- TanStack Query
- Supabase (Auth + PostgreSQL + Row-Level Security)

---

## Setup

```bash
# Clone repository
git clone https://github.com/USERNAME/my-recipe-book.git
cd my-recipe-book

# Install dependencies
npm install

# Create .env.local file with Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Start development server
npm run dev
