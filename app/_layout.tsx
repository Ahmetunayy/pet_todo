import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/lib/auth';

// Kimlik doğrulama durumuna göre yönlendirme yapan bileşen
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboardingGroup = segments[0] === 'onboarding';

    if (!user && !inAuthGroup && !inOnboardingGroup) {
      // Kullanıcı giriş yapmamış ve auth veya onboarding grubunda değilse, onboarding'e yönlendir
      router.replace('/onboarding');
    } else if (user && (inAuthGroup || inOnboardingGroup)) {
      // Kullanıcı giriş yapmış ve auth veya onboarding grubundaysa, ana sayfaya yönlendir
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <AuthGuard>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ title: 'Giriş Yap' }} />
          <Stack.Screen name="auth/register" options={{ title: 'Kayıt Ol' }} />
          <Stack.Screen name="auth/forgot-password" options={{ title: 'Şifremi Unuttum' }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="pet/[id]" options={{ title: 'Evcil Hayvan Detayı' }} />
          <Stack.Screen name="pet/new" options={{ title: 'Yeni Evcil Hayvan' }} />
          <Stack.Screen name="todo/[id]" options={{ title: 'Görev Detayı' }} />
          <Stack.Screen name="todo/new" options={{ title: 'Yeni Görev' }} />
        </Stack>
      </AuthGuard>
    </AuthProvider>
  );
}
