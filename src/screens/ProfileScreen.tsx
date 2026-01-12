/**
 * 分包页面 - ProfileScreen
 * 使用 Zustand 读取用户信息（从主包登录后同步）
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BackButton, { Badge } from '../components/BackButton';
import { useAppStore } from '../store/useAppStore';

interface ProfileScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  // 从 Zustand 获取用户信息（主包登录后这里自动同步）
  const { user, isLoggedIn, cartCount } = useAppStore();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{isLoggedIn ? '😊' : '👤'}</Text>
      </View>
      
      <View style={styles.header}>
        <Text style={styles.title}>用户中心</Text>
        <Badge text="profile" color="#2196F3" />
      </View>
      
      {isLoggedIn ? (
        <>
          <Text style={styles.subtitle}>✅ 已登录（状态来自 Zustand）</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>用户名</Text>
              <Text style={styles.infoValue}>{user?.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>等级</Text>
              <Text style={styles.infoValue}>LV.{user?.level}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>积分</Text>
              <Text style={styles.infoValue}>{user?.points?.toLocaleString()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>购物车</Text>
              <Text style={styles.infoValue}>🛒 {cartCount} 件</Text>
            </View>
          </View>
        </>
      ) : (
        <Text style={styles.notLoggedIn}>
          ❌ 未登录{'\n'}请返回首页点击"模拟登录"
        </Text>
      )}
      
      <BackButton onPress={() => navigation.goBack()} color="#2196F3" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  notLoggedIn: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
});
