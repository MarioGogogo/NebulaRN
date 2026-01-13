/*
 * @Author: EdisonChan 148373644@qq.com
 * @Date: 2026-01-13 14:49:43
 * @LastEditors: EdisonChan 148373644@qq.com
 * @LastEditTime: 2026-01-13 15:41:53
 * @FilePath: /NebulaRN/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {ScriptManager, Script} from '@callstack/repack/client';
import App from './App';

const appJson = require('./app.json');
const appName = appJson.name;

// 远程分包配置（完全由 API 动态提供）
let remoteBundleConfig = {};

// 更新回调（供 App.tsx 设置）
let onVersionCheckCallback = null;

// 设置版本检查回调
export function setVersionCheckCallback(callback) {
  onVersionCheckCallback = callback;
  console.log('[ScriptManager] Version check callback set');
}

// 更新远程分包配置（供外部调用）
export function updateRemoteBundleConfig(config) {
  remoteBundleConfig = {...remoteBundleConfig, ...config};
  console.log(
    '[ScriptManager] Remote bundle config updated:',
    remoteBundleConfig,
  );
}

// 配置 ScriptManager 用于代码分割 (使用内存存储替代 AsyncStorage)
const storage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

ScriptManager.shared.setStorage(storage);

// 缓存已加载的模块版本信息
const loadedVersions = {};

ScriptManager.shared.addResolver(async scriptId => {
  console.log(`[ScriptManager] Resolving: ${scriptId}, DEV: ${__DEV__}`);

  // 开发模式：从 DevServer 加载所有分包（跳过版本检查）
  if (__DEV__) {
    const devUrl = Script.getDevServerURL(scriptId);
    console.log(`[ScriptManager] DevServer URL: ${devUrl}`);
    return {url: devUrl, cache: false};
  }

  // 生产模式：从远程服务器加载分包（使用动态配置 + 版本检查）
  const config = remoteBundleConfig[scriptId];
  if (!config) {
    console.warn(`[ScriptManager] No config configured for chunk: ${scriptId}`);
    throw new Error(`Chunk ${scriptId} not configured`);
  }

  const url = typeof config === 'string' ? config : config.url;
  const latestVersion = typeof config === 'string' ? null : config.version;

  // 版本检查：如果有更新且用户已确认更新，则跳过缓存
  if (latestVersion && onVersionCheckCallback) {
    const cachedVersion = loadedVersions[scriptId];
    const isUpdateAvailable = cachedVersion && cachedVersion !== latestVersion;

    if (isUpdateAvailable) {
      console.log(
        `[ScriptManager] ${scriptId} has update: ${cachedVersion} -> ${latestVersion}`,
      );
      // 通知 App.tsx 显示更新对话框
      onVersionCheckCallback({
        screen: scriptId,
        currentVersion: cachedVersion,
        latestVersion: latestVersion,
        isUpdateAvailable: true,
      });

      // 等待用户确认更新（这里返回当前 URL，缓存会在用户确认后清除）
      console.log(
        `[ScriptManager] Waiting for user confirmation to update ${scriptId}`,
      );
    }

    // 更新缓存版本
    loadedVersions[scriptId] = latestVersion;
  }

  console.log(`[ScriptManager] Loading remote chunk: ${scriptId} from ${url}`);
  return {
    url,
    cache: true,
  };
});

AppRegistry.registerComponent(appName, () => App);
