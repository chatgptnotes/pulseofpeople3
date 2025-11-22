import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTenants() {
  console.log('🔍 Checking tenant configuration...\n')

  try {
    // Check if organizations table has subdomain column
    const { data: columns, error: colError } = await supabase
      .from('organizations')
      .select('*')
      .limit(1)

    if (colError) {
      console.error('❌ Error querying organizations table:', colError.message)
      console.log('\n⚠️  The migration might not be applied yet.')
      console.log('👉 Please run the migration in Supabase Dashboard SQL Editor')
      console.log('📄 File: supabase/migrations/06_multi_tenant_branding.sql\n')
      return
    }

    // Check if subdomain column exists
    if (columns && columns.length > 0) {
      const firstRow = columns[0]
      if (!('subdomain' in firstRow)) {
        console.error('❌ subdomain column not found in organizations table')
        console.log('\n⚠️  Migration NOT applied!')
        console.log('👉 Run this in Supabase Dashboard → SQL Editor:')
        console.log('📄 supabase/migrations/06_multi_tenant_branding.sql\n')
        return
      }
    }

    // Get all tenants
    const { data: tenants, error } = await supabase
      .from('organizations')
      .select('subdomain, name, is_active, branding')
      .eq('is_active', true)

    if (error) {
      console.error('❌ Error fetching tenants:', error.message)
      return
    }

    if (!tenants || tenants.length === 0) {
      console.log('❌ No tenants found in database!')
      console.log('\n👉 Run seed script:')
      console.log('   node scripts/seed-multi-tenant-data.js\n')
      return
    }

    console.log(`✅ Found ${tenants.length} tenant(s):\n`)

    tenants.forEach((tenant, index) => {
      console.log(`${index + 1}. ${tenant.name}`)
      console.log(`   Subdomain: ${tenant.subdomain}`)
      console.log(`   URL: http://${tenant.subdomain}.localhost:5173`)
      console.log(`   Active: ${tenant.is_active}`)
      console.log(`   Has Branding: ${tenant.branding ? 'Yes' : 'No'}`)
      console.log('')
    })

    console.log('✅ Tenant data looks good!')
    console.log('\n🎯 Next steps:')
    console.log('1. Make sure dev server is running: npm run dev')
    console.log('2. Update your hosts file (if not done):')
    console.log('   sudo nano /etc/hosts')
    console.log('   Add: 127.0.0.1 demo.localhost')
    console.log('3. Open: http://demo.localhost:5173')
    console.log('4. Check browser console for errors (F12)\n')

  } catch (err) {
    console.error('❌ Fatal error:', err.message)
  }
}

checkTenants()
