import { supabase } from './supabase';
import { 
  Pet, 
  PetType, 
  Task, 
  TaskCategory, 
  VaccineType, 
  VaccineSchedule, 
  PetVaccine, 
  DefaultTask,
  Profile
} from './models';

// Profil API fonksiyonları
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Profil alınırken hata oluştu:', error);
    return null;
  }

  return data;
};

export const updateProfile = async (userId: string, profile: Partial<Profile>): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...profile, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Profil güncellenirken hata oluştu:', error);
    return null;
  }

  return data;
};

// Pet türleri API fonksiyonları
export const getPetTypes = async (): Promise<PetType[]> => {
  const { data, error } = await supabase
    .from('pet_types')
    .select('*')
    .order('name');

  if (error) {
    console.error('Pet türleri alınırken hata oluştu:', error);
    return [];
  }

  return data || [];
};

// Evcil hayvan API fonksiyonları
export const getPets = async (userId: string): Promise<Pet[]> => {
  const { data, error } = await supabase
    .from('pets')
    .select(`
      *,
      pet_type:type_id(id, name, description)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Evcil hayvanlar alınırken hata oluştu:', error);
    return [];
  }

  return data || [];
};

export const getPet = async (id: string): Promise<Pet | null> => {
  const { data, error } = await supabase
    .from('pets')
    .select(`
      *,
      pet_type:type_id(id, name, description)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Evcil hayvan alınırken hata oluştu:', error);
    return null;
  }

  return data;
};

export const createPet = async (pet: Omit<Pet, 'id' | 'created_at' | 'updated_at'>): Promise<Pet | null> => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('pets')
    .insert([{ 
      ...pet, 
      created_at: now,
      updated_at: now
    }])
    .select(`
      *,
      pet_type:type_id(id, name, description)
    `)
    .single();

  if (error) {
    console.error('Evcil hayvan oluşturulurken hata oluştu:', error);
    return null;
  }

  // Evcil hayvan oluşturulduktan sonra varsayılan görevleri ekle
  if (data) {
    await createDefaultTasksForPet(data.id, data.type_id, data.user_id);
  }

  return data;
};

export const updatePet = async (id: string, pet: Partial<Pet>): Promise<Pet | null> => {
  const { data, error } = await supabase
    .from('pets')
    .update({ ...pet, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(`
      *,
      pet_type:type_id(id, name, description)
    `)
    .single();

  if (error) {
    console.error('Evcil hayvan güncellenirken hata oluştu:', error);
    return null;
  }

  return data;
};

export const deletePet = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Evcil hayvan silinirken hata oluştu:', error);
    return false;
  }

  return true;
};

// Görev kategorileri API fonksiyonları
export const getTaskCategories = async (): Promise<TaskCategory[]> => {
  const { data, error } = await supabase
    .from('task_categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Görev kategorileri alınırken hata oluştu:', error);
    return [];
  }

  return data || [];
};

// Görev API fonksiyonları
export const getTasks = async (userId: string, petId?: string): Promise<Task[]> => {
  let query = supabase
    .from('tasks')
    .select(`
      *,
      category:category_id(id, name, description, color, icon),
      pet:pet_id(id, name, type_id, image_url, pet_type:type_id(id, name))
    `)
    .eq('user_id', userId);

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  const { data, error } = await query.order('due_date', { ascending: true });

  if (error) {
    console.error('Görevler alınırken hata oluştu:', error);
    return [];
  }

  return data || [];
};

export const getTask = async (id: string): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      category:category_id(id, name, description, color, icon),
      pet:pet_id(id, name, type_id, image_url, pet_type:type_id(id, name))
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Görev alınırken hata oluştu:', error);
    return null;
  }

  return data;
};

export const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ 
      ...task, 
      created_at: now,
      updated_at: now
    }])
    .select(`
      *,
      category:category_id(id, name, description, color, icon),
      pet:pet_id(id, name, type_id, image_url, pet_type:type_id(id, name))
    `)
    .single();

  if (error) {
    console.error('Görev oluşturulurken hata oluştu:', error);
    return null;
  }

  return data;
};

export const updateTask = async (id: string, task: Partial<Task>): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...task, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(`
      *,
      category:category_id(id, name, description, color, icon),
      pet:pet_id(id, name, type_id, image_url, pet_type:type_id(id, name))
    `)
    .single();

  if (error) {
    console.error('Görev güncellenirken hata oluştu:', error);
    return null;
  }

  return data;
};

