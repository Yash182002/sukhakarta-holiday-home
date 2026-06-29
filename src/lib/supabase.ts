import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type MediaType = 'image' | 'video'

export interface GalleryItem {
  id: string
  media_type: MediaType
  title: string | null
  description: string | null
  category: string | null
  media_url: string
  thumbnail_url: string | null
  is_active: boolean
  created_at: string
}
