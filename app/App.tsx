import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ChatScreen from './screens/ChatScreen';

export default function App() {
  return (
      <ChatScreen />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});