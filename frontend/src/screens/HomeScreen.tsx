import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';

const mockBooks = [
  {
    id: '1',
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'An easy & proven way to build good habits and break bad ones.',
    cover: null, // placeholder for image
  },
  {
    id: '2',
    title: 'Deep Work',
    author: 'Cal Newport',
    description: 'Rules for focused success in a distracted world.',
    cover: null,
  },
  {
    id: '3',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    description: 'A journey of self-discovery and following your dreams.',
    cover: null,
  },
];

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Books</Text>
      <FlatList
        data={mockBooks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.coverPlaceholder}>
              {/* Replace with <Image source={{uri: item.cover}} ... /> when available */}
              <Text style={styles.coverText}>Cover</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.author}>{item.author}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
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
  description: {
    fontSize: 14,
    color: '#475569',
  },
});

export default HomeScreen; 