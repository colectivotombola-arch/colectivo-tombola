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

// Real API functions using Supabase
export const siteSettingsAPI = {
  async get(): Promise<SiteSettings | null> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching site settings:', error);
      return null;
    }
  },

  async update(settings: Partial<SiteSettings>): Promise<SiteSettings | null> {
    try {
      // First get the existing settings ID
      const { data: existingSettings } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (!existingSettings) {
        // Create new settings if none exist
        const { data, error } = await supabase
          .from('site_settings')
          .insert({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Update existing settings
        const { data, error } = await supabase
          .from('site_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error updating site settings:', error);
      return null;
    }
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