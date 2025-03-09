import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { createPet } from '@/lib/api';
import { Pet } from '@/lib/models';
import { useAuth } from '@/lib/auth';

const petTypes: { id: number, name: string }[] = [
  { id: 1, name: 'dog' },
  { id: 2, name: 'cat' },
  { id: 3, name: 'bird' },
  { id: 4, name: 'fish' },
  { id: 5, name: 'rabbit' },
  { id: 6, name: 'hamster' },
  { id: 7, name: 'other' }
];

const genderOptions: Pet['gender'][] = ['male', 'female', 'unknown'];

export default function NewPetScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState<number>(1); // Varsayılan olarak köpek
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<Pet['gender']>('unknown');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Lütfen evcil hayvanınızın adını girin.');
      return;
    }

    setLoading(true);
    try {
      const newPet = await createPet({
        name: name.trim(),
        type_id: typeId,
        breed: breed.trim() || undefined,
        birth_date: birthDate ? birthDate.toISOString().split('T')[0] : undefined,
        gender,
        user_id: user?.id || 'df0f1edf-3c2d-4cf2-a476-89fc5e1c5e21', // Gerçek kullanıcı ID'si
      });

      if (newPet) {
        Alert.alert('Başarılı', 'Evcil hayvanınız başarıyla eklendi.', [
          { text: 'Tamam', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Evcil hayvan eklenirken hata oluştu:', error);
      Alert.alert('Hata', 'Evcil hayvan eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Yeni Evcil Hayvan</ThemedText>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>İsim</ThemedText>
          <TextInput
            style={[
              styles.input,
              { color: Colors[colorScheme ?? 'light'].text }
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Evcil hayvanınızın adı"
            placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Tür</ThemedText>
          <View style={styles.typeContainer}>
            {petTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  typeId === type.id && styles.selectedTypeButton,
                  { borderColor: Colors[colorScheme ?? 'light'].text + '30' }
                ]}
                onPress={() => setTypeId(type.id)}
              >
                <ThemedText
                  style={[
                    styles.typeText,
                    typeId === type.id && styles.selectedTypeText
                  ]}
                >
                  {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Irk (Opsiyonel)</ThemedText>
          <TextInput
            style={[
              styles.input,
              { color: Colors[colorScheme ?? 'light'].text }
            ]}
            value={breed}
            onChangeText={setBreed}
            placeholder="Evcil hayvanınızın ırkı"
            placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Doğum Tarihi (Opsiyonel)</ThemedText>
          <TouchableOpacity
            style={[
              styles.input,
              styles.dateInput,
              { borderColor: Colors[colorScheme ?? 'light'].text + '30' }
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <ThemedText>
              {birthDate ? formatDate(birthDate) : 'Tarih seçin'}
            </ThemedText>
            <IconSymbol name="calendar" size={20} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Cinsiyet</ThemedText>
          <View style={styles.genderContainer}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderButton,
                  gender === option && styles.selectedGenderButton,
                  { borderColor: Colors[colorScheme ?? 'light'].text + '30' }
                ]}
                onPress={() => setGender(option)}
              >
                <ThemedText
                  style={[
                    styles.genderText,
                    gender === option && styles.selectedGenderText
                  ]}
                >
                  {option === 'male' ? 'Erkek' : 
                   option === 'female' ? 'Dişi' : 
                   'Bilinmiyor'}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: Colors[colorScheme ?? 'light'].tint }
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText style={styles.saveButtonText}>Kaydet</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  typeButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  selectedTypeButton: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  typeText: {
    fontSize: 14,
  },
  selectedTypeText: {
    color: '#fff',
    fontWeight: '500',
  },
  genderContainer: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  genderButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    flex: 1,
    alignItems: 'center',
  },
  selectedGenderButton: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  genderText: {
    fontSize: 14,
  },
  selectedGenderText: {
    color: '#fff',
    fontWeight: '500',
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 