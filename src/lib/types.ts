export interface Profile {
  id: string;
  company_name: string | null;
  owner_name: string | null;
  tax_year: string | null;
  created_at: string;
}

export interface CompanyInfo {
  id: string;
  user_id: string;
  legal_name: string | null;
  ein: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyContact {
  id: string;
  user_id: string;
  type: "accountant" | "insurance" | "bank" | "other";
  name: string | null;
  company: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  created_at: string;
}

export type JobStatus = "lead" | "estimated" | "scheduled" | "in_progress" | "completed" | "invoiced" | "paid" | "cancelled";

export interface Job {
  id: string;
  user_id: string;
  client_id: string | null;
  title: string;
  service_type: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  start_date: string | null;
  end_date: string | null;
  estimate_amount: number | null;
  invoice_amount: number | null;
  status: JobStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface MoneyEntry {
  id: string;
  user_id: string;
  kind: "income" | "expense";
  category: string | null;
  subcategory: string | null;
  amount: number;
  date: string;
  client_id: string | null;
  job_id: string | null;
  document_id: string | null;
  notes: string | null;
  client?: Client;
  job?: Job;
}

export interface MonthlySummary {
  id: string;
  user_id: string;
  year: number;
  month: number;
  income_total: number;
  expense_total: number;
  profit_estimated: number;
  tax_reserved: number;
  is_closed: boolean;
}

export interface MileageLog {
  id: string;
  user_id: string;
  date: string;
  origin: string | null;
  destination: string | null;
  purpose: string | null;
  miles: number;
  job_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface Helper {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  tax_id_status: string | null;
  notes: string | null;
}

export interface HelperPayment {
  id: string;
  user_id: string;
  helper_id: string;
  date: string;
  amount: number;
  method: string | null;
  document_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  user_id: string;
  scope: "weekly" | "monthly";
  year: number;
  month: number | null;
  item_key: string;
  label: string;
  is_done: boolean;
  done_at: string | null;
}

export interface KnowledgeArticle {
  id: string;
  slug: string;
  title: string;
  body: string;
  category: string;
  sort_order: number;
  is_active: boolean;
}

export interface Settings {
  id: string;
  user_id: string;
  company_name: string | null;
  tax_year: string | null;
  reserve_percent: number | null;
  mileage_rate: number | null;
  currency: string | null;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  order_index: number;
}

export interface Document {
  id: string;
  user_id: string;
  folder_id: string | null;
  linked_entity_type: string | null;
  linked_entity_id: string | null;
  type: string | null;
  category: string | null;
  title: string;
  file_url: string | null;
  amount: number | null;
  document_date: string | null;
  status: "active" | "archived";
  notes: string | null;
  created_at: string;
  updated_at: string;
}
