import React from 'react';
import { useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

const BookReaderScreen = () => {
  const route = useRoute();
  // @ts-ignore
  const { htmlUrl } = route.params;

  return (
    <WebView
      source={{ uri: htmlUrl }}
      style={{ flex: 1 }}
      startInLoadingState
    />
  );
};

export default BookReaderScreen; 