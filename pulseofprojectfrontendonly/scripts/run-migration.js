import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://iiefjgytmxrjbctfqxni.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🚀 Running multi-tenant branding migration...\n')

  try {
    // Read migration SQL file
    const migrationPath = path.resolve(__dirname, '../supabase/migrations/06_multi_tenant_branding.sql')
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration file loaded')
    console.log('🔗 Connected to Supabase:', supabaseUrl)
    console.log('⚡ Executing SQL migration...\n')

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      // Skip comment-only statements
      if (statement.startsWith('--') || statement.trim().length === 0) continue

      console.log(`[${i + 1}/${statements.length}] Executing statement...`)

      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' })

      if (error) {
        // Check if error is benign (e.g., column already exists)
        if (
          error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          error.code === '42701' || // Duplicate column
          error.code === '42P07' // Duplicate table
        ) {
          console.log(`   ⚠️  Skipped (already exists): ${error.message.substring(0, 80)}`)
          continue
        }

        throw error
      }

      console.log(`   ✅ Success`)
    }

    console.log('\n✨ Migration completed successfully!')
    console.log('📊 New columns added to organizations table:')
    console.log('   - subdomain')
    console.log('   - custom_domain')
    console.log('   - branding')
    console.log('   - landing_page_config')
    console.log('   - theme_config')
    console.log('   - contact_config')
    console.log('   - party_info')
    console.log('   - features_enabled')
    console.log('   - usage_limits')
    console.log('   - seo_config')
    console.log('   - custom_css')
    console.log('   - custom_js')
    console.log('   - analytics_tracking_id')
    console.log('   - domain_verified')
    console.log('   - is_public')
    console.log('   - allow_registration\n')

    return true
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error('Full error:', error)
    return false
  }
}

// Run migration
runMigration()
  .then(success => {
    if (success) {
      console.log('✅ All done! You can now run: node scripts/seed-multi-tenant-data.js')
      process.exit(0)
    } else {
      console.log('❌ Migration failed. Please check the error above.')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
