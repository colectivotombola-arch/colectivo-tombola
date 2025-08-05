import { supabase } from '@/integrations/supabase/client';

export { supabase };

// Interfaces para la base de datos
export interface SiteSettings {
  id?: string;
  site_name: string;
  site_tagline?: string;
  primary_color: string;
  secondary_color: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  whatsapp_number?: string;
  hero_title: string;
  hero_subtitle: string;
  instagram_video_url?: string;
  social_media?: any;
  payment_settings?: any;
  email_settings?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Raffle {
  id?: string;
  title: string;
  description: string;
  prize_image?: string;
  total_numbers: number;
  price_per_number: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  draw_date?: string;
  winner_number?: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Prize {
  id?: string;
  raffle_id?: string;
  name: string;
  description: string;
  image_url?: string;
  value?: number;
  position: number;
  created_at?: string;
  updated_at?: string;
}

export interface RaffleNumber {
  id?: string;
  raffle_id: string;
  number_value: number;
  buyer_name: string;
  buyer_phone: string;
  buyer_email?: string;
  payment_method?: string;
  payment_status?: 'pending' | 'confirmed' | 'failed';
  purchase_date?: string;
  created_at?: string;
}

export interface DynamicSetting {
  id?: string;
  key: string;
  value: any;
  description?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

// API para configuraciones del sitio
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
};

// API para rifas
export const rafflesAPI = {
  async getAll(): Promise<Raffle[]> {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching raffles:', error);
        return [];
      }
      
      return (data || []) as Raffle[];
    } catch (error) {
      console.error('Error in rafflesAPI.getAll:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Raffle | null> {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching raffle:', error);
        return null;
      }
      
      return data as Raffle;
    } catch (error) {
      console.error('Error in rafflesAPI.getById:', error);
      return null;
    }
  },

  async create(raffle: Omit<Raffle, 'id' | 'created_at' | 'updated_at'>): Promise<Raffle | null> {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .insert(raffle)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating raffle:', error);
        return null;
      }
      
      return data as Raffle;
    } catch (error) {
      console.error('Error in rafflesAPI.create:', error);
      return null;
    }
  },

  async update(id: string, updates: Partial<Raffle>): Promise<Raffle | null> {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating raffle:', error);
        return null;
      }
      
      return data as Raffle;
    } catch (error) {
      console.error('Error in rafflesAPI.update:', error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('raffles')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting raffle:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in rafflesAPI.delete:', error);
      return false;
    }
  }
};

// API para premios
export const prizesAPI = {
  async getByRaffleId(raffleId: string): Promise<Prize[]> {
    try {
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .eq('raffle_id', raffleId)
        .order('position', { ascending: true });
      
      if (error) {
        console.error('Error fetching prizes:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in prizesAPI.getByRaffleId:', error);
      return [];
    }
  },

  async create(prize: Omit<Prize, 'id' | 'created_at' | 'updated_at'>): Promise<Prize | null> {
    try {
      const { data, error } = await supabase
        .from('prizes')
        .insert(prize)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating prize:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in prizesAPI.create:', error);
      return null;
    }
  },

  async update(id: string, updates: Partial<Prize>): Promise<Prize | null> {
    try {
      const { data, error } = await supabase
        .from('prizes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating prize:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in prizesAPI.update:', error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('prizes')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting prize:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in prizesAPI.delete:', error);
      return false;
    }
  }
};

// API para números de rifa
export const raffleNumbersAPI = {
  async getByRaffleId(raffleId: string): Promise<RaffleNumber[]> {
    try {
      const { data, error } = await supabase
        .from('raffle_numbers')
        .select('*')
        .eq('raffle_id', raffleId)
        .order('number_value', { ascending: true });
      
      if (error) {
        console.error('Error fetching raffle numbers:', error);
        return [];
      }
      
      return (data || []) as RaffleNumber[];
    } catch (error) {
      console.error('Error in raffleNumbersAPI.getByRaffleId:', error);
      return [];
    }
  },

  async purchase(purchase: Omit<RaffleNumber, 'id' | 'created_at'>): Promise<RaffleNumber | null> {
    try {
      const { data, error } = await supabase
        .from('raffle_numbers')
        .insert(purchase)
        .select()
        .single();
      
      if (error) {
        console.error('Error purchasing number:', error);
        return null;
      }
      
      return data as RaffleNumber;
    } catch (error) {
      console.error('Error in raffleNumbersAPI.purchase:', error);
      return null;
    }
  },

  async updatePaymentStatus(id: string, status: 'pending' | 'confirmed' | 'failed'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('raffle_numbers')
        .update({ payment_status: status })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating payment status:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in raffleNumbersAPI.updatePaymentStatus:', error);
      return false;
    }
  },

  // Función para verificar si un número está disponible
  async isNumberAvailable(raffleId: string, numberValue: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('raffle_numbers')
        .select('id')
        .eq('raffle_id', raffleId)
        .eq('number_value', numberValue)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking number availability:', error);
        return false;
      }
      
      return !data; // true si no existe (disponible), false si existe (ocupado)
    } catch (error) {
      console.error('Error in raffleNumbersAPI.isNumberAvailable:', error);
      return false;
    }
  }
};

// API para configuraciones dinámicas
export const dynamicSettingsAPI = {
  async get(key: string): Promise<DynamicSetting | null> {
    try {
      const { data, error } = await supabase
        .from('dynamic_settings')
        .select('*')
        .eq('key', key)
        .single();
      
      if (error) {
        console.error('Error fetching dynamic setting:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in dynamicSettingsAPI.get:', error);
      return null;
    }
  },

  async set(key: string, value: any, description?: string, category?: string): Promise<DynamicSetting | null> {
    try {
      const { data, error } = await supabase
        .from('dynamic_settings')
        .upsert({ key, value, description, category })
        .select()
        .single();
      
      if (error) {
        console.error('Error setting dynamic setting:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in dynamicSettingsAPI.set:', error);
      return null;
    }
  },

  async getByCategory(category: string): Promise<DynamicSetting[]> {
    try {
      const { data, error } = await supabase
        .from('dynamic_settings')
        .select('*')
        .eq('category', category);
      
      if (error) {
        console.error('Error fetching dynamic settings by category:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in dynamicSettingsAPI.getByCategory:', error);
      return [];
    }
  }
};