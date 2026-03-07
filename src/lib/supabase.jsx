import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey =
	import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
	import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
	throw new Error(
		'Missing VITE_SUPABASE_URL environment variable. Configure it in local .env and in Vercel Project Settings.'
	)
}

if (!supabaseAnonKey) {
	throw new Error(
		'Missing Supabase publishable key. Configure VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or VITE_SUPABASE_ANON_KEY) in local .env and Vercel.'
	)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
