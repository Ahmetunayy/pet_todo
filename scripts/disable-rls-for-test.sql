-- Test kullanıcısı için RLS politikalarını geçici olarak devre dışı bırak
ALTER TABLE public.pets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos DISABLE ROW LEVEL SECURITY;

-- Veya alternatif olarak, test kullanıcısı için özel bir politika oluştur
CREATE POLICY "Test kullanıcısı tüm evcil hayvanları görebilir"
  ON public.pets
  FOR ALL
  USING ("userId" = 'test-user-id');

CREATE POLICY "Test kullanıcısı tüm görevleri görebilir"
  ON public.todos
  FOR ALL
  USING ("userId" = 'test-user-id'); 