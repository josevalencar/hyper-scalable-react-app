import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { login as loginApi } from '../../api';

interface LoginProps {
  onSwitch: () => void;
  onAuthSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitch, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await loginApi(email, password);
      // Optionally store token: res.access_token
      Alert.alert('Success', 'Login successful!');
      onAuthSuccess();
    } catch (err: any) {
      Alert.alert('Login failed', err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 px-4">
      <View className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
        <Text className="text-2xl font-bold text-center mb-4 text-gray-800">Login</Text>
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
        <TouchableOpacity className="bg-indigo-600 rounded-xl py-3 mt-2 mb-2" onPress={handleLogin} disabled={loading}>
          <Text className="text-white text-center font-semibold text-base">{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
        <View className="flex-row justify-between mt-2">
          <TouchableOpacity onPress={onSwitch}>
            <Text className="text-indigo-600 font-medium">Create account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Login; 