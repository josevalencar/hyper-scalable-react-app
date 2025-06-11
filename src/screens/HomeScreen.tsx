import React from 'react';
import { View } from 'react-native';
import { Text, Button } from '@react-native-material/core';

const HomeScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="h4">Welcome to Insiread</Text>
      <Button title="Get Started" style={{ marginTop: 24 }} />
    </View>
  );
};

export default HomeScreen; 