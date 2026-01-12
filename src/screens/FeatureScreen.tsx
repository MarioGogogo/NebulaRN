/**
 * 分包页面 - FeatureScreen
 * 文件名以 "local" 结尾，会被打包成本地 chunk
 */

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface FeatureScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export default function FeatureScreen({ navigation }: FeatureScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>分包页面</Text>
      <Text style={styles.description}>这是一个分包页面 (FeatureScreen.local)</Text>
      <Text style={styles.info}>分包可以按需加载，减少主包体积</Text>
      <Button title="返回" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  info: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
});
