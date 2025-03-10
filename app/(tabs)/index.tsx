import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View, Alert, Image, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { PetCard } from '@/components/PetCard';
import { TodoItem } from '@/components/TodoItem';
import { Pet, Task } from '@/lib/models';
import { getPets, getTasks, updateTask } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, "background")
  const { user, profile, signOut } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (user) {
        const petsData = await getPets(user.id);
        setPets(petsData);

        const tasksData = await getTasks(user.id);
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Veri yüklenirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const updatedTask = await updateTask(id, { completed });
      if (updatedTask) {
        setTasks(tasks.map(task => task.id === id ? { ...task, completed } : task));
      }
    } catch (error) {
      console.error('Görev güncellenirken hata oluştu:', error);
    }
  };

  const handleAddPet = () => {
    router.push('/pet/new');
  };

  const handleAddTask = () => {
    router.push('/todo/new');
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? "light"].tint} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
              <ThemedText style={styles.avatarText}>
                {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </ThemedText>
            </View>
          )}
          <View style={styles.profileTextContainer}>
            <ThemedText style={styles.profileName}>
              {profile?.name || user?.email?.split('@')[0] || 'Kullanıcı'}
            </ThemedText>
            <ThemedText style={styles.profileEmail}>{user?.email}</ThemedText>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <ThemedText style={styles.title}>Evcil Hayvanlarım</ThemedText>
        <TouchableOpacity onPress={handleAddPet} style={styles.addButton}>
          <IconSymbol name="plus.circle.fill" size={24} color={Colors[colorScheme ?? 'light'].tint} />
        </TouchableOpacity>
      </View>

      {pets.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="pawprint.circle" size={48} color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.emptyText}>Henüz evcil hayvan eklemediniz</ThemedText>
          <TouchableOpacity onPress={handleAddPet} style={styles.emptyButton}>
            <ThemedText style={styles.emptyButtonText}>Evcil Hayvan Ekle</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <FlatList
            data={pets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PetCard pet={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petList}
          />
        </View>
      )}

      <View style={styles.header}>
        <ThemedText style={styles.title}>Görevler</ThemedText>
        <TouchableOpacity onPress={handleAddTask} style={styles.addButton}>
          <IconSymbol name="plus.circle.fill" size={24} color={Colors[colorScheme ?? 'light'].tint} />
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="checklist" size={48} color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.emptyText}>Henüz görev eklemediniz</ThemedText>
          <TouchableOpacity onPress={handleAddTask} style={styles.emptyButton}>
            <ThemedText style={styles.emptyButtonText}>Görev Ekle</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
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
    </SafeAreaView>
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
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileTextContainer: {
    marginLeft: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  logoutButton: {
    padding: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 4,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  petList: {
    paddingRight: 16,

  },
  todoList: {
    flex: 1,
  },
  todoListContent: {
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});
