import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const BookDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  // @ts-ignore
  const { book } = route.params;

  const coverUrl = book.formats?.['image/jpeg'] || book.image;
  const htmlUrl = book.formats?.['text/html'] || book.formats?.['text/html; charset=iso-8859-1'];
  const author = book.authors?.[0]?.name || book.author || 'Unknown Author';
  const summary = book.summaries?.[0] || book.description || 'No summary available.';

  return (
    <ScrollView className="flex-1 bg-white p-4">
      {coverUrl && (
        <Image source={{ uri: coverUrl }} className="w-full h-64 rounded-xl mb-4" />
      )}
      <Text className="text-2xl font-bold text-gray-900 mb-2">{book.title}</Text>
      <Text className="text-lg text-gray-700 mb-2">{author}</Text>
      <Text className="text-base text-gray-600 mb-4">{summary}</Text>
      {htmlUrl && (
        <TouchableOpacity
          className="bg-blue-600 rounded-lg py-3 px-6 items-center mb-8"
          onPress={() => navigation.navigate('BookReader' as never, { htmlUrl, title: book.title } as never)}
        >
          <Text className="text-white text-lg font-semibold">Read</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default BookDetailScreen; 