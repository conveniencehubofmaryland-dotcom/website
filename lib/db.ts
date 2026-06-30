import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function dbInsert<T extends Record<string, any>>(
  table: string,
  data: T
): Promise<{ data: any; error: any }> {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data: result, error } = await supabase
      .from(table)
      .insert([data])
      .select()
    return { data: result, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

export async function dbSelectAuth<T>(
  table: string,
  token: string,
  filters?: Record<string, string>
): Promise<T[]> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    let query = supabase.from(table).select('*')
    
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.filter(key, value)
      }
    }
    
    const { data, error } = await query
    if (error) throw error
    return data as T[]
  } catch (err) {
    console.error(`[db] select error on ${table}:`, err)
    return []
  }
}

export async function dbUpdate<T extends Record<string, any>>(
  table: string,
  id: string,
  data: Partial<T>
): Promise<{ data: any; error: any }> {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
    return { data: result, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

export async function dbDelete(
  table: string,
  id: string
): Promise<{ error: any }> {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    return { error }
  } catch (err) {
    return { error: err }
  }
}
