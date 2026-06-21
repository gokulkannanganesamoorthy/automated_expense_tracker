import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from './types';
import { ValuePropScreen } from '../screens/Onboarding/ValuePropScreen';
import { SignInScreen } from '../screens/Onboarding/SignInScreen';
import { PermissionsScreen } from '../screens/Onboarding/PermissionsScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="ValueProp"
    >
      <Stack.Screen name="ValueProp" component={ValuePropScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
    </Stack.Navigator>
  );
}
