import pg from 'pg'

const { Pool } = pg

async function main() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  })

  console.log('[v0] Connecting to database...')

  try {
    // Create profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        role TEXT DEFAULT 'client',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)
    console.log('[v0] Created profiles table')

    // Create enquiries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.enquiries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        property_address TEXT,
        property_postcode TEXT,
        transaction_type TEXT,
        property_value NUMERIC,
        quote_amount NUMERIC,
        status TEXT DEFAULT 'new',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)
    console.log('[v0] Created enquiries table')

    // Disable RLS for now to simplify access
    await pool.query('ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY')
    await pool.query('ALTER TABLE public.enquiries DISABLE ROW LEVEL SECURITY')
    console.log('[v0] Disabled RLS on tables')

    console.log('[v0] Database setup complete!')
  } catch (error) {
    console.error('[v0] Error:', error.message)
  } finally {
    await pool.end()
  }
}

main()
