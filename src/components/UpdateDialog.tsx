/**
 * 模块更新检测弹窗组件
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { ScriptManager } from '@callstack/repack/client';

interface UpdateDialogProps {
  onUpdate: () => void;
  onCancel: () => void;
}

export default function UpdateDialog({ onUpdate, onCancel }: UpdateDialogProps) {
  const { pendingUpdate, darkMode } = useAppStore();

  if (!pendingUpdate) return null;

  const handleUpdate = async () => {
    // 清除该模块的缓存
    await ScriptManager.shared.invalidateScripts([pendingUpdate.screen]);
    onUpdate();
  };

  return (
    <Modal
      transparent
      visible={!!pendingUpdate}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, darkMode && styles.darkDialog]}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📦</Text>
          </View>

          <Text style={[styles.title, darkMode && styles.darkText]}>
            模块有更新
          </Text>

          <Text style={[styles.message, darkMode && styles.darkText]}>
            {pendingUpdate.screen} 模块发现新版本
          </Text>

          <View style={styles.versionInfo}>
            <Text style={[styles.version, darkMode && styles.darkText]}>
              当前版本: {pendingUpdate.currentVersion}
            </Text>
            <Text style={[styles.version, darkMode && styles.darkText]}>
              最新版本: <Text style={styles.latestVersion}>{pendingUpdate.latestVersion}</Text>
            </Text>
          </View>

          <Text style={styles.hint}>
            是否立即更新以获得最新功能？
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>暂不更新</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.updateButton]}
              onPress={handleUpdate}
            >
              <Text style={styles.updateButtonText}>立即更新</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  darkDialog: {
    backgroundColor: '#2a2a2a',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  darkText: {
    color: '#fff',
  },
  versionInfo: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    marginBottom: 16,
  },
  version: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  latestVersion: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: '#2196F3',
  },
  updateButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});
