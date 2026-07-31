import React from 'react';
import { Image, View } from 'react-native';

export default function Logo({ size = 120 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size/2, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12 }}>
      <Image source={require('../../assets/logo.png')} style={{ width: size * 0.85, height: size * 0.85, resizeMode: 'contain' }} />
    </View>
  );
}
