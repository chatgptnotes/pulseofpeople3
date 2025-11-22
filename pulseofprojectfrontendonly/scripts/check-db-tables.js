import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('🔍 Checking database tables...\n')
  console.log('Database:', supabaseUrl)
  console.log('')

  // List all tables
  const { data, error } = await supabase.rpc('get_tables')

  if (error) {
    console.log('⚠️  RPC not available. Trying direct query...\n')

    // Try querying information_schema
    const { data: tables, error: err2 } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    if (err2) {
      console.log('❌ Cannot query information_schema')
      console.log('Error:', err2.message)
      console.log('\n📝 Trying to list tables manually...\n')

      // Try querying some expected tables
      const tablesToCheck = ['organizations', 'users', 'states', 'districts']

      for (const table of tablesToCheck) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (error) {
          if (error.code === '42P01') {
            console.log(`❌ ${table} - NOT FOUND`)
          } else {
            console.log(`⚠️  ${table} - Error: ${error.message}`)
          }
        } else {
          console.log(`✅ ${table} - EXISTS (${data?.length || 0} rows sampled)`)
        }
      }
    } else {
      console.log('Found tables:', tables)
    }
  } else {
    console.log('Tables:', data)
  }
}

checkTables()
