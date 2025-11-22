import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Direct Database Check')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📡 URL:', supabaseUrl)
console.log('🔑 Using key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT FOUND')
console.log('')

const supabase = createClient(supabaseUrl, supabaseKey)

// Try to query with raw SQL
const testQuery = `
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'organizations'
) as table_exists;
`

console.log('🔍 Checking if organizations table exists...\n')

// Try direct select
const { data: orgData, error: orgError } = await supabase
  .from('organizations')
  .select('id')
  .limit(1)

if (orgError) {
  console.log('❌ MIGRATION NOT RUN!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('Error:', orgError.message)
  console.log('')
  console.log('🚨 YOU MUST RUN THE MIGRATION!')
  console.log('')
  console.log('📋 Steps:')
  console.log('1. Copy this file:')
  console.log('   cat "RUN_THIS_MIGRATION.sql"')
  console.log('')
  console.log('2. Open Supabase:')
  console.log('   https://supabase.com/dashboard/project/iiefjgytmxrjbctfqxni/sql/new')
  console.log('')
  console.log('3. Paste SQL and click RUN')
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  process.exit(1)
} else {
  console.log('✅ organizations table EXISTS!')
  console.log('📊 Found records:', orgData?.length || 0)
}
