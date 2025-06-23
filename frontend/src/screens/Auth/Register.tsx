import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { register as registerApi } from '../../api';

interface RegisterProps {
  onSwitch: () => void;
  onAuthSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitch, onAuthSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await registerApi(name, email, password);
      Alert.alert('Success', 'Registration successful!');
      onAuthSuccess();
    } catch (err: any) {
      Alert.alert('Registration failed', err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 px-4">
      <View className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
        <Text className="text-2xl font-bold text-center mb-4 text-gray-800">Register</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-base bg-gray-50"
          placeholder="Name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-base bg-gray-50"
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-base bg-gray-50"
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity className="bg-indigo-600 rounded-xl py-3 mt-2 mb-2" onPress={handleRegister} disabled={loading}>
          <Text className="text-white text-center font-semibold text-base">{loading ? 'Registering...' : 'Register'}</Text>
        </TouchableOpacity>
        <View className="flex-row justify-center mt-2">
          <TouchableOpacity onPress={onSwitch}>
            <Text className="text-indigo-600 font-medium">Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Register; 