/**
 * 分包页面 - UpdateTestScreen
 * 模拟模块更新测试页面
 */

import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import BackButton, { Badge } from '../components/BackButton';

interface UpdateTestScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export default function UpdateTestScreen({ navigation }: UpdateTestScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8EAF6" />
      <View style={styles.header}>
        <Text style={styles.title}>🔄 更新测试</Text>
        <Badge text="update" color="#673AB7" />
      </View>
      <Text style={styles.description}>这是更新测试分包</Text>
      <Text style={styles.info}>用于测试模块版本更新弹窗功能</Text>
      <BackButton onPress={() => navigation.goBack()} color="#673AB7" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8EAF6',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4527A0',
    marginRight: 8,
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
    textAlign: 'center',
  },
});
