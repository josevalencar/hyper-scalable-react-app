import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Login from './Login';
import Register from './Register';
import RecoverPassword from './RecoverPassword';

interface AuthContainerProps {
  onAuthSuccess: () => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ onAuthSuccess }) => {
  const [screen, setScreen] = useState<'login' | 'register' | 'recover-password'>('login');

  return (
    <>
      {screen === 'login' && <Login onSwitch={() => setScreen('register')} onAuthSuccess={onAuthSuccess} />}
      {screen === 'register' && <Register onSwitch={() => setScreen('login')} onAuthSuccess={onAuthSuccess} />}
      {screen === 'recover-password' && <RecoverPassword onSwitch={() => setScreen('login')} />}
      {screen === 'login' && (
        <RecoverPasswordLink onPress={() => setScreen('recover-password')} />
      )}
    </>
  );
};

const RecoverPasswordLink: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ alignSelf: 'center', marginTop: 12 }}>
    <Text style={{ color: '#4f46e5', fontWeight: '500' }}>Forgot password?</Text>
  </TouchableOpacity>
);

export default AuthContainer; 