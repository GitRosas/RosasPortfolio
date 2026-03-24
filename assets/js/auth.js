// auth.js
// This file initializes the Supabase client and exports it for use in other parts of the application.
//Protected variables for the Supabase client.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://rcgwshnxndzaossmbken.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__kJp3mekUaH9AmduvdVyGw_zFiwtARf';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);