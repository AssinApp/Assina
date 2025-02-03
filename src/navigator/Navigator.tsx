import React from 'react';
import RootNavigator from '@/navigator/RootNavigator';

export default function Navigator() {
  // Não precisa de NavigationContainer aqui, pois já está em RootNavigator.
  return <RootNavigator />;
}
