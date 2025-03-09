import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Pet, Task } from '@/lib/models';
import { deleteTask, getPet, getTask, updateTask } from '@/lib/api';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const [task, setTask] = useState<Task | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const taskData = await getTask(id);
      setTask(taskData);

      if (taskData && taskData.pet_id) {
        const petData = await getPet(taskData.pet_id);
        setPet(petData);
      }
    } catch (error) {
      console.error('Veri yüklenirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!task) return;

    try {
      const updatedTask = await updateTask(id, { completed: !task.completed });
      if (updatedTask) {
        setTask(updatedTask);
      }
    } catch (error) {
      console.error('Görev güncellenirken hata oluştu:', error);
      Alert.alert('Hata', 'Görev güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleDeleteTask = async () => {
    Alert.alert(
      'Görevi Sil',
      'Bu görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteTask(id);
              if (success) {
                Alert.alert('Başarılı', 'Görev başarıyla silindi.', [
                  { text: 'Tamam', onPress: () => router.back() }
                ]);
              }
            } catch (error) {
              console.error('Görev silinirken hata oluştu:', error);
              Alert.alert('Hata', 'Görev silinirken bir hata oluştu. Lütfen tekrar deneyin.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getRecurringText = (recurringType?: string) => {
    if (!recurringType || recurringType === 'none') return 'Tekrarlanmıyor';
    
    return recurringType === 'daily' ? 'Günlük' : 
           recurringType === 'weekly' ? 'Haftalık' : 
           recurringType === 'monthly' ? 'Aylık' : 
           'Yıllık';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }

  if (!task) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Görev</ThemedText>
          <View style={styles.backButton} />
        </View>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.errorText}>Görev bulunamadı.</ThemedText>
          <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
            <ThemedText style={styles.errorButtonText}>Geri Dön</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // Kategori rengini al
  const getCategoryColor = () => {
    if (task.category?.color) {
      return task.category.color;
    }
    return Colors[colorScheme ?? 'light'].tint;
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Görev Detayı</ThemedText>
        <TouchableOpacity onPress={handleDeleteTask} style={styles.deleteButton}>
          <IconSymbol name="trash" size={20} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={handleToggleComplete} style={styles.checkbox}>
            {task.completed ? (
              <IconSymbol 
                name="checkmark.circle.fill" 
                size={28} 
                color={getCategoryColor()} 
              />
            ) : (
              <IconSymbol 
                name="circle" 
                size={28} 
                color={Colors[colorScheme ?? 'light'].text} 
              />
            )}
          </TouchableOpacity>
          <ThemedText style={[styles.taskTitle, task.completed && styles.completedText]}>
            {task.title}
          </ThemedText>
        </View>

        {task.description && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Açıklama</ThemedText>
            <ThemedText style={[styles.description, task.completed && styles.completedText]}>
              {task.description}
            </ThemedText>
          </View>
        )}

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Detaylar</ThemedText>
          
          {pet && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <IconSymbol name="pawprint" size={16} color={Colors[colorScheme ?? 'light'].text} />
                <ThemedText style={styles.detailLabel}>Evcil Hayvan</ThemedText>
              </View>
              <ThemedText style={styles.detailValue}>{pet.name}</ThemedText>
            </View>
          )}

          {task.category && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <IconSymbol name="tag" size={16} color={Colors[colorScheme ?? 'light'].text} />
                <ThemedText style={styles.detailLabel}>Kategori</ThemedText>
              </View>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]}>
                <ThemedText style={styles.categoryText}>{task.category.name}</ThemedText>
              </View>
            </View>
          )}

          {task.due_date && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <IconSymbol name="calendar" size={16} color={Colors[colorScheme ?? 'light'].text} />
                <ThemedText style={styles.detailLabel}>Tarih</ThemedText>
              </View>
              <ThemedText style={styles.detailValue}>{formatDate(task.due_date)}</ThemedText>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <IconSymbol name="arrow.clockwise" size={16} color={Colors[colorScheme ?? 'light'].text} />
              <ThemedText style={styles.detailLabel}>Tekrarlama</ThemedText>
            </View>
            <ThemedText style={styles.detailValue}>{getRecurringText(task.recurring_type)}</ThemedText>
          </View>

          {task.priority && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <IconSymbol name="flag" size={16} color={Colors[colorScheme ?? 'light'].text} />
                <ThemedText style={styles.detailLabel}>Öncelik</ThemedText>
              </View>
              <View style={[
                styles.priorityBadge, 
                { 
                  backgroundColor: 
                    task.priority === 'high' ? '#f44336' : 
                    task.priority === 'medium' ? '#ff9800' : 
                    '#4caf50'
                }
              ]}>
                <ThemedText style={styles.priorityText}>
                  {task.priority === 'high' ? 'Yüksek' : 
                   task.priority === 'medium' ? 'Orta' : 
                   'Düşük'}
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '500',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  detailLabel: {
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
}); 