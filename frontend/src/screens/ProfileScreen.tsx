import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, Platform, ActionSheetIOS } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { updateProfile, getProfile } from '../api';

const PROFILE_KEY = '@user_profile';

const ProfileScreen = () => {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        // Load photo from AsyncStorage
        const stored = await AsyncStorage.getItem(PROFILE_KEY);
        if (stored) {
          const { photo } = JSON.parse(stored);
          setProfilePhoto(photo || null);
        }
        // Load name/email from backend
        const user = await getProfile();
        setName(user.name);
        setEmail(user.email);
      } catch (e) {
        Alert.alert('Error', 'Could not load profile info.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const pickProfilePhoto = async () => {
    try {
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
        Alert.alert('Permission required', 'Photo library permission is required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfilePhoto(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open image picker.');
    }
  };

  const saveProfilePhoto = async (photo: string | null) => {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({ photo }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, email });
      await saveProfilePhoto(profilePhoto);
      setEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (e) {
      Alert.alert('Error', 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    setEditing(false);
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem(PROFILE_KEY);
      if (stored) {
        const { photo } = JSON.parse(stored);
        setProfilePhoto(photo || null);
      }
      const user = await getProfile();
      setName(user.name);
      setEmail(user.email);
    } catch {}
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}><ActivityIndicator size="large" color="#64748B" /></View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color="#64748B" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.avatarContainer} onPress={editing ? pickProfilePhoto : undefined} activeOpacity={editing ? 0.7 : 1}>
        {profilePhoto ? (
          <Image source={{ uri: profilePhoto }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-circle" size={96} color="#CBD5E1" />
          </View>
        )}
        {editing && <View style={styles.editPhotoOverlay}><Ionicons name="camera" size={24} color="#fff" /></View>}
      </TouchableOpacity>
      <View style={styles.infoCard}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={[styles.input, !editing && styles.disabledInput]}
          value={name}
          onChangeText={setName}
          editable={editing}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, !editing && styles.disabledInput]}
          value={email}
          onChangeText={setEmail}
          editable={editing}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity style={styles.changePasswordBtn} onPress={() => navigation.navigate('Auth', { screen: 'recover-password' })}>
          <Text style={styles.changePasswordText}>Change Password</Text>
        </TouchableOpacity>
      </View>
      {editing ? (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.saveBtn]} onPress={handleSave} disabled={saving}>
            <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={handleCancel} disabled={saving}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
          <Ionicons name="pencil" size={20} color="#2563EB" />
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  closeBtn: {
    padding: 4,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E7EF',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E7EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    color: '#334155',
  },
  disabledInput: {
    backgroundColor: '#E0E7EF',
    color: '#94A3B8',
  },
  changePasswordBtn: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  changePasswordText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  saveBtn: {
    backgroundColor: '#2563EB',
  },
  cancelBtn: {
    backgroundColor: '#CBD5E1',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#E0E7EF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  editBtnText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen; 