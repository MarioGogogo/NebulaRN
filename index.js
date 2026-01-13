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

// 确认更新某个分包（用户点击更新对话框的确认按钮后调用）
export function confirmBundleUpdate(screen, version) {
  lastConfirmedVersion[screen] = version;
  console.log(`[ScriptManager] Bundle ${screen} confirmed to version ${version}`);
}

// 更新远程分包配置（供外部调用）
export function updateRemoteBundleConfig(config) {
  remoteBundleConfig = {...remoteBundleConfig, ...config};

  // 清除已加载的版本，强制重新检查版本
  for (const key in loadedVersions) {
    delete loadedVersions[key];
  }

  console.log(
    '[ScriptManager] Remote bundle config updated, versions cleared:',
    remoteBundleConfig,
  );
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

  const confirmedVersion = lastConfirmedVersion[scriptId];
  const isUpdateAvailable = confirmedVersion && confirmedVersion !== latestVersion;

  console.log(
    `[ScriptManager] Check version for ${scriptId}: confirmed=${confirmedVersion}, latest=${latestVersion}, isUpdateAvailable=${isUpdateAvailable}`,
  );

  if (isUpdateAvailable) {
    return {
      screen: scriptId,
      currentVersion: confirmedVersion,
      latestVersion: latestVersion,
      isUpdateAvailable: true,
    };
  }

  return null;
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
// 记录上次已确认的版本（持久化，不随缓存清除而丢失）
const lastConfirmedVersion = {};

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
    const confirmedVersion = lastConfirmedVersion[scriptId];

    // 只在真正有更新时显示对话框（排除首次加载和相同版本）
    const isUpdateAvailable = confirmedVersion && confirmedVersion !== latestVersion;

    if (isUpdateAvailable) {
      console.log(
        `[ScriptManager] ${scriptId} has update: ${confirmedVersion} -> ${latestVersion}`,
      );
      // 通知 App.tsx 显示更新对话框
      onVersionCheckCallback({
        screen: scriptId,
        currentVersion: confirmedVersion,
        latestVersion: latestVersion,
        isUpdateAvailable: true,
      });

      // 等待用户确认更新
      console.log(
        `[ScriptManager] Waiting for user confirmation to update ${scriptId}`,
      );
    }

    // 更新缓存版本和已确认版本
    loadedVersions[scriptId] = latestVersion;
    // 如果没有已确认版本（首次加载），将其设置为当前版本
    if (!confirmedVersion) {
      lastConfirmedVersion[scriptId] = latestVersion;
    }
  }

  console.log(`[ScriptManager] Loading remote chunk: ${scriptId} from ${url}`);
  return {
    url,
    cache: true,
  };
});

AppRegistry.registerComponent(appName, () => App);
