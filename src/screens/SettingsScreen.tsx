/**
 * 分包页面 - SettingsScreen
 * 使用 Zustand 管理设置状态（与主包共享）
 */

import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import BackButton, { Badge } from '../components/BackButton';
import { useAppStore } from '../store/useAppStore';

interface SettingsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  // 使用 Zustand 全局状态（与主包共享！）
  const { darkMode, notifications, setDarkMode, setNotifications } = useAppStore();

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, darkMode && styles.darkText]}>⚙️ 设置页面</Text>
        <Badge text="settings" color="#4CAF50" />
      </View>
      <Text style={styles.subtitle}>修改设置后返回首页查看状态同步</Text>
      
      <View style={[styles.settingItem, darkMode && styles.darkCard]}>
        <Text style={[styles.settingLabel, darkMode && styles.darkText]}>深色模式</Text>
        <Switch 
          value={darkMode} 
          onValueChange={setDarkMode}
          trackColor={{ true: '#4CAF50' }}
        />
      </View>
      
      <View style={[styles.settingItem, darkMode && styles.darkCard]}>
        <Text style={[styles.settingLabel, darkMode && styles.darkText]}>通知提醒</Text>
        <Switch 
          value={notifications} 
          onValueChange={setNotifications}
          trackColor={{ true: '#4CAF50' }}
        />
      </View>
      
      <View style={[styles.settingItem, darkMode && styles.darkCard]}>
        <Text style={[styles.settingLabel, darkMode && styles.darkText]}>版本号</Text>
        <Text style={styles.settingValue}>1.0.0</Text>
      </View>

      <Text style={styles.hint}>
        💡 这些设置使用 Zustand 管理，返回首页后状态保持同步
      </Text>
      
      <BackButton onPress={() => navigation.goBack()} color="#4CAF50" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  darkText: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  darkCard: {
    backgroundColor: '#333',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
  hint: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
});
