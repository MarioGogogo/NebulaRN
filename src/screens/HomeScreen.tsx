/**
 * 主包页面 - HomeScreen
 * 使用 Zustand 展示全局状态
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAppStore } from '../store/useAppStore';

interface HomeScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

const navButtons = [
  { screen: 'feature', label: '功能页面', color: '#F44336', emoji: '🚀' },
  { screen: 'settings', label: '设置页面', color: '#4CAF50', emoji: '⚙️' },
  { screen: 'profile', label: '用户中心', color: '#2196F3', emoji: '👤' },
  { screen: 'shop', label: '商城页面', color: '#FF9800', emoji: '🛒' },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  // 使用 Zustand 状态
  const { isLoggedIn, user, cartCount, darkMode, login, logout } = useAppStore();

  // 模拟登录
  const handleLogin = () => {
    login('mock-token-123', {
      name: 'React Native 开发者',
      level: 10,
      points: 8888,
    });
  };

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <Text style={[styles.title, darkMode && styles.darkText]}>📦 Re.Pack 分包演示</Text>
      
      {/* 状态展示区域 */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>🔗 Zustand 全局状态</Text>
        <Text style={styles.statusItem}>
          登录状态: {isLoggedIn ? `✅ ${user?.name}` : '❌ 未登录'}
        </Text>
        <Text style={styles.statusItem}>购物车: 🛒 {cartCount} 件</Text>
        <Text style={styles.statusItem}>深色模式: {darkMode ? '🌙 开启' : '☀️ 关闭'}</Text>
        
        <TouchableOpacity 
          style={[styles.loginButton, isLoggedIn && styles.logoutButton]} 
          onPress={isLoggedIn ? logout : handleLogin}
        >
          <Text style={styles.loginButtonText}>
            {isLoggedIn ? '退出登录' : '模拟登录'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>点击按钮加载分包，状态会共享</Text>
      
      <ScrollView style={styles.buttonList} showsVerticalScrollIndicator={false}>
        {navButtons.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={[styles.navButton, { backgroundColor: item.color }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.buttonEmoji}>{item.emoji}</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonLabel}>{item.label}</Text>
              <Text style={styles.buttonChunk}>chunk: {item.screen}</Text>
            </View>
            {item.screen === 'shop' && cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 50,
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statusItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#757575',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonList: {
    flex: 1,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  buttonContent: {
    flex: 1,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  buttonChunk: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  badge: {
    backgroundColor: '#fff',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
