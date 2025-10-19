import {createClient}  from "@supabase/supabase-js"
const baseURL=import.meta.env.VITE_SUPABASE_URL
const key=import.meta.env.VITE_SUPABASE_ANON_KEY

export  const supabase =createClient(baseURL,key)