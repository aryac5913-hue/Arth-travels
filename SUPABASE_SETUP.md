# Supabase setup for Arth Travels

The public site stays open to customers. The private editor is at `/#/admin` and accepts only a Supabase user whose email is in the `admin_users` allowlist.

## One-time setup

1. In the Supabase project, open **SQL Editor → New query**, paste `supabase/setup.sql`, and run it.
2. In **Authentication → Users**, create the administrator user with the email and password the client will use. Do not enable public sign-ups; customers do not need accounts.
3. In SQL Editor, run this once with that administrator email:

   ```sql
   insert into public.admin_users (email)
   values (lower('ADMIN_EMAIL_HERE'))
   on conflict (email) do nothing;
   ```

4. In the GitHub repository, open **Settings → Secrets and variables → Actions → Variables** and create:
   - `VITE_SUPABASE_URL` = the project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = the publishable key
5. Push this version to `main` to trigger a Pages build with those public client settings. The local `.env.local` already contains the project values and is git-ignored.
6. Open `https://aryac5913-hue.github.io/Arth-travels/#/admin`, sign in with the administrator account, then add or edit trips. Uploaded photos and itinerary posters are stored in Supabase Storage; published trips appear on the public Destinations page without another code change.

The publishable key is intended for browser code and is protected by the SQL Row Level Security policies. Never use a secret/service-role key in the website or GitHub Actions build variables.

## Hosting the purchased domain later

On the eventual hosting provider, set the same two `VITE_...` build variables and deploy the site. The Supabase database and uploaded media remain in place; update the Supabase Auth **Site URL** and allowed redirect URLs to include the new domain. Customer sign-in is not added.
