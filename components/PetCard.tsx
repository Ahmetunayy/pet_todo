import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { Pet } from '@/lib/models';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from './ui/IconSymbol';

interface PetCardProps {
  pet: Pet;
  onPress?: () => void;
}

const getPetIcon = (petType: string | undefined) => {
  if (!petType) return 'pawprint.fill';
  
  switch (petType.toLowerCase()) {
    case 'dog':
      return 'pawprint.fill';
    case 'cat':
      return 'cat.fill';
    case 'bird':
      return 'bird.fill';
    case 'fish':
      return 'drop.fill';
    case 'rabbit':
      return 'hare.fill';
    case 'hamster':
      return 'pawprint.fill';
    default:
      return 'pawprint.fill';
  }
};

export const PetCard: React.FC<PetCardProps> = ({ pet, onPress }) => {
  const colorScheme = useColorScheme();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/pet/${pet.id}`);
    }
  };

  // Evcil hayvan türü adını al
  const petTypeName = pet.pet_type?.name || 'other';

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <ThemedView style={styles.card}>
        <View style={styles.imageContainer}>
          {pet.image_url ? (
            <Image source={{ uri: pet.image_url }} style={styles.image} />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
              <IconSymbol name={getPetIcon(petTypeName)} size={40} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.content}>
          <ThemedText style={styles.name}>{pet.name}</ThemedText>
          <ThemedText style={styles.type}>
            {petTypeName.charAt(0).toUpperCase() + petTypeName.slice(1)}
          </ThemedText>
          {pet.breed && <ThemedText style={styles.breed}>{pet.breed}</ThemedText>}
          {pet.birth_date && (
            <ThemedText style={styles.breed}>
              {new Date(pet.birth_date).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </ThemedText>
          )}
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    width: 100,
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    marginBottom: 2,
  },
  breed: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 