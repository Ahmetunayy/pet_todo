import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { Task } from '@/lib/models';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from './ui/IconSymbol';

interface TodoItemProps {
  task: Task;
  onToggleComplete: (id: string, completed: boolean) => void;
  onPress?: () => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ task, onToggleComplete, onPress }) => {
  const colorScheme = useColorScheme();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: '/todo/[id]',
        params: { id: task.id }
      });
    }
  };

  const handleToggle = () => {
    onToggleComplete(task.id, !task.completed);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  // Kategori rengini al
  const getCategoryColor = () => {
    if (task.category?.color) {
      return task.category.color;
    }
    return Colors[colorScheme ?? 'light'].tint;
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <ThemedView style={styles.card}>
        <TouchableOpacity onPress={handleToggle} style={styles.checkbox}>
          {task.completed ? (
            <IconSymbol 
              name="checkmark.circle.fill" 
              size={24} 
              color={getCategoryColor()} 
            />
          ) : (
            <IconSymbol 
              name="circle" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].text} 
            />
          )}
        </TouchableOpacity>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <ThemedText 
              style={[
                styles.title, 
                task.completed && styles.completedText
              ]}
            >
              {task.title}
            </ThemedText>
            {task.priority && (
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
            )}
          </View>
          
          {task.description && (
            <ThemedText 
              style={[
                styles.description, 
                task.completed && styles.completedText
              ]}
              numberOfLines={2}
            >
              {task.description}
            </ThemedText>
          )}
          
          <View style={styles.metaRow}>
            {task.pet && (
              <View style={styles.petBadge}>
                <IconSymbol 
                  name="pawprint" 
                  size={12} 
                  color={Colors[colorScheme ?? 'light'].text} 
                />
                <ThemedText style={styles.petName}>{task.pet.name}</ThemedText>
              </View>
            )}
            
            {task.due_date && (
              <View style={styles.dateContainer}>
                <IconSymbol 
                  name="calendar" 
                  size={12} 
                  color={Colors[colorScheme ?? 'light'].text} 
                />
                <ThemedText style={styles.date}>
                  {formatDate(task.due_date)}
                </ThemedText>
              </View>
            )}
            
            {task.recurring_type && task.recurring_type !== 'none' && (
              <View style={styles.recurringBadge}>
                <IconSymbol 
                  name="arrow.clockwise" 
                  size={12} 
                  color={Colors[colorScheme ?? 'light'].text} 
                />
                <ThemedText style={styles.recurringText}>
                  {task.recurring_type === 'daily' ? 'Günlük' : 
                   task.recurring_type === 'weekly' ? 'Haftalık' : 
                   task.recurring_type === 'monthly' ? 'Aylık' : 
                   'Yıllık'}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  date: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  petBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  petName: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recurringText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
}); 