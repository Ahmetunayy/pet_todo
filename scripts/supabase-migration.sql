-- Kullanıcılar tablosu (Supabase Auth ile entegre)
-- Not: Supabase Auth zaten kullanıcıları yönetir, bu tablo ek bilgiler için
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Evcil hayvan türleri tablosu
CREATE TABLE IF NOT EXISTS public.pet_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Evcil hayvanlar tablosu
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type_id INTEGER NOT NULL REFERENCES public.pet_types(id),
  breed TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'unknown')),
  image_url TEXT,
  notes TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Görev kategorileri tablosu
CREATE TABLE IF NOT EXISTS public.task_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Görevler tablosu
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES public.task_categories(id),
  completed BOOLEAN NOT NULL DEFAULT false,
  due_date TIMESTAMP WITH TIME ZONE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  recurring_type TEXT CHECK (recurring_type IN ('daily', 'weekly', 'monthly', 'yearly', 'none')),
  recurring_interval INTEGER DEFAULT 1,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  parent_task_id UUID REFERENCES public.tasks(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Aşı türleri tablosu
CREATE TABLE IF NOT EXISTS public.vaccine_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  applicable_pet_types INTEGER[] NOT NULL, -- pet_types.id dizisi
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Aşı takvimi tablosu
CREATE TABLE IF NOT EXISTS public.vaccine_schedules (
  id SERIAL PRIMARY KEY,
  vaccine_type_id INTEGER NOT NULL REFERENCES public.vaccine_types(id),
  pet_type_id INTEGER NOT NULL REFERENCES public.pet_types(id),
  age_in_months INTEGER NOT NULL, -- Uygulanması gereken yaş (ay olarak)
  is_recurring BOOLEAN DEFAULT false,
  recurring_months INTEGER, -- Tekrarlanma sıklığı (ay olarak)
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Evcil hayvan aşıları tablosu
CREATE TABLE IF NOT EXISTS public.pet_vaccines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  vaccine_type_id INTEGER NOT NULL REFERENCES public.vaccine_types(id),
  scheduled_date DATE NOT NULL,
  administered_date DATE,
  administered BOOLEAN DEFAULT false,
  notes TEXT,
  task_id UUID REFERENCES public.tasks(id), -- İlişkili görev
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Varsayılan görevler tablosu (pet türüne göre)
CREATE TABLE IF NOT EXISTS public.default_tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES public.task_categories(id),
  pet_type_id INTEGER NOT NULL REFERENCES public.pet_types(id),
  recurring_type TEXT CHECK (recurring_type IN ('daily', 'weekly', 'monthly', 'yearly', 'none')),
  recurring_interval INTEGER DEFAULT 1,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  age_min_months INTEGER, -- Minimum yaş (ay olarak, null ise sınır yok)
  age_max_months INTEGER, -- Maksimum yaş (ay olarak, null ise sınır yok)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS (Row Level Security) politikaları
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_vaccines ENABLE ROW LEVEL SECURITY;

-- Kullanıcıların kendi verilerini görmesine izin veren politikalar
CREATE POLICY "Kullanıcılar kendi profillerini görebilir"
  ON public.profiles
  FOR ALL
  USING (id = auth.uid());

CREATE POLICY "Kullanıcılar kendi evcil hayvanlarını görebilir"
  ON public.pets
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Kullanıcılar kendi evcil hayvanlarını ekleyebilir"
  ON public.pets
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Kullanıcılar kendi evcil hayvanlarını düzenleyebilir"
  ON public.pets
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Kullanıcılar kendi evcil hayvanlarını silebilir"
  ON public.pets
  FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Kullanıcılar kendi görevlerini görebilir"
  ON public.tasks
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Kullanıcılar kendi görevlerini ekleyebilir"
  ON public.tasks
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Kullanıcılar kendi görevlerini düzenleyebilir"
  ON public.tasks
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Kullanıcılar kendi görevlerini silebilir"
  ON public.tasks
  FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Kullanıcılar kendi evcil hayvanlarının aşılarını görebilir"
  ON public.pet_vaccines
  FOR SELECT
  USING (pet_id IN (SELECT id FROM public.pets WHERE user_id = auth.uid()));

CREATE POLICY "Kullanıcılar kendi evcil hayvanlarının aşılarını ekleyebilir"
  ON public.pet_vaccines
  FOR INSERT
  WITH CHECK (pet_id IN (SELECT id FROM public.pets WHERE user_id = auth.uid()));

CREATE POLICY "Kullanıcılar kendi evcil hayvanlarının aşılarını düzenleyebilir"
  ON public.pet_vaccines
  FOR UPDATE
  USING (pet_id IN (SELECT id FROM public.pets WHERE user_id = auth.uid()));

CREATE POLICY "Kullanıcılar kendi evcil hayvanlarının aşılarını silebilir"
  ON public.pet_vaccines
  FOR DELETE
  USING (pet_id IN (SELECT id FROM public.pets WHERE user_id = auth.uid()));

-- Herkesin görebileceği referans tabloları
CREATE POLICY "Herkes pet türlerini görebilir"
  ON public.pet_types
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Herkes görev kategorilerini görebilir"
  ON public.task_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Herkes aşı türlerini görebilir"
  ON public.vaccine_types
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Herkes aşı takvimlerini görebilir"
  ON public.vaccine_schedules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Herkes varsayılan görevleri görebilir"
  ON public.default_tasks
  FOR SELECT
  TO authenticated
  USING (true);

-- Temel veri girişleri
-- Pet türleri
INSERT INTO public.pet_types (name, description) VALUES
  ('dog', 'Köpekler'),
  ('cat', 'Kediler'),
  ('bird', 'Kuşlar'),
  ('fish', 'Balıklar'),
  ('rabbit', 'Tavşanlar'),
  ('hamster', 'Hamsterlar'),
  ('other', 'Diğer')
ON CONFLICT (name) DO NOTHING;

-- Görev kategorileri
INSERT INTO public.task_categories (name, description, color, icon) VALUES
  ('feeding', 'Besleme', '#FF9800', 'food-bowl'),
  ('health', 'Sağlık', '#F44336', 'medical-bag'),
  ('grooming', 'Bakım', '#9C27B0', 'content-cut'),
  ('exercise', 'Egzersiz', '#4CAF50', 'run'),
  ('training', 'Eğitim', '#2196F3', 'school'),
  ('social', 'Sosyalleşme', '#3F51B5', 'account-group'),
  ('other', 'Diğer', '#607D8B', 'dots-horizontal')
ON CONFLICT (name) DO NOTHING;

-- Aşı türleri
INSERT INTO public.vaccine_types (name, description, applicable_pet_types) VALUES
  ('Kuduz', 'Kuduz hastalığına karşı koruma sağlar', ARRAY[1, 2]), -- Köpek ve kedi
  ('Karma', 'Birden fazla hastalığa karşı koruma sağlar', ARRAY[1]), -- Sadece köpek
  ('Lösemi', 'Kedi lösemisine karşı koruma sağlar', ARRAY[2]), -- Sadece kedi
  ('Parvo', 'Parvovirus hastalığına karşı koruma sağlar', ARRAY[1]), -- Sadece köpek
  ('Bordetella', 'Kennel öksürüğüne karşı koruma sağlar', ARRAY[1]) -- Sadece köpek
ON CONFLICT DO NOTHING;

-- Aşı takvimi
INSERT INTO public.vaccine_schedules (vaccine_type_id, pet_type_id, age_in_months, is_recurring, recurring_months, notes) VALUES
  (1, 1, 3, true, 12, 'Yıllık tekrarlanmalı'), -- Köpek kuduz aşısı
  (1, 2, 3, true, 12, 'Yıllık tekrarlanmalı'), -- Kedi kuduz aşısı
  (2, 1, 2, false, null, '8 haftalıkken yapılmalı'), -- Köpek karma aşısı
  (3, 2, 2, false, null, '8 haftalıkken yapılmalı'), -- Kedi lösemi aşısı
  (4, 1, 2, false, null, '8 haftalıkken yapılmalı'), -- Köpek parvo aşısı
  (5, 1, 4, true, 6, '6 ayda bir tekrarlanmalı') -- Köpek bordetella aşısı
ON CONFLICT DO NOTHING;

-- Varsayılan görevler
INSERT INTO public.default_tasks (title, description, category_id, pet_type_id, recurring_type, recurring_interval, priority) VALUES
  -- Köpek görevleri
  ('Besle', 'Köpeğinizi günde iki kez besleyin', 1, 1, 'daily', 1, 'high'),
  ('Su ver', 'Köpeğinizin su kabını taze suyla doldurun', 1, 1, 'daily', 1, 'high'),
  ('Yürüyüşe çıkar', 'Köpeğinizi günlük yürüyüşe çıkarın', 4, 1, 'daily', 1, 'medium'),
  ('Tüy tarama', 'Köpeğinizin tüylerini tarayın', 3, 1, 'weekly', 1, 'medium'),
  ('Tırnak kesimi', 'Köpeğinizin tırnaklarını kesin', 3, 1, 'monthly', 1, 'medium'),
  ('Diş fırçalama', 'Köpeğinizin dişlerini fırçalayın', 2, 1, 'weekly', 2, 'medium'),
  ('Banyo', 'Köpeğinizi yıkayın', 3, 1, 'monthly', 1, 'medium'),
  
  -- Kedi görevleri
  ('Besle', 'Kedinizi günde iki kez besleyin', 1, 2, 'daily', 1, 'high'),
  ('Su ver', 'Kedinizin su kabını taze suyla doldurun', 1, 2, 'daily', 1, 'high'),
  ('Kum temizliği', 'Kedi kumunu temizleyin', 3, 2, 'daily', 1, 'high'),
  ('Tüy tarama', 'Kedinizin tüylerini tarayın', 3, 2, 'weekly', 2, 'medium'),
  ('Tırnak kesimi', 'Kedinizin tırnaklarını kesin', 3, 2, 'monthly', 1, 'medium'),
  ('Oyun zamanı', 'Kedinizle interaktif oyuncaklarla oynayın', 4, 2, 'daily', 1, 'medium'),
  
  -- Kuş görevleri
  ('Besle', 'Kuşunuzu besleyin', 1, 3, 'daily', 1, 'high'),
  ('Su ver', 'Kuşunuzun su kabını taze suyla doldurun', 1, 3, 'daily', 1, 'high'),
  ('Kafes temizliği', 'Kuşunuzun kafesini temizleyin', 3, 3, 'weekly', 1, 'high'),
  ('Tünek temizliği', 'Kuşunuzun tüneklerini temizleyin', 3, 3, 'weekly', 1, 'medium'),
  
  -- Balık görevleri
  ('Besle', 'Balıklarınızı besleyin', 1, 4, 'daily', 1, 'high'),
  ('Su değişimi', 'Akvaryumun suyunun bir kısmını değiştirin', 3, 4, 'weekly', 1, 'high'),
  ('Filtre temizliği', 'Akvaryum filtresini temizleyin', 3, 4, 'monthly', 1, 'high'),
  ('Su değerleri kontrolü', 'Akvaryum suyunun pH ve diğer değerlerini kontrol edin', 2, 4, 'weekly', 1, 'medium')
ON CONFLICT DO NOTHING;

-- Yeni bir kullanıcı oluşturulduğunda profil oluşturan tetikleyici
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NULL, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tetikleyiciyi auth.users tablosuna bağla
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test kullanıcısı için örnek veriler
DO $$
DECLARE
  test_user_id UUID := 'test-user-id';
  dog_id UUID;
  cat_id UUID;
BEGIN
  -- Test kullanıcısı profili
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (test_user_id, 'Test Kullanıcı', 'https://i.pravatar.cc/150?u=test-user')
  ON CONFLICT (id) DO NOTHING;
  
  -- Test kullanıcısının evcil hayvanları
  INSERT INTO public.pets (id, name, type_id, breed, birth_date, gender, user_id)
  VALUES 
    (gen_random_uuid(), 'Pamuk', 1, 'Golden Retriever', '2021-01-15', 'male', test_user_id),
    (gen_random_uuid(), 'Tekir', 2, 'Tekir', '2022-03-10', 'female', test_user_id)
  RETURNING id INTO dog_id;
  
  -- İlk eklenen köpeğin ID'sini al
  SELECT id INTO dog_id FROM public.pets WHERE user_id = test_user_id AND type_id = 1 LIMIT 1;
  
  -- İlk eklenen kedinin ID'sini al
  SELECT id INTO cat_id FROM public.pets WHERE user_id = test_user_id AND type_id = 2 LIMIT 1;
  
  -- Test kullanıcısının görevleri
  IF dog_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, category_id, completed, due_date, pet_id, recurring_type, priority, user_id)
    VALUES 
      ('Pamuk''u yürüyüşe çıkar', 'Akşam 18:00''de parkta yürüyüş', 4, false, now() + interval '1 day', dog_id, 'daily', 'medium', test_user_id),
      ('Pamuk''un aşı randevusu', 'Veteriner Dr. Ayşe ile saat 14:00''de randevu', 2, false, now() + interval '7 day', dog_id, 'none', 'high', test_user_id);
  END IF;
  
  IF cat_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, category_id, completed, due_date, pet_id, recurring_type, priority, user_id)
    VALUES 
      ('Tekir''in kumunu temizle', null, 3, false, now() + interval '1 day', cat_id, 'daily', 'high', test_user_id),
      ('Tekir''i veterinere götür', 'Yıllık kontrol', 2, false, now() + interval '14 day', cat_id, 'none', 'medium', test_user_id);
  END IF;
END $$; 