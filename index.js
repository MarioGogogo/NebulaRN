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
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// 确认更新某个分包（用户点击更新对话框的确认按钮后调用）
// 返回 true 表示需要重新加载
export function confirmBundleUpdate(screen, version) {
  const oldVersion = loadedVersions[screen];
  loadedVersions[screen] = version;
  console.log(`[ScriptManager] Bundle ${screen} confirmed: ${oldVersion} -> ${version}`);
  return oldVersion && oldVersion !== version;
}

// 更新远程分包配置（供外部调用）
export function updateRemoteBundleConfig(config) {
  // 在更新配置前，保存旧版本到 loadedVersions（如果还没有记录的话）
  // 这样当新版本到来时，我们可以检测到变化
  for (const scriptId in config) {
    const oldConfig = remoteBundleConfig[scriptId];
    if (oldConfig && !loadedVersions[scriptId]) {
      const oldVersion = typeof oldConfig === 'string' ? null : oldConfig.version;
      if (oldVersion) {
        loadedVersions[scriptId] = oldVersion;
        console.log(`[ScriptManager] Initialize loadedVersions for ${scriptId}: ${oldVersion}`);
      }
    }
  }

  remoteBundleConfig = {...remoteBundleConfig, ...config};

  console.log(
    '[ScriptManager] Remote bundle config updated:',
    remoteBundleConfig,
  );
  console.log('[ScriptManager] Loaded versions:', loadedVersions);
}

// 直接检查某个分包是否有更新（供外部调用）
export async function checkBundleVersion(scriptId) {
  const config = remoteBundleConfig[scriptId];
  if (!config) {
    console.warn(`[ScriptManager] No config for chunk: ${scriptId}`);
    return null;
  }

  const latestVersion = typeof config === 'string' ? null : config.version;
  if (!latestVersion) {
    return null;
  }

  const cachedVersion = loadedVersions[scriptId];
  // 只有当已经加载过且版本不同时才是更新
  const isUpdateAvailable = cachedVersion && cachedVersion !== latestVersion;

  console.log(
    `[ScriptManager] Check version for ${scriptId}: cached=${cachedVersion}, latest=${latestVersion}, isUpdateAvailable=${isUpdateAvailable}`,
  );

  if (isUpdateAvailable) {
    return {
      screen: scriptId,
      currentVersion: cachedVersion,
      latestVersion: latestVersion,
      isUpdateAvailable: true,
    };
  }

  return null;
}

// 配置 ScriptManager 用于代码分割（使用 AsyncStorage 实现可靠的缓存管理）
ScriptManager.shared.setStorage(AsyncStorage);

// 缓存已加载的模块版本信息（首次加载后记录版本，用于后续比较）
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
  const cachedVersion = loadedVersions[scriptId];

  // 在 URL 中添加版本参数，让 Re.Pack 自动检测变化
  const versionedUrl = latestVersion ? `${url}?v=${latestVersion}` : url;

  // 首次加载时，记录版本
  if (!cachedVersion && latestVersion) {
    loadedVersions[scriptId] = latestVersion;
    console.log(`[ScriptManager] First load ${scriptId} version: ${latestVersion}`);
  }

  console.log(`[ScriptManager] Loading remote chunk: ${scriptId} from ${versionedUrl}`);
  return {
    url: versionedUrl,
    cache: true, // Re.Pack 会基于 URL 变化自动更新缓存
  };
});

AppRegistry.registerComponent(appName, () => App);
