/**
 * 主包页面 - HomeScreen
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface HomeScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>主包页面</Text>
      <Text style={styles.description}>这是主包中的首页</Text>
      <TouchableOpacity
        style={styles.buttonRemote}
        onPress={() => navigation.navigate('FeatureScreen')}
      >
        <Text style={styles.buttonText}>跳转到分包页面 (远程)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  buttonLocal: {
    backgroundColor: '#4CAF50', // 绿色 = 本地分包
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonRemote: {
    backgroundColor: '#F44336', // 红色 = 远程分包
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
