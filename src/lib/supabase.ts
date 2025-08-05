import { supabase } from '@/integrations/supabase/client'

export { supabase }

// Database schemas
export interface SiteSettings {
  id?: string
  site_name: string
  site_logo?: string
  primary_color: string
  secondary_color: string
  whatsapp_number?: string
  instagram_video_url?: string
  hero_title: string
  hero_subtitle: string
  created_at?: string
  updated_at?: string
}

export interface Raffle {
  id?: string
  title: string
  description: string
  prize_image: string
  total_numbers: number
  price_per_number: number
  status: 'active' | 'completed' | 'cancelled'
  draw_date?: string
  winner_number?: number
  created_at?: string
  updated_at?: string
}

export interface RaffleNumber {
  id?: string
  raffle_id: string
  number: number
  buyer_name?: string
  buyer_phone?: string
  is_sold: boolean
  sold_at?: string
  created_at?: string
}

// Mock API functions (since no tables exist yet)
export const siteSettingsAPI = {
  async get(): Promise<SiteSettings | null> {
    // Return default settings since no database table exists
    return {
      site_name: "Tombola Premium",
      site_logo: "",
      primary_color: "#000000",
      secondary_color: "#ffffff",
      whatsapp_number: "+593123456789",
      instagram_video_url: "",
      hero_title: "JUEGA",
      hero_subtitle: "Gana increíbles premios"
    }
  },

  async update(settings: Partial<SiteSettings>): Promise<SiteSettings | null> {
    console.log('Settings update attempted:', settings)
    return null
  }
}

export const rafflesAPI = {
  async getAll(): Promise<Raffle[]> {
    // Return empty array since no database table exists
    return []
  },

  async create(raffle: Omit<Raffle, 'id' | 'created_at'>): Promise<Raffle | null> {
    console.log('Raffle creation attempted:', raffle)
    return null
  },

  async update(id: string, updates: Partial<Raffle>): Promise<Raffle | null> {
    console.log('Raffle update attempted:', id, updates)
    return null
  },

  async delete(id: string): Promise<boolean> {
    console.log('Raffle deletion attempted:', id)
    return false
  }
}

export const raffleNumbersAPI = {
  async getByRaffle(raffleId: string): Promise<RaffleNumber[]> {
    console.log('Raffle numbers fetch attempted:', raffleId)
    return []
  },

  async purchaseNumber(raffleId: string, number: number, buyerName: string, buyerPhone: string): Promise<boolean> {
    console.log('Number purchase attempted:', raffleId, number, buyerName, buyerPhone)
    return false
  }
}