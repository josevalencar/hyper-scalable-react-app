import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, ListRenderItem, TouchableOpacity } from 'react-native';
import { fetchBooks } from '../api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PAGE_SIZE = 10;

const sizes = {
  small: 16,
  medium: 24,
  large: 32,
};


type Book = {
  id: number;
  title: string;
  authors: { name: string }[];
  formats: { [key: string]: string };
};

type UserBook = {
  id: number;
  title: string;
  author: string;
  description: string;
  year: string;
  image: string;
};

const HomeScreen = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigation = useNavigation<any>();

  const loadUserBooks = useCallback(async () => {
    const stored = await AsyncStorage.getItem('@user_books');
    setUserBooks(stored ? JSON.parse(stored) : []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserBooks();
    }, [loadUserBooks])
  );

  const loadBooks = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    // console.log('Loading books from API...');
    try {
      const data = await fetchBooks(PAGE_SIZE, offset);
      // console.log('Books API response:', data);
      setBooks(prev => [...prev, ...data.results]);
      setOffset(prev => prev + PAGE_SIZE);
      setHasMore(data.next !== null && data.results.length > 0);
    } catch (err) {
      // console.error('Error loading books from API:', err);
    } finally {
      setLoading(false);
    }
  }, [offset, loading, hasMore]);

  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = ({ item }: { item: Book | UserBook }) => {
    const handlePress = () => {
      navigation.navigate('BookDetail', { book: item });
    };
    if ('author' in item) {
      // UserBook
      return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.coverImage} />
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.author}>{item.author}</Text>
              <Text style={styles.year}>{item.year}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      // API Book
      const author = item.authors && item.authors.length > 0 ? item.authors[0].name : 'Unknown Author';
      const coverUrl = item.formats && item.formats['image/jpeg'] ? item.formats['image/jpeg'] : null;
      return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <View style={styles.card}>
            {coverUrl ? (
              <Image source={{ uri: coverUrl }} style={styles.coverImage} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Text style={styles.coverText}>No Cover</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.author}>{author}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const mergedBooks = [...userBooks, ...books];

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Text style={styles.header}>Books</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile' as never)}>
          <Ionicons name="person-circle" size={36} color="#2563EB" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={mergedBooks}
        keyExtractor={item => ('author' in item ? `user-${item.id}` : item.id.toString())}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadBooks}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size='large' color="#64748B" /> : null}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddBook' as never)}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={sizes.large} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 24,
    textAlign: 'left',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    alignItems: 'center',
  },
  coverImage: {
    width: 60,
    height: 90,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#E0E7EF',
  },
  coverPlaceholder: {
    width: 60,
    height: 90,
    backgroundColor: '#E0E7EF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  coverText: {
    color: '#64748B',
    fontSize: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  year: {
    fontSize: 12,
    color: '#94A3B8',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#2563EB',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
});

export default HomeScreen; 