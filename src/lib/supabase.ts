// Use the existing Supabase client from integrations
import { supabase } from '@/integrations/supabase/client';

// Export supabase for backward compatibility
export { supabase };

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
  contact_email?: string
  contact_phone?: string
  logo_url?: string
  created_at?: string
  updated_at?: string
}

export interface Raffle {
  id?: string
  title: string
  description: string
  prize_image?: string
  total_numbers: number
  price_per_number: number
  status: string
  draw_date?: string
  winner_number?: number
  numbers_sold?: number
  sold_percentage?: number
  max_tickets_per_purchase?: number
  min_tickets_per_purchase?: number
  created_at?: string
  updated_at?: string
}

export interface RafflePackage {
  id?: string
  raffle_id: string
  ticket_count: number
  price_per_ticket: number
  is_popular: boolean
  display_order: number
  created_at?: string
}

export interface InstantPrize {
  number: string
  claimed: boolean
  prize_amount?: number
}

export interface RaffleNumber {
  id?: string
  raffle_id: string
  number_value: number
  buyer_name?: string
  buyer_phone?: string
  buyer_email?: string
  payment_status?: string
  payment_method?: string
  purchase_date?: string
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
    
    return data as SiteSettings
  },

  async update(settings: Partial<SiteSettings>): Promise<SiteSettings | null> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert({ ...settings, updated_at: new Date().toISOString() })
        .select()
        .single();
      
      if (error) throw error;
      return data as SiteSettings;
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
    
    return (data || []) as Raffle[]
  },

  async getActive(): Promise<Raffle | null> {
    const { data, error } = await supabase
      .from('raffles')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error) {
      console.error('Error fetching active raffle:', error)
      return null
    }
    
    return data as Raffle
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
    
    return data as Raffle
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
    
    return data as Raffle
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('raffles')
      .delete()
      .eq('id', id)
    
    return !error
  }
}

export const raffleNumbersAPI = {
  async getByRaffle(raffleId: string): Promise<RaffleNumber[]> {
    const { data, error } = await supabase
      .from('raffle_numbers')
      .select('*')
      .eq('raffle_id', raffleId)
      .order('number_value')
    
    if (error) {
      console.error('Error fetching raffle numbers:', error)
      return []
    }
    
    return (data || []) as RaffleNumber[]
  },

  async purchaseNumbers(raffleId: string, quantity: number, buyerName: string, buyerPhone: string, buyerEmail?: string): Promise<number[]> {
    // Implementation for purchasing numbers
    const purchases = Array.from({length: quantity}, (_, i) => ({
      raffle_id: raffleId,
      number_value: Math.floor(Math.random() * 1000) + 1,
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      buyer_email: buyerEmail,
      purchase_date: new Date().toISOString(),
      payment_status: 'pending'
    }))

    const { data, error } = await supabase
      .from('raffle_numbers')
      .insert(purchases)
      .select('number_value')

    if (error) {
      console.error('Error purchasing numbers:', error)
      throw error
    }

    return (data || []).map(d => d.number_value)
  }
}

export const rafflePackagesAPI = {
  async getByRaffle(raffleId: string): Promise<RafflePackage[]> {
    const { data, error } = await supabase
      .from('raffle_packages')
      .select('*')
      .eq('raffle_id', raffleId)
      .order('display_order')
    
    if (error) {
      console.error('Error fetching raffle packages:', error)
      return []
    }
    
    return (data || []) as RafflePackage[]
  },

  async create(package_data: Omit<RafflePackage, 'id' | 'created_at'>): Promise<RafflePackage | null> {
    const { data, error } = await supabase
      .from('raffle_packages')
      .insert(package_data)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating package:', error)
      return null
    }
    
    return data as RafflePackage
  },

  async update(id: string, updates: Partial<RafflePackage>): Promise<RafflePackage | null> {
    const { data, error } = await supabase
      .from('raffle_packages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating package:', error)
      return null
    }
    
    return data as RafflePackage
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('raffle_packages')
      .delete()
      .eq('id', id)
    
    return !error
  }
}