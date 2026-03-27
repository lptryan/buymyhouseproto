export type Motivation = 
  | 'financial_pressure' 
  | 'relocating' 
  | 'inherited' 
  | 'downsizing' 
  | 'upgrading' 
  | 'divorce' 
  | 'other';

export type Timeline = 
  | 'asap' 
  | '1_3_months' 
  | '3_6_months' 
  | '6_plus' 
  | 'exploring';

export type Condition = 
  | 'excellent' 
  | 'good' 
  | 'fair' 
  | 'needs_work' 
  | 'major_repairs';

export type MarketTrend = 'rising' | 'stable' | 'cooling';

export interface Lead {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  name: string;
  email: string;
  phone: string;
  motivation: Motivation | null;
  timeline: Timeline | null;
  condition: Condition | null;
  stage_reached: number;
  stage_completed: number;
  agent_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  name: string;
  title: string;
  photo_url: string;
  specialization: string;
  rating: number;
  deals_closed: number;
  bio: string;
  phone: string;
  email: string;
  zip_codes: string[];
  active: boolean;
}

export interface PropertySnapshot {
  id: string;
  address: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  year_built: number;
  estimated_value: number;
  arv: number;
  source: string;
  fetched_at: string;
}

export interface MarketSnapshot {
  id: string;
  zip: string;
  median_price: number;
  price_per_sqft: number;
  days_on_market: number;
  absorption_rate: number;
  trend: MarketTrend;
  fetched_at: string;
}

export interface FunnelState {
  currentStage: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  motivation: Motivation | null;
  timeline: Timeline | null;
  condition: Condition | null;
  name: string;
  email: string;
  phone: string;
  agentId: string | null;
}