export const deleteTask = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Görev silinirken hata oluştu:', error);
    return false;
  }

  return true;
};

// Aşı türleri API fonksiyonları
export const getVaccineTypes = async (): Promise<VaccineType[]> => {
  const { data, error } = await supabase
    .from('vaccine_types')
    .select('*')
    .order('name');

  if (error) {
    console.error('Aşı türleri alınırken hata oluştu:', error);
    return [];
  }

  return data || [];
};

// Aşı takvimi API fonksiyonları
export const getVaccineSchedules = async (petTypeId?: number): Promise<VaccineSchedule[]> => {
  let query = supabase
    .from('vaccine_schedules')
    .select(`
      *,
      vaccine_type:vaccine_type_id(*),
      pet_type:pet_type_id(*)
    `);

  if (petTypeId) {
    query = query.eq('pet_type_id', petTypeId);
  }

  const { data, error } = await query.order('age_in_months');

  if (error) {
    console.error('Aşı takvimi alınırken hata oluştu:', error);
    return [];
  }

  return data || [];
};

// Evcil hayvan aşıları API fonksiyonları
export const getPetVaccines = async (petId: string): Promise<PetVaccine[]> => {
  const { data, error } = await supabase
    .from('pet_vaccines')
    .select(`
      *,
      vaccine_type:vaccine_type_id(*),
      task:task_id(*)
    `)
    .eq('pet_id', petId)
    .order('scheduled_date');

  if (error) {
    console.error('Evcil hayvan aşıları alınırken hata oluştu:', error);
    return [];
  }

  return data || [];
};

export const createPetVaccine = async (vaccine: Omit<PetVaccine, 'id' | 'created_at' | 'updated_at'>): Promise<PetVaccine | null> => {
  const now = new Date().toISOString();
  
  // Önce ilişkili görevi oluştur
  let taskId: string | undefined = undefined;
  
  if (!vaccine.task_id) {
    // Aşı türünü al
    const { data: vaccineType } = await supabase
      .from('vaccine_types')
      .select('*')
      .eq('id', vaccine.vaccine_type_id)
      .single();
    
    // Evcil hayvanı al
    const { data: pet } = await supabase
      .from('pets')
      .select('*')
      .eq('id', vaccine.pet_id)
      .single();
    
    if (vaccineType && pet) {
      // Aşı için görev oluştur
      const { data: task } = await supabase
        .from('tasks')
        .insert([{
          title: `${vaccineType.name} aşısı`,
          description: `${pet.name} için ${vaccineType.name} aşısı randevusu`,
          category_id: 2, // Sağlık kategorisi
          completed: false,
          due_date: vaccine.scheduled_date,
          pet_id: vaccine.pet_id,
          recurring_type: 'none',
          priority: 'high',
          user_id: pet.user_id,
          created_at: now,
          updated_at: now
        }])
        .select()
        .single();
      
      if (task) {
        taskId = task.id;
      }
    }
  }
  
  // Aşıyı oluştur
  const { data, error } = await supabase
    .from('pet_vaccines')
    .insert([{ 
      ...vaccine,
      task_id: vaccine.task_id || taskId,
      created_at: now,
      updated_at: now
    }])
    .select(`
      *,
      vaccine_type:vaccine_type_id(*),
      task:task_id(*)
    `)
    .single();

  if (error) {
    console.error('Evcil hayvan aşısı oluşturulurken hata oluştu:', error);
    return null;
  }

  return data;
};

