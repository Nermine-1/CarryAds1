export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  user_id: number;
  company_name?: string;
  adress?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface Distributor {
  id: number;
  user_id: number;
  adress?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  status: 'active' | 'inactive' | 'pending';
}

export interface Campaign {
  id: number;
  customer_id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  budget?: number;
  status: 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  visual_path?: string;
  visual_url?: string;
  target_audience?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignDistributor {
  id: number;
  campaign_id: number;
  distributer_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'active' | 'completed';
  assigned_date: string;
  impressions: number;
  clicks: number;
}

export interface Invoice {
  id: number;
  customer_id: number;
  campaign_id?: number;
  invoice_number: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  issued_date: string;
  due_date: string;
  paid_date?: string;
  file_path?: string;
}

export interface Stock {
  id: number;
  distributer_id: number;
  material_type: string;
  quantity: number;
  location?: string;
  description?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  related_entity_type?: string;
  related_entity_id?: number;
  created_at: string;
}

export interface DashboardStats {
  total_campaigns?: number;
  active_campaigns?: number;
  total_impressions?: number;
  total_clicks?: number;
  total_revenue?: number;
  pending_invoices?: number;
}

export interface LoginResponse {
  token: string;
  userType: string;
  username: string;
  profileName: string;
  companyName?: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  userType: 'annonceur' | 'distributeur' | 'commercial' | 'admin';
  phone?: string;
  companyName?: string;
  adress?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}
