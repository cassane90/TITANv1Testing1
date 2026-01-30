
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { API_KEYS } from '../../constants';
import { UserProfile, QueryRecord, DeviceCategory, DiagnosisResult } from '../../types';

let supabase: SupabaseClient | null = null;
try {
  supabase = createClient(API_KEYS.SUPABASE_URL, API_KEYS.SUPABASE_ANON);
} catch (e) {
  console.error("CRITICAL: Supabase Node Offline.");
}

const LOCAL_LOGS_KEY = 'titan_local_logs';

export const supabaseService = {
  get client() { return supabase; },

  async signIn() {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  },

  async signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    // Don't reload, just clear auth state locally
  },

  async getProfile(): Promise<UserProfile | null> {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error) return null;

    if (!data) {
      const newProfile = {
        id: user.id,
        email: user.email,
        query_count: 0,
        onboarding_accepted: false,
        permissions: { camera: 'prompt', location: 'prompt' }
      };
      await supabase.from('profiles').upsert(newProfile);
      return newProfile as any;
    }
    return data;
  },

  async updateProfile(updates: Partial<UserProfile>) {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update(updates).eq('id', user.id);
  },

  async saveLog(category: DeviceCategory, desc: string, photos: string[], result: DiagnosisResult): Promise<QueryRecord> {
    const { data: authData } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    const user = authData?.user;

    const newRecord: Partial<QueryRecord> = {
      id: Math.random().toString(36).substring(2, 15),
      created_at: new Date().toISOString(),
      category,
      description: desc,
      photo_urls: photos,
      ai_response: result
    };

    if (supabase && user) {
      const { data, error } = await supabase.from('queries').insert({
        user_id: user.id,
        category,
        description: desc,
        photo_urls: photos,
        ai_response: result
      }).select().single();

      if (error) throw error;
      
      const profile = await this.getProfile();
      if (profile) {
        await this.updateProfile({ query_count: profile.query_count + 1 });
      }
      return data;
    } else {
      // Guest local save
      const localLogs = JSON.parse(localStorage.getItem(LOCAL_LOGS_KEY) || '[]');
      const record = newRecord as QueryRecord;
      localLogs.unshift(record);
      localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(localLogs));
      
      // Update guest profile query count in local storage
      const guestStored = localStorage.getItem('titan_guest_profile');
      if (guestStored) {
          const profile = JSON.parse(guestStored);
          profile.query_count += 1;
          localStorage.setItem('titan_guest_profile', JSON.stringify(profile));
      }
      
      return record;
    }
  },

  async getLogs(): Promise<QueryRecord[]> {
    const { data: authData } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    const user = authData?.user;

    const localLogs = JSON.parse(localStorage.getItem(LOCAL_LOGS_KEY) || '[]');

    if (supabase && user) {
      const { data, error } = await supabase.from('queries').select('*').order('created_at', { ascending: false });
      return error ? localLogs : [...(data || []), ...localLogs];
    }
    
    return localLogs;
  }
};
