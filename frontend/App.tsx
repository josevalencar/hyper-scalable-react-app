import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthContainer from './src/screens/Auth/AuthContainer';
import HomeScreen from './src/screens/HomeScreen';
import "./global.css"

export default function App() {
  const [step, setStep] = useState<'onboarding' | 'auth' | 'home'>('onboarding');

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {step === 'onboarding' && (
        <OnboardingScreen onLogin={() => setStep('auth')} onRegister={() => setStep('auth')} />
      )}
      {step === 'auth' && (
        <AuthContainer onAuthSuccess={() => setStep('home')} />
      )}
      {step === 'home' && <HomeScreen />}
    </SafeAreaView>
  );
}
