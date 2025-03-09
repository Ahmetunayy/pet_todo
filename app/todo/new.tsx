import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { createTask, getPets } from '@/lib/api';
import { Pet, Task } from '@/lib/models';
import { useAuth } from '@/lib/auth';

const recurringOptions: Task['recurring_type'][] = ['daily', 'weekly', 'monthly', 'none'];

export default function NewTaskScreen() {
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurring, setRecurring] = useState<Task['recurring_type']>('none');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(petId || null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPets, setLoadingPets] = useState(true);

  useEffect(() => {
    const loadPets = async () => {
      try {
        const petsData = await getPets(user?.id || 'df0f1edf-3c2d-4cf2-a476-89fc5e1c5e21'); // Gerçek kullanıcı ID'si
        setPets(petsData);
        if (petsData.length > 0 && !selectedPetId) {
          setSelectedPetId(petsData[0].id);
        }
      } catch (error) {
        console.error('Evcil hayvanlar yüklenirken hata oluştu:', error);
      } finally {
        setLoadingPets(false);
      }
    };

    loadPets();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Lütfen görev başlığını girin.');
      return;
    }

    if (!selectedPetId) {
      Alert.alert('Hata', 'Lütfen bir evcil hayvan seçin.');
      return;
    }

    setLoading(true);
    try {
      const newTask = await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        due_date: dueDate ? dueDate.toISOString() : undefined,
        pet_id: selectedPetId,
        recurring_type: recurring,
        user_id: user?.id || 'df0f1edf-3c2d-4cf2-a476-89fc5e1c5e21', // Gerçek kullanıcı ID'si
      });

      if (newTask) {
        Alert.alert('Başarılı', 'Görev başarıyla eklendi.', [
          { text: 'Tamam', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Görev eklenirken hata oluştu:', error);
      Alert.alert('Hata', 'Görev eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loadingPets) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }

  if (pets.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Yeni Görev</ThemedText>
          <View style={styles.backButton} />
        </View>

        <View style={styles.emptyState}>
          <IconSymbol name="pawprint.circle" size={48} color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.emptyText}>
            Görev eklemek için önce bir evcil hayvan eklemelisiniz.
          </ThemedText>
          <TouchableOpacity 
            style={[styles.emptyButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => router.push('/pet/new')}
          >
            <ThemedText style={styles.emptyButtonText}>Evcil Hayvan Ekle</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Yeni Görev</ThemedText>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Başlık</ThemedText>
          <TextInput
            style={[
              styles.input,
              { color: Colors[colorScheme ?? 'light'].text }
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Görev başlığı"
            placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Açıklama (Opsiyonel)</ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { color: Colors[colorScheme ?? 'light'].text }
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Görev açıklaması"
            placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Evcil Hayvan</ThemedText>
          <View style={styles.petContainer}>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[
                  styles.petButton,
                  selectedPetId === pet.id && styles.selectedPetButton,
                  { borderColor: Colors[colorScheme ?? 'light'].text + '30' }
                ]}
                onPress={() => setSelectedPetId(pet.id)}
              >
                <ThemedText
                  style={[
                    styles.petText,
                    selectedPetId === pet.id && styles.selectedPetText
                  ]}
                >
                  {pet.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Bitiş Tarihi (Opsiyonel)</ThemedText>
          <TouchableOpacity
            style={[
              styles.input,
              styles.dateInput,
              { borderColor: Colors[colorScheme ?? 'light'].text + '30' }
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <ThemedText>
              {dueDate ? formatDate(dueDate) : 'Tarih seçin'}
            </ThemedText>
            <IconSymbol name="calendar" size={20} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Tekrarlama</ThemedText>
          <View style={styles.recurringContainer}>
            {recurringOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.recurringButton,
                  recurring === option && styles.selectedRecurringButton,
                  { borderColor: Colors[colorScheme ?? 'light'].text + '30' }
                ]}
                onPress={() => setRecurring(option)}
              >
                <ThemedText
                  style={[
                    styles.recurringText,
                    recurring === option && styles.selectedRecurringText
                  ]}
                >
                  {option === 'daily' ? 'Günlük' :
                   option === 'weekly' ? 'Haftalık' :
                   option === 'monthly' ? 'Aylık' : 'Tekrarlanmaz'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  textArea: {
    height: 100,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  petButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  selectedPetButton: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  petText: {
    fontSize: 14,
  },
  selectedPetText: {
    color: '#fff',
    fontWeight: '500',
  },
  recurringContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  recurringButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  selectedRecurringButton: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  recurringText: {
    fontSize: 14,
  },
  selectedRecurringText: {
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
}); 