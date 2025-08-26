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
  instagram_handle?: string
  instagram_display_name?: string
  hero_title: string
  hero_subtitle: string
  contact_email?: string
  contact_phone?: string
  logo_url?: string
  social_media?: any
  payment_settings?: any
  email_settings?: any
  site_tagline?: string
  price_per_number?: string
  terms_and_conditions?: string
  activity_title?: string
  purchase_rules?: string
  raffle_rules?: string
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
  instant_prizes?: any
  is_sold_out?: boolean
  allow_multiple_purchases?: boolean
  purchase_limit?: number
  start_date?: string
  end_date?: string
  created_by?: string
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

export interface PurchaseConfirmation {
  id?: string
  raffle_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  quantity: number
  total_amount: number
  payment_method?: string
  confirmation_number: string
  status?: string
  assigned_numbers?: number[]
  created_at?: string
  updated_at?: string
}

// API functions
export const siteSettingsAPI = {
  // Public access - only safe display settings
  async getPublic(): Promise<Partial<SiteSettings> | null> {
    const { data, error } = await supabase
      .rpc('get_public_site_settings')
    
    if (error) {
      console.error('Error fetching public site settings:', error)
      return null
    }
    
    return data as Partial<SiteSettings>
  },

  // Admin access - all settings (requires authentication)
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
      console.log('Attempting to save settings:', settings);
      
      // Use direct database update with upsert
      const { data, error } = await supabase
        .from('site_settings')
        .upsert({
          id: settings.id || '30a933b2-6eba-498d-b3be-b97ff3c76784',
          site_name: settings.site_name || 'TOMBOLA PREMIUM',
          site_tagline: settings.site_tagline,
          primary_color: settings.primary_color || '#00e5cc',
          secondary_color: settings.secondary_color || '#1a1a1a',
          contact_email: settings.contact_email,
          contact_phone: settings.contact_phone,
          logo_url: settings.logo_url,
          whatsapp_number: settings.whatsapp_number,
          instagram_video_url: settings.instagram_video_url,
          hero_title: settings.hero_title || 'TOYOTA FORTUNER 4X4 + CHEVROLET ONIX TURBO RS 0km',
          hero_subtitle: settings.hero_subtitle || 'Rifas seguras y transparentes con los mejores premios del mercado',
          social_media: settings.social_media,
          payment_settings: settings.payment_settings,
          email_settings: settings.email_settings,
          price_per_number: settings.price_per_number || '1.50',
          terms_and_conditions: settings.terms_and_conditions,
          activity_title: settings.activity_title,
          purchase_rules: settings.purchase_rules,
          raffle_rules: settings.raffle_rules,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Settings saved successfully:', data);
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

export const purchaseConfirmationsAPI = {
  async create(confirmationData: Omit<PurchaseConfirmation, 'id' | 'created_at' | 'updated_at'>): Promise<PurchaseConfirmation | null> {
    const { data, error } = await supabase
      .from('purchase_confirmations')
      .insert(confirmationData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating purchase confirmation:', error)
      return null
    }
    
    return data as PurchaseConfirmation
  },

  async getByEmail(email: string): Promise<PurchaseConfirmation[]> {
    const { data, error } = await supabase
      .from('purchase_confirmations')
      .select('*')
      .eq('buyer_email', email)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching purchase confirmations:', error)
      return []
    }
    
    return (data || []) as PurchaseConfirmation[]
  },

  async getAll(): Promise<PurchaseConfirmation[]> {
    const { data, error } = await supabase
      .from('purchase_confirmations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching all purchase confirmations:', error)
      return []
    }
    
    return (data || []) as PurchaseConfirmation[]
  },

  async updateStatus(id: string, status: string): Promise<boolean> {
    const { error } = await supabase
      .from('purchase_confirmations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    return !error
  },

  // Función auxiliar para generar números aleatorios únicos
  generateRandomNumbers(quantity: number, totalNumbers: number, existingNumbers: number[] = []): number[] {
    const availableNumbers = []
    for (let i = 1; i <= totalNumbers; i++) {
      if (!existingNumbers.includes(i)) {
        availableNumbers.push(i)
      }
    }
    
    if (availableNumbers.length < quantity) {
      throw new Error('No hay suficientes números disponibles')
    }
    
    const selectedNumbers = []
    for (let i = 0; i < quantity; i++) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length)
      selectedNumbers.push(availableNumbers[randomIndex])
      availableNumbers.splice(randomIndex, 1)
    }
    
    return selectedNumbers.sort((a, b) => a - b)
  }
}