/**
 * @format
 */

import {AppRegistry} from 'react-native';
import { ScriptManager, Script } from '@callstack/repack/client';
import App from './App';
import {name as appName} from './app.json';

// 配置 ScriptManager 用于代码分割 (使用内存存储替代 AsyncStorage)
const storage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

ScriptManager.shared.setStorage(storage);
ScriptManager.shared.addResolver(async (scriptId) => {
  // 远程分包的基础 URL（Gitee releases）
  const REMOTE_BASE_URL = 'https://gitee.com/webcc/doudizhu/releases/download/v1.1.0';
  
  // 开发模式：从 DevServer 加载所有分包
  if (__DEV__) {
    console.log(`[ScriptManager] Loading from DevServer: ${scriptId}`);
    return { url: Script.getDevServerURL(scriptId), cache: false };
  }
  
  // 生产模式：从远程服务器加载分包
  console.log(`[ScriptManager] Loading remote chunk: ${scriptId}`);
  return {
    url: `${REMOTE_BASE_URL}/${scriptId}.chunk.bundle`,
    cache: true,
  };
});

AppRegistry.registerComponent(appName, () => App);
