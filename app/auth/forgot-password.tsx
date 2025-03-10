import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/lib/supabase';
import { useThemeColor } from '@/hooks/useThemeColor';
export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, "background")
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'pet-todo://reset-password',
      });

      if (error) {
        Alert.alert('Hata', error.message);
      } else {
        Alert.alert(
          'Şifre Sıfırlama Bağlantısı Gönderildi',
          'E-posta adresinize şifre sıfırlama bağlantısı gönderildi. Lütfen e-postanızı kontrol edin.',
          [
            {
              text: 'Tamam',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      Alert.alert('Hata', 'Şifre sıfırlama işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.header}>
        <ThemedText style={styles.title}>Şifremi Unuttum</ThemedText>
        <ThemedText style={styles.subtitle}>Şifrenizi sıfırlamak için e-posta adresinizi girin</ThemedText>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={[
            styles.input,
            { color: Colors[colorScheme ?? 'light'].text }
          ]}
          placeholder="E-posta"
          placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: Colors[colorScheme ?? 'light'].tint }
          ]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText style={styles.buttonText}>Şifre Sıfırlama Bağlantısı Gönder</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <ThemedText style={styles.backButtonText}>Giriş Ekranına Dön</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.light.tint,
  },
}); 