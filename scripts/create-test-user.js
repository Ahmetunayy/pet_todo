require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase bağlantısı
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY; // DİKKAT: Service Role Key kullanılmalı, anon key değil

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL veya Service Role Key bulunamadı. Lütfen .env dosyasını kontrol edin.');
  console.error('Service Role Key için Supabase Dashboard > Settings > API > service_role key kullanın.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  console.log('Test kullanıcısı oluşturuluyor...');
  
  try {
    // Kullanıcı oluştur
    const { data: user, error } = await supabase.auth.admin.createUser({
      email: 'mustafaoncu@example.com',
      password: 'pet12345',
      user_metadata: {
        full_name: 'Mustafa Oncu'
      },
      email_confirm: true // E-posta doğrulamasını otomatik olarak tamamla
    });
    
    if (error) {
      console.error('Kullanıcı oluşturulurken hata oluştu:', error);
      
      // Kullanıcı zaten varsa, şifresini sıfırla
      if (error.message.includes('already exists')) {
        console.log('Kullanıcı zaten var. Şifre sıfırlanıyor...');
        
        const { data, error: resetError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: 'pet12345' }
        );
        
        if (resetError) {
          console.error('Şifre sıfırlanırken hata oluştu:', resetError);
        } else {
          console.log('Şifre başarıyla sıfırlandı.');
        }
      }
    } else {
      console.log('Test kullanıcısı başarıyla oluşturuldu:');
      console.log('E-posta:', user.email);
      console.log('Kullanıcı ID:', user.id);
      console.log('Şifre: pet12345');
      
      // Kullanıcı ID'sini profiles tablosuna eklemek için tetikleyici zaten çalışacak
      // Ancak emin olmak için manuel olarak da ekleyebiliriz
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: 'Mustafa Oncu',
          avatar_url: 'https://i.pravatar.cc/150?u=mustafaoncu',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (profileError) {
        console.error('Profil oluşturulurken hata oluştu:', profileError);
      } else {
        console.log('Profil başarıyla oluşturuldu.');
      }
    }
  } catch (err) {
    console.error('Beklenmeyen hata:', err);
  }
}

createTestUser(); 