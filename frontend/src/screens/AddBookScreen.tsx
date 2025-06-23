import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActionSheetIOS, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AddBookScreen = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const navigation = useNavigation();

  const pickOrTakeImage = async () => {
    try {
      // Request permissions
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert('Permission required', 'Camera and photo library permissions are required.');
        return;
      }

      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Take Photo', 'Choose from Library'],
            cancelButtonIndex: 0,
          },
          async (buttonIndex) => {
            if (buttonIndex === 1) {
              try {
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: 'images',
                  allowsEditing: true,
                  aspect: [3, 4],
                  quality: 1,
                });
                if (!result.canceled && result.assets && result.assets.length > 0) {
                  setImage(result.assets[0].uri);
                }
              } catch (e) {
                Alert.alert('Error', 'Could not open camera.');
                console.error(e);
              }
            } else if (buttonIndex === 2) {
              try {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: 'images',
                  allowsEditing: true,
                  aspect: [3, 4],
                  quality: 1,
                });
                if (!result.canceled && result.assets && result.assets.length > 0) {
                  setImage(result.assets[0].uri);
                }
              } catch (e) {
                Alert.alert('Error', 'Could not open image library.');
                console.error(e);
              }
            }
          }
        );
      } else {
        // Android: show picker for both
        try {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [3, 4],
            quality: 1,
          });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
          }
        } catch (e) {
          Alert.alert('Error', 'Could not open image library.');
          console.error(e);
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open image picker.');
      console.error(e);
    }
  };

  const saveBook = async () => {
    if (!title || !author || !description || !year || !image) {
      Alert.alert('Please fill all fields and select a cover image.');
      return;
    }
    const newBook = {
      id: Date.now(),
      title,
      author,
      description,
      year,
      image,
    };
    try {
      const existing = await AsyncStorage.getItem('@user_books');
      const books = existing ? JSON.parse(existing) : [];
      books.unshift(newBook);
      await AsyncStorage.setItem('@user_books', JSON.stringify(books));
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error saving book');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add a New Book</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickOrTakeImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.imageText}>Pick or Take a Cover Image</Text>
        )}
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Author Name"
        value={author}
        onChangeText={setAuthor}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Year"
        value={year}
        onChangeText={setYear}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.saveButton} onPress={saveBook}>
        <Text style={styles.saveButtonText}>Save Book</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 24,
  },
  imagePicker: {
    width: 120,
    height: 160,
    backgroundColor: '#E0E7EF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 120,
    height: 160,
    borderRadius: 12,
  },
  imageText: {
    color: '#64748B',
    fontSize: 14,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E7EF',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddBookScreen; 