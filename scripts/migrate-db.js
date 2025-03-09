require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase bağlantısı
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL veya anahtar bulunamadı. Lütfen .env dosyasını kontrol edin.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Migration dosyasını oku
const migrationFilePath = path.join(__dirname, 'supabase-migration.sql');
const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');

async function runMigration() {
  console.log('Veritabanı migration başlatılıyor...');
  
  try {
    // SQL sorgusunu çalıştır
    const { error } = await supabase.rpc('pgmigrate', { query: migrationSQL });
    
    if (error) {
      console.error('Migration hatası:', error);
      
      // Alternatif olarak doğrudan SQL çalıştırmayı dene
      console.log('Doğrudan SQL çalıştırma deneniyor...');
      const { error: sqlError } = await supabase.sql(migrationSQL);
      
      if (sqlError) {
        console.error('SQL hatası:', sqlError);
        console.log('\nÖnemli Not: Bu hatayı alıyorsanız, migration SQL dosyasını Supabase Dashboard\'da SQL Editör üzerinden manuel olarak çalıştırmanız gerekebilir.');
        console.log('1. Supabase Dashboard\'a gidin');
        console.log('2. SQL Editör\'ü açın');
        console.log('3. scripts/supabase-migration.sql dosyasının içeriğini kopyalayın ve yapıştırın');
        console.log('4. SQL sorgusunu çalıştırın');
      } else {
        console.log('Migration başarıyla tamamlandı!');
      }
    } else {
      console.log('Migration başarıyla tamamlandı!');
    }
  } catch (err) {
    console.error('Beklenmeyen hata:', err);
    console.log('\nÖnemli Not: Bu hatayı alıyorsanız, migration SQL dosyasını Supabase Dashboard\'da SQL Editör üzerinden manuel olarak çalıştırmanız gerekebilir.');
    console.log('1. Supabase Dashboard\'a gidin');
    console.log('2. SQL Editör\'ü açın');
    console.log('3. scripts/supabase-migration.sql dosyasının içeriğini kopyalayın ve yapıştırın');
    console.log('4. SQL sorgusunu çalıştırın');
  }
}

runMigration(); 