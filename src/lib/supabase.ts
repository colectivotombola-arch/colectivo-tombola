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
  social_media?: string | object
  payment_settings?: string | object
  email_settings?: string | object
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
  instant_prizes?: InstantPrize[]
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

export interface PurchaseSettings {
  id?: string
  raffle_id: string
  allow_custom_quantity: boolean
  email_notifications_enabled: boolean
  payment_methods: {
    whatsapp: boolean
    bank_transfer: boolean
    paypal: boolean
  }
  terms_and_conditions?: string
  created_at?: string
  updated_at?: string
}

export interface InstantPrize {
  number: string
  claimed: boolean
  prize_amount?: number
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
    
    return (data || []).map(raffle => ({
      ...raffle,
      instant_prizes: raffle.instant_prizes || []
    }))
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
    
    return data ? {
      ...data,
      instant_prizes: data.instant_prizes || []
    } : null
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
      .order('number_value')
    
    if (error) {
      console.error('Error fetching raffle numbers:', error)
      return []
    }
    
    return data || []
  },

  async purchaseNumbers(raffleId: string, quantity: number, buyerName: string, buyerPhone: string, buyerEmail?: string): Promise<number[]> {
    // Generar números aleatorios disponibles
    const { data: existingNumbers } = await supabase
      .from('raffle_numbers')
      .select('number_value')
      .eq('raffle_id', raffleId)

    const { data: raffle } = await supabase
      .from('raffles')
      .select('total_numbers')
      .eq('id', raffleId)
      .single()

    if (!raffle) throw new Error('Rifa no encontrada')

    const usedNumbers = new Set((existingNumbers || []).map(n => n.number_value))
    const availableNumbers = []
    
    for (let i = 1; i <= raffle.total_numbers; i++) {
      if (!usedNumbers.has(i)) {
        availableNumbers.push(i)
      }
    }

    if (availableNumbers.length < quantity) {
      throw new Error('No hay suficientes números disponibles')
    }

    // Seleccionar números aleatorios
    const selectedNumbers = []
    for (let i = 0; i < quantity; i++) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length)
      selectedNumbers.push(availableNumbers.splice(randomIndex, 1)[0])
    }

    // Insertar los números comprados
    const purchases = selectedNumbers.map(number => ({
      raffle_id: raffleId,
      number_value: number,
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      buyer_email: buyerEmail,
      purchase_date: new Date().toISOString(),
      payment_status: 'pending'
    }))

    const { error } = await supabase
      .from('raffle_numbers')
      .insert(purchases)

    if (error) {
      console.error('Error purchasing numbers:', error)
      throw error
    }

    return selectedNumbers
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
    
    return data || []
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
    
    return data
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
    
    return data
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('raffle_packages')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting package:', error)
      return false
    }
    
    return true
  }
}