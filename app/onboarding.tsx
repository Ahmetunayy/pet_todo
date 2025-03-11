import React from 'react';
import { StyleSheet, Image, View, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ResizeMode, Video } from 'expo-av';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, "background")

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleRegister = () => {
    router.push('/auth/register');
  };

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <Video
        source={require('@/assets/videos/bgVideo.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />

      {/* Karanlık Overlay - Videonun üzerine yerleştiriliyor */}
      <View style={styles.overlay} />

      <SafeAreaView style={[styles.container]}>


        <View style={styles.contentContainer}>
          <View>
            <ThemedText style={styles.titles}>Pet Todo</ThemedText>
          </View>
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Hafif karartma efekti
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  titles: {
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
    color: '#000',
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