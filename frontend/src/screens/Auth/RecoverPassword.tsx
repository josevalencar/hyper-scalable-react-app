import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { recoverPassword, verifyOtp } from '../../api';

interface RecoverPasswordProps {
  onSwitch: (screen: 'login') => void;
}

const RecoverPassword: React.FC<RecoverPasswordProps> = ({ onSwitch }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await recoverPassword(email);
      Alert.alert('Success', 'OTP sent to your email!');
      setStep('otp');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await verifyOtp(email, otp, newPassword);
      Alert.alert('Success', 'Password reset successfully!');
      onSwitch('login');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 px-4">
      <View className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
        <Text className="text-2xl font-bold text-center mb-4 text-gray-800">Recover Password</Text>
        {step === 'email' ? (
          <>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-base bg-gray-50"
              placeholder="Email"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity className="bg-indigo-600 rounded-xl py-3 mt-2 mb-2" onPress={handleSendOtp} disabled={loading}>
              <Text className="text-white text-center font-semibold text-base">{loading ? 'Sending...' : 'Send OTP'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-base bg-gray-50"
              placeholder="OTP"
              placeholderTextColor="#888"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
            />
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-base bg-gray-50"
              placeholder="New Password"
              placeholderTextColor="#888"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity className="bg-indigo-600 rounded-xl py-3 mt-2 mb-2" onPress={handleResetPassword} disabled={loading}>
              <Text className="text-white text-center font-semibold text-base">{loading ? 'Resetting...' : 'Reset Password'}</Text>
            </TouchableOpacity>
          </>
        )}
        <View className="flex-row justify-center mt-2">
          <TouchableOpacity onPress={() => onSwitch('login')}>
            <Text className="text-indigo-600 font-medium">Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RecoverPassword; 