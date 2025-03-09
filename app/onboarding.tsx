import React from 'react';
import { StyleSheet, Image, View, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleRegister = () => {
    router.push('/auth/register');
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.imageContainer}>
        <Image 
          source={require('@/assets/images/partial-react-logo.png')} 
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.contentContainer}>
        <ThemedText style={styles.title}>Pet Todo</ThemedText>
        <ThemedText style={styles.subtitle}>
          Evcil hayvanlarınızın bakımını takip etmek hiç bu kadar kolay olmamıştı!
        </ThemedText>
        
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: Colors[colorScheme ?? 'light'].tint + '20' }]}>
              <ThemedText style={[styles.featureIconText, { color: Colors[colorScheme ?? 'light'].tint }]}>✓</ThemedText>
            </View>
            <ThemedText style={styles.featureText}>Evcil hayvanlarınız için görevleri takip edin</ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: Colors[colorScheme ?? 'light'].tint + '20' }]}>
              <ThemedText style={[styles.featureIconText, { color: Colors[colorScheme ?? 'light'].tint }]}>✓</ThemedText>
            </View>
            <ThemedText style={styles.featureText}>Aşı takvimlerini otomatik olarak oluşturun</ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: Colors[colorScheme ?? 'light'].tint + '20' }]}>
              <ThemedText style={[styles.featureIconText, { color: Colors[colorScheme ?? 'light'].tint }]}>✓</ThemedText>
            </View>
            <ThemedText style={styles.featureText}>Tekrarlanan görevleri otomatik olarak planlayın</ThemedText>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              { backgroundColor: Colors[colorScheme ?? 'light'].tint }
            ]}
            onPress={handleRegister}
          >
            <ThemedText style={styles.primaryButtonText}>Kayıt Ol</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              { borderColor: Colors[colorScheme ?? 'light'].tint }
            ]}
            onPress={handleLogin}
          >
            <ThemedText style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].tint }]}>
              Giriş Yap
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  features: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureIconText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 