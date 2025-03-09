// Kullanıcı profili
export interface Profile {
  id: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Evcil hayvan türü
export interface PetType {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

// Evcil hayvan
export interface Pet {
  id: string;
  name: string;
  type_id: number;
  breed?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'unknown';
  image_url?: string;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  
  // İlişkili veriler (API yanıtlarında doldurulabilir)
  pet_type?: PetType;
}

// Görev kategorisi
export interface TaskCategory {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
}

// Görev
export interface Task {
  id: string;
  title: string;
  description?: string;
  category_id?: number;
  completed: boolean;
  due_date?: string;
  pet_id: string;
  recurring_type?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
  recurring_interval?: number;
  priority?: 'low' | 'medium' | 'high';
  user_id: string;
  is_default?: boolean;
  parent_task_id?: string;
  created_at: string;
  updated_at: string;
  
  // İlişkili veriler (API yanıtlarında doldurulabilir)
  category?: TaskCategory;
  pet?: Pet;
}

// Aşı türü
export interface VaccineType {
  id: number;
  name: string;
  description?: string;
  applicable_pet_types: number[];
  created_at: string;
}

// Aşı takvimi
export interface VaccineSchedule {
  id: number;
  vaccine_type_id: number;
  pet_type_id: number;
  age_in_months: number;
  is_recurring: boolean;
  recurring_months?: number;
  notes?: string;
  created_at: string;
  
  // İlişkili veriler (API yanıtlarında doldurulabilir)
  vaccine_type?: VaccineType;
  pet_type?: PetType;
}

// Evcil hayvan aşısı
export interface PetVaccine {
  id: string;
  pet_id: string;
  vaccine_type_id: number;
  scheduled_date: string;
  administered_date?: string;
  administered: boolean;
  notes?: string;
  task_id?: string;
  created_at: string;
  updated_at: string;
  
  // İlişkili veriler (API yanıtlarında doldurulabilir)
  vaccine_type?: VaccineType;
  pet?: Pet;
  task?: Task;
}

// Varsayılan görev
export interface DefaultTask {
  id: number;
  title: string;
  description?: string;
  category_id?: number;
  pet_type_id: number;
  recurring_type?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
  recurring_interval?: number;
  priority?: 'low' | 'medium' | 'high';
  age_min_months?: number;
  age_max_months?: number;
  created_at: string;
  
  // İlişkili veriler (API yanıtlarında doldurulabilir)
  category?: TaskCategory;
  pet_type?: PetType;
} 