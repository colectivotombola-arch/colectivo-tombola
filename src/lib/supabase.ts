import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xwdrvakfrhlrnvqxodft.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZHJ2YWtmcmhscm52cXhvZGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNTk4MTYsImV4cCI6MjA2OTkzNTgxNn0.7Ampezur9n9NreFG6UDQgppKI5asBWo1VjrOJQWhW5I"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

// API functions
export const siteSettingsAPI = {
  async get(): Promise<SiteSettings | null> {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching site settings:', error)
      return null
    }
    
    return data
  },

  async update(settings: Partial<SiteSettings>): Promise<SiteSettings | null> {
    try {
      // First try to get existing settings
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('site_settings')
          .update({ ...settings, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('site_settings')
          .insert({ ...settings, created_at: new Date().toISOString() })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error in siteSettingsAPI.update:', error);
      return null;
    }
  }
}

export const rafflesAPI = {
  async getAll(): Promise<Raffle[]> {
    const { data, error } = await supabase
      .from('raffles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching raffles:', error)
      return []
    }
    
    return data || []
  },

  async create(raffle: Omit<Raffle, 'id' | 'created_at'>): Promise<Raffle | null> {
    const { data, error } = await supabase
      .from('raffles')
      .insert({ ...raffle, created_at: new Date().toISOString() })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating raffle:', error)
      return null
    }
    
    return data
  },

  async update(id: string, updates: Partial<Raffle>): Promise<Raffle | null> {
    const { data, error } = await supabase
      .from('raffles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating raffle:', error)
      return null
    }
    
    return data
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('raffles')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting raffle:', error)
      return false
    }
    
    return true
  }
}

export const raffleNumbersAPI = {
  async getByRaffle(raffleId: string): Promise<RaffleNumber[]> {
    const { data, error } = await supabase
      .from('raffle_numbers')
      .select('*')
      .eq('raffle_id', raffleId)
      .order('number')
    
    if (error) {
      console.error('Error fetching raffle numbers:', error)
      return []
    }
    
    return data || []
  },

  async purchaseNumber(raffleId: string, number: number, buyerName: string, buyerPhone: string): Promise<boolean> {
    const { error } = await supabase
      .from('raffle_numbers')
      .insert({
        raffle_id: raffleId,
        number,
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        is_sold: true,
        sold_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error purchasing number:', error)
      return false
    }
    
    return true
  }
}