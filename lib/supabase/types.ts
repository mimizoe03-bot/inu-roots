/** Supabase データベース型定義 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          prefecture: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'> & {
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }

      dogs: {
        Row: {
          id: string
          owner_id: string
          name: string
          breed: string
          breed_en: string | null
          gender: 'male' | 'female' | null
          birth_date: string | null
          color: string | null
          photo_url: string | null
          ai_portrait_url: string | null
          is_public: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['dogs']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['dogs']['Insert']>
      }

      pedigree_records: {
        Row: {
          id: string
          dog_id: string
          registration_no: string | null
          registration_org: string | null
          registered_name: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['pedigree_records']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['pedigree_records']['Insert']>
      }

      dog_relationships: {
        Row: {
          id: string
          child_id: string
          parent_id: string
          role: 'sire' | 'dam'
          generation: number
        }
        Insert: Omit<Database['public']['Tables']['dog_relationships']['Row'], 'id'> & {
          id?: string
        }
        Update: Partial<Database['public']['Tables']['dog_relationships']['Insert']>
      }

      locations: {
        Row: {
          id: string
          name: string
          type: 'dog_run' | 'dog_cafe' | 'vet' | 'groomer' | 'other'
          address: string | null
          prefecture: string | null
          lat: number | null
          lng: number | null
          google_place_id: string | null
          phone: string | null
          website: string | null
          hours: Record<string, string> | null
          features: string[] | null
          avg_rating: number | null
          review_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['locations']['Row'], 'id' | 'created_at' | 'review_count'> & {
          id?: string
          created_at?: string
          review_count?: number
        }
        Update: Partial<Database['public']['Tables']['locations']['Insert']>
      }

      recipes: {
        Row: {
          id: string
          user_id: string | null
          title: string
          description: string | null
          target_breed: string | null
          target_size: 'small' | 'medium' | 'large' | 'all' | null
          target_age: 'puppy' | 'adult' | 'senior' | 'all' | null
          ingredients: Array<{ name: string; amount: string; unit: string }>
          steps: Array<{ order: number; text: string }>
          nutrition_notes: string | null
          caution: string | null
          is_ai_generated: boolean
          likes_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['recipes']['Row'], 'id' | 'created_at' | 'likes_count'> & {
          id?: string
          created_at?: string
          likes_count?: number
        }
        Update: Partial<Database['public']['Tables']['recipes']['Insert']>
      }

      posts: {
        Row: {
          id: string
          user_id: string
          dog_id: string | null
          breed: string
          content: string
          photos: string[] | null
          likes_count: number
          comments_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at' | 'likes_count' | 'comments_count'> & {
          id?: string
          created_at?: string
          likes_count?: number
          comments_count?: number
        }
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
      }

      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['comments']['Insert']>
      }
    }

    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

/* ───── 便利型エイリアス ───── */
export type Profile       = Database['public']['Tables']['profiles']['Row']
export type Dog           = Database['public']['Tables']['dogs']['Row']
export type PedigreeRecord = Database['public']['Tables']['pedigree_records']['Row']
export type DogRelationship = Database['public']['Tables']['dog_relationships']['Row']
export type Location      = Database['public']['Tables']['locations']['Row']
export type Recipe        = Database['public']['Tables']['recipes']['Row']
export type Post          = Database['public']['Tables']['posts']['Row']
export type Comment       = Database['public']['Tables']['comments']['Row']

/** 家系図ノード（取得用拡張型） */
export type DogWithRelations = Dog & {
  pedigree_records: PedigreeRecord[]
  sire: Dog | null   // 父
  dam: Dog | null    // 母
}
