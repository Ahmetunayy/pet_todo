import { Image, StyleSheet, Platform, View, FlatList, Text, ActivityIndicator } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface denemeTablosu {
  id: number;
  name: string;
}

export default function HomeScreen() {
  const [data, setData] = useState<denemeTablosu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Supabase sorgusu
        const { data, error } = await supabase
          .from('denemeTablosu')
          .select('*')

        if (error) throw error;
        setData(data || []);
      } catch (err) {
        console.error('Veri çekme hatası:', err);
        setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
          headerImage={
            <Image
              source={require('@/assets/images/partial-react-logo.png')}
              style={styles.reactLogo}
            />
          }>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Hoşgeldiniz!</ThemedText>
            <HelloWave />
          </ThemedView>
        </ParallaxScrollView>
      }
      ListFooterComponent={
        <View>
          {loading && <ActivityIndicator size="large" color="#0000ff" />}
          {error && <Text style={{ color: 'red' }}>{error}</Text>}
        </View>
      }
      renderItem={({ item }) => (
        <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
