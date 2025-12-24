import { Ionicons } from '@expo/vector-icons'; // Certifique-se de ter @expo/vector-icons instalado
import axios from 'axios';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';



interface Package {
  id: number;
  owner_name: string;
  ap_number: string;
  package_type: string;
  user_deliver: string;
  building: string;
  created_at: string;
  updated_at: string;
  photo_field?: string | null;
}

const BASE_URL = 'https://celinda-ticklish-anette.ngrok-free.dev';

export default function App() {
  const { token, signOut, user } = useAuth();
  const router = useRouter();

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchPackages();
      }
    }, [token])
  );

  const filteredPackages = packages.filter(pkg => {
    const query = searchQuery.toLowerCase();
    return (
      pkg.owner_name.toLowerCase().includes(query) ||
      pkg.ap_number.toString().includes(query)
    );
  });

  const fetchPackages = async () => {
    try {
      setError(null);
      // Se for pull-to-refresh, não mostra loading de tela inteira
      if (!refreshing) setLoading(true);

      const response = await axios.get(
        `${BASE_URL}/api/packages/list/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const rawData = response.data;
      const dataList = rawData.results ? rawData.results : rawData;

      if (Array.isArray(dataList)) {
        // Filtrar vazios e também por BUILDING do usuário
        const validPackages = dataList.filter((pkg: any) => {
          const isValid = pkg && pkg.id !== undefined;

          // Lógica de Filtro por Prédio
          // Se o pacote tem 'building' e o usuário tem 'building', devem ser iguais.
          // Se o pacote não tiver field building, mostramos (ou escondemos, dependendo da regra de negócio).
          // Aqui assumirei que só filtramos se ambos existirem.
          const matchesBuilding = user?.building && pkg.building
            ? pkg.building === user.building
            : true; // Se não tiver info, mostra tudo (fallback)

          return isValid && matchesBuilding;
        });
        setPackages(validPackages);
      } else {
        setError("Formato de dados inválido.");
      }

    } catch (err: any) {
      console.error("Erro ao buscar pacotes:", err.message);
      setError("Não foi possível carregar as encomendas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPackages();
  };

  const renderItem = ({ item }: { item: Package }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.ownerName}>{item.owner_name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Apto {item.ap_number}</Text>
        </View>
      </View>

      <Text style={styles.typeText}>📦 {item.package_type}</Text>

      <Text style={styles.dateText}>
        📅 {new Date(item.created_at).toLocaleDateString('pt-BR')} às {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </Text>

      {item.photo_field && (
        <Image
          source={{
            uri: item.photo_field.replace('http://127.0.0.1:8000', BASE_URL).replace('http://localhost:8000', BASE_URL)
          }}
          style={styles.packageImage}
          resizeMode="cover"
        />
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5a32a3" />
        <Text style={{ marginTop: 10 }}>Carregando encomendas...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5a32a3" />

      {/* Header Personalizado */}
      <View style={styles.navBar}>
        <View>
          <Text style={styles.navTitle}>Delivery IO</Text>
          <Text style={styles.navSubtitle}>
            Olá, {user?.username || 'Porteiro'}
            {user?.building ? ` • ${user.building}` : ''}
          </Text>
        </View>

        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou apto..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>{error}</Text>
          <TouchableOpacity onPress={fetchPackages} style={styles.retryButton}>
            <Text style={styles.retryText}>Tentar Novamente ↻</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPackages}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5a32a3']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery ? "Nenhum resultado encontrado." : "Nenhuma encomenda registrada."}
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/post')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  navBar: {
    backgroundColor: '#5a32a3',
    padding: 20,
    paddingTop: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4
  },
  navTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  navSubtitle: { color: '#e0e0e0', fontSize: 14 },
  logoutButton: { padding: 8 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },

  card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 15, borderLeftWidth: 5, borderLeftColor: '#ff6b35', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ownerName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  badge: { backgroundColor: '#ff6b35', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  typeText: { color: '#5a32a3', fontWeight: '600', fontSize: 16, marginBottom: 4 },
  dateText: { color: '#888', fontSize: 12, marginBottom: 10 },
  packageImage: { width: '100%', height: 200, borderRadius: 8, marginTop: 10, backgroundColor: '#eee' },

  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#ff6b35',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },

  retryButton: { padding: 10 },
  retryText: { color: '#5a32a3', fontWeight: 'bold', fontSize: 16 },

  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#888', marginTop: 10, fontSize: 16 }
});