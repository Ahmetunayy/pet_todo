import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TodoItem } from '@/components/TodoItem';
import { Pet, Task } from '@/lib/models';
import { deletePet, getPet, getTasks, updateTask } from '@/lib/api';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const [pet, setPet] = useState<Pet | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const petData = await getPet(id);
      setPet(petData);

      if (petData) {
        const tasksData = await getTasks(petData.user_id, petData.id);
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Veri yüklenirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const updatedTask = await updateTask(taskId, { completed });
      if (updatedTask) {
        setTasks(tasks.map(task => task.id === taskId ? { ...task, completed } : task));
      }
    } catch (error) {
      console.error('Görev güncellenirken hata oluştu:', error);
    }
  };

  const handleAddTask = () => {
    router.push({
      pathname: '/todo/new',
      params: { petId: id }
    });
  };

  const handleDeletePet = async () => {
    Alert.alert(
      'Evcil Hayvanı Sil',
      'Bu evcil hayvanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deletePet(id);
              if (success) {
                Alert.alert('Başarılı', 'Evcil hayvan başarıyla silindi.', [
                  { text: 'Tamam', onPress: () => router.back() }
                ]);
              }
            } catch (error) {
              console.error('Evcil hayvan silinirken hata oluştu:', error);
              Alert.alert('Hata', 'Evcil hayvan silinirken bir hata oluştu. Lütfen tekrar deneyin.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }

  if (!pet) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Evcil Hayvan</ThemedText>
          <View style={styles.backButton} />
        </View>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.errorText}>Evcil hayvan bulunamadı.</ThemedText>
          <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
            <ThemedText style={styles.errorButtonText}>Geri Dön</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // Evcil hayvan türü adını al
  const petTypeName = pet.pet_type?.name || 'other';

  // Doğum tarihini formatlama
  const formatBirthDate = (dateString?: string) => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>{pet.name}</ThemedText>
        <TouchableOpacity onPress={handleDeletePet} style={styles.deleteButton}>
          <IconSymbol name="trash" size={20} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      </View>

      <View style={styles.petInfo}>
        <View style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>Tür:</ThemedText>
          <ThemedText style={styles.infoValue}>
            {petTypeName.charAt(0).toUpperCase() + petTypeName.slice(1)}
          </ThemedText>
        </View>
        {pet.breed && (
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Irk:</ThemedText>
            <ThemedText style={styles.infoValue}>{pet.breed}</ThemedText>
          </View>
        )}
        <View style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>Doğum Tarihi:</ThemedText>
          <ThemedText style={styles.infoValue}>{formatBirthDate(pet.birth_date)}</ThemedText>
        </View>
        {pet.gender && (
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Cinsiyet:</ThemedText>
            <ThemedText style={styles.infoValue}>
              {pet.gender === 'male' ? 'Erkek' : 
               pet.gender === 'female' ? 'Dişi' : 
               'Bilinmiyor'}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.todoHeader}>
        <ThemedText style={styles.todoTitle}>Görevler</ThemedText>
        <TouchableOpacity onPress={handleAddTask} style={styles.addButton}>
          <IconSymbol name="plus.circle.fill" size={24} color={Colors[colorScheme ?? 'light'].tint} />
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="checklist" size={48} color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.emptyText}>
            {pet.name} için henüz görev eklemediniz.
          </ThemedText>
          <TouchableOpacity 
            style={[styles.emptyButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={handleAddTask}
          >
            <ThemedText style={styles.emptyButtonText}>Görev Ekle</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TodoItem 
              task={item} 
              onToggleComplete={handleToggleComplete} 
            />
          )}
          style={styles.todoList}
          contentContainerStyle={styles.todoListContent}
        />
      )}
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
  deleteButton: {
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
  petInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: '500',
    marginRight: 8,
    width: 100,
  },
  infoValue: {
    flex: 1,
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  todoTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 4,
  },
  todoList: {
    flex: 1,
  },
  todoListContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: Colors.light.tint,
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
}); 