import { createClient } from '@supabase/supabase-js'

// HANYA pakai di server-side, jangan expose ke client!
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)