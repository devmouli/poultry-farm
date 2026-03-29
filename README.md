# PoultryConnect MVP

A fully functional, end-to-end B2B marketplace connecting **Poultry Farmers** and **Traders**.

## Features

- **Authentication**: Role-based signup (Farmer vs Trader).
- **Farmer Dashboard**: Setup a farm profile, create batches of birds, and accept/reject incoming orders from traders.
- **Trader Dashboard**: Browse the open market, filter batches by location, and place orders directly to the farmers.
- **Real-Time Data**: Powered by a robust **Supabase PostgreSQL** backend.

## How to Deploy Your Live URL

Since this application requires your secure database credentials, follow this simple 3-step process:

### 1. Setup Database (Supabase)
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Navigate to the **SQL Editor** in the left sidebar.
3. Open the `supabase-schema.sql` file located in this repository's root directory, copy its contents, and run it in the SQL Editor. (This will instantly create all tables, schemas, and Row Level Security policies).

### 2. Connect Credentials
1. In Supabase, go to **Project Settings** -> **API**.
2. Copy the `Project URL` and the `anon / public` key.
3. Head over to [Vercel](https://vercel.com) to deploy your app.

### 3. Deploy to Vercel (1 Minute)
1. Push this entire folder to a new GitHub repository.
2. In Vercel, click **Add New Project** and import your GitHub repository.
3. In the environment variables section before deploying, add the following two keys:
   - `NEXT_PUBLIC_SUPABASE_URL` = (Your copied Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (Your copied anon key)
4. Click **Deploy**.

**Congratulations!** You now have a live URL under your Vercel account that you can share with Farmers and Traders.
