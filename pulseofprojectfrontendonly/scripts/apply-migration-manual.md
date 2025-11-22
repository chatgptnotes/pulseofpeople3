# Manual Migration Guide

Since we cannot run SQL migrations programmatically without direct database access, please follow these steps to apply the multi-tenant branding migration:

## Option 1: Supabase Dashboard SQL Editor (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase/migrations/06_multi_tenant_branding.sql`
5. Paste into the SQL editor
6. Click "Run" to execute the migration

## Option 2: Using psql locally (if you have it installed)

```bash
psql "postgresql://postgres:bhupendra@111@db.iiefjgytmxrjbctfqxni.supabase.co:5432/postgres?sslmode=require" \
  -f supabase/migrations/06_multi_tenant_branding.sql
```

## Option 3: Using Supabase CLI

```bash
# Link your project first (one-time setup)
supabase link --project-ref iiefjgytmxrjbctfqxni

# Run the migration
supabase db push
```

## Verification

After running the migration, verify it worked by checking that the following columns exist in the `organizations` table:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'organizations'
AND column_name IN (
  'subdomain',
  'custom_domain',
  'branding',
  'landing_page_config',
  'theme_config',
  'contact_config',
  'party_info',
  'features_enabled'
);
```

You should see 8+ new columns listed.

## Next Step

After the migration is successful, run:

```bash
node scripts/seed-multi-tenant-data.js
```

This will populate the database with BJP, TVK, and Demo tenant configurations.