export const updatePetVaccine = async (id: string, vaccine: Partial<PetVaccine>): Promise<PetVaccine | null> => {
  // İlişkili görevi de güncelle
  if (vaccine.administered && vaccine.task_id) {
    await supabase
      .from('tasks')
      .update({ completed: true, updated_at: new Date().toISOString() })
      .eq('id', vaccine.task_id);
  }
  
  const { data, error } = await supabase
    .from('pet_vaccines')
    .update({ ...vaccine, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(`
      *,
      vaccine_type:vaccine_type_id(*),
      task:task_id(*)
    `)
    .single();

  if (error) {
    console.error('Evcil hayvan aşısı güncellenirken hata oluştu:', error);
    return null;
  }

  return data;
};

export const deletePetVaccine = async (id: string): Promise<boolean> => {
  // Önce ilişkili görevi bul
  const { data: vaccine } = await supabase
    .from('pet_vaccines')
    .select('task_id')
    .eq('id', id)
    .single();
  
  // İlişkili görevi sil
  if (vaccine && vaccine.task_id) {
    await supabase
      .from('tasks')
      .delete()
      .eq('id', vaccine.task_id);
  }
  
  const { error } = await supabase
    .from('pet_vaccines')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Evcil hayvan aşısı silinirken hata oluştu:', error);
    return false;
  }

  return true;
};

// Varsayılan görevler API fonksiyonları
export const getDefaultTasks = async (petTypeId?: number): Promise<DefaultTask[]> => {
  let query = supabase
    .from('default_tasks')
    .select(`
      *,
      pet_type:pet_type_id(*)
    `);

  if (petTypeId) {
    query = query.eq('pet_type_id', petTypeId);
  }

  const { data, error } = await query.order('title');

  if (error) {
    console.error('Varsayılan görevler alınırken hata oluştu:', error);
    return [];
  }

  // Kategori bilgilerini ayrı bir sorgu ile alalım
  if (data && data.length > 0) {
    const categoryIds = data
      .filter(task => task.category_id)
      .map(task => task.category_id);
    
    if (categoryIds.length > 0) {
      const { data: categories, error: categoryError } = await supabase
        .from('task_categories')
        .select('*')
        .in('id', categoryIds);
      
      if (!categoryError && categories) {
        // Kategorileri görevlerle birleştirelim
        return data.map(task => {
          if (task.category_id) {
            const category = categories.find(c => c.id === task.category_id);
            if (category) {
              return { ...task, category };
            }
          }
          return task;
        });
      }
    }
  }

  return data || [];
};

// Yardımcı fonksiyonlar
export const createDefaultTasksForPet = async (petId: string, petTypeId: number, userId: string): Promise<void> => {
  try {
    // Evcil hayvan türüne göre varsayılan görevleri al
    const defaultTasks = await getDefaultTasks(petTypeId);
    
    if (defaultTasks.length === 0) return;
    
    // Her varsayılan görev için yeni bir görev oluştur
    const now = new Date().toISOString();
    const tasks = defaultTasks.map(defaultTask => ({
      title: defaultTask.title,
      description: defaultTask.description,
      category_id: defaultTask.category_id,
      completed: false,
      pet_id: petId,
      recurring_type: defaultTask.recurring_type,
      recurring_interval: defaultTask.recurring_interval,
      priority: defaultTask.priority,
      user_id: userId,
      is_default: true,
      created_at: now,
      updated_at: now
    }));
    
    // Toplu olarak görevleri ekle
    const { error } = await supabase
      .from('tasks')
      .insert(tasks);
    
    if (error) {
      console.error('Varsayılan görevler oluşturulurken hata oluştu:', error);
    }
    
    // Evcil hayvan türüne göre aşı takvimini al
    const vaccineSchedules = await getVaccineSchedules(petTypeId);
    
    if (vaccineSchedules.length === 0) return;
    
    // Evcil hayvanın doğum tarihini al
    const { data: pet } = await supabase
      .from('pets')
      .select('birth_date')
      .eq('id', petId)
      .single();
    
    if (!pet || !pet.birth_date) return;
    
    // Her aşı takvimi için yeni bir aşı ve görev oluştur
    const birthDate = new Date(pet.birth_date);
    const petVaccines = [];
    
    for (const schedule of vaccineSchedules) {
      // Aşı tarihini hesapla (doğum tarihi + ay)
      const scheduledDate = new Date(birthDate);
      scheduledDate.setMonth(scheduledDate.getMonth() + schedule.age_in_months);
      
      // Bugünden önceyse, bugün veya gelecek bir tarih olarak ayarla
      const today = new Date();
      if (scheduledDate < today) {
        if (schedule.is_recurring && schedule.recurring_months) {
          // Tekrarlanan aşılar için bir sonraki tarihi hesapla
          while (scheduledDate < today) {
            scheduledDate.setMonth(scheduledDate.getMonth() + schedule.recurring_months);
          }
        } else {
          // Tekrarlanmayan aşılar için bugünü kullan
          scheduledDate.setTime(today.getTime());
        }
      }
      
      petVaccines.push({
        pet_id: petId,
        vaccine_type_id: schedule.vaccine_type_id,
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        administered: false,
        notes: schedule.notes,
        created_at: now,
        updated_at: now
      });
    }
    
    if (petVaccines.length > 0) {
      // Her aşı için ayrı ayrı oluştur (görev ID'leri için)
      for (const vaccine of petVaccines) {
        await createPetVaccine(vaccine);
      }
    }
  } catch (error) {
    console.error('Varsayılan veriler oluşturulurken hata oluştu:', error);
  }
}; 