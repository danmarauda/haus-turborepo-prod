/**
 * Supabase Client Configuration (Optional Integration)
 *
 * This file provides Supabase client setup for features like:
 * - Realtime subscriptions
 * - Storage (file uploads)
 * - Edge Functions
 * - Row Level Security policies
 *
 * To enable Supabase alongside Convex:
 * 1. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env
 * 2. Uncomment the createClient export
 * 3. Use for specific features while keeping Convex as primary backend
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables (set these in your .env.local)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Validates Supabase configuration
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Creates a Supabase client for optional use
 * Note: This is disabled by default since HAUS uses Convex as the primary backend
 * Enable this if you want to add Supabase-specific features
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: require('@react-native-async-storage/async-storage').default,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

/**
 * Example Supabase integrations:
 *
 * 1. Realtime subscriptions for property updates:
 *    supabase?.channel('properties').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'properties' }, payload => { ... }).subscribe()
 *
 * 2. File uploads to Supabase Storage:
 *    const { data, error } = await supabase?.storage.from('property-images').upload('path/to/file', fileBlob)
 *
 * 3. Edge Functions for server-side logic:
 *    const { data, error } = await supabase?.functions.invoke('process-payment', { body: { amount: 100 } })
 */
