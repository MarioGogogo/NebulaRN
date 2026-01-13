# Re.Pack 热更新问题梳理文档

> 日期：2026-01-13

## 📋 问题概述

本项目使用 **Re.Pack 5.2.3** 实现 React Native 代码分割（code splitting），在实现热更新功能时遇到了以下问题并逐一解决。

---

## 🐛 问题 1：版本更新检测失败

### 现象
API 更新了版本号，但应用没有提示更新。

### 原因
`updateRemoteBundleConfig` 函数在更新配置时**清空了 `loadedVersions`**，导致版本比较时 `cachedVersion` 为空，永远检测不到更新。

### 修复
```javascript
// index.js - 更新配置前保存旧版本
export function updateRemoteBundleConfig(config) {
  // 保存旧版本到 loadedVersions（如果还没有记录）
  for (const scriptId in config) {
    const oldConfig = remoteBundleConfig[scriptId];
    if (oldConfig && !loadedVersions[scriptId]) {
      const oldVersion = typeof oldConfig === 'string' ? null : oldConfig.version;
      if (oldVersion) {
        loadedVersions[scriptId] = oldVersion;
      }
    }
  }
  remoteBundleConfig = {...remoteBundleConfig, ...config};
}
```

---

## 🐛 问题 2：点击更新后没有重新加载

### 现象
更新弹窗正常显示，但点击"立即更新"后仍然加载旧版本。

### 原因
1. `React.lazy` 会缓存 `import()` 的 Promise 结果
2. JavaScript 运行时会缓存已执行的模块
3. 即使调用 `invalidateScripts` 清除文件缓存，内存中的模块仍然是旧的

### 修复
安装 `react-native-restart` 库，点击更新后**重启整个应用**：

```bash
npm install react-native-restart
```

```javascript
// App.tsx
import RNRestart from 'react-native-restart';

const handleUpdateConfirm = async () => {
  await ScriptManager.shared.invalidateScripts([pending.screen]);
  confirmBundleUpdate(pending.screen, pending.latestVersion);
  RNRestart.restart(); // 重启应用
};
```

---

## 🐛 问题 3：重启后状态丢失

### 现象
应用重启后，用户登录状态、设置等数据全部丢失。

### 原因
Zustand store 使用纯内存存储，重启后状态会重置。

### 修复
使用 **Zustand persist 中间件** + **AsyncStorage** 实现状态持久化：

```bash
npm install @react-native-async-storage/async-storage
```

```typescript
// src/store/useAppStore.ts
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAppStore = create(
  persist(
    (set) => ({ /* 状态和 actions */ }),
    {
      name: 'nebula-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        darkMode: state.darkMode,
        // ...其他需要持久化的状态
      }),
    }
  )
);
```

---

## 🐛 问题 4：ScriptManager 缓存管理不可靠

### 现象
`invalidateScripts` 有时不能正确清除缓存。

### 原因
`ScriptManager.shared.setStorage()` 使用了空实现，Re.Pack 无法正确跟踪已下载的脚本。

### 修复
```javascript
// index.js
import AsyncStorage from '@react-native-async-storage/async-storage';

ScriptManager.shared.setStorage(AsyncStorage);
```

---

## ✅ 最终架构

```
┌─────────────────────────────────────────────────────────┐
│                      热更新流程                          │
├─────────────────────────────────────────────────────────┤
│  1. 启动应用                                             │
│     ↓                                                   │
│  2. 从 API 获取分包配置（含版本号）                        │
│     ↓                                                   │
│  3. 用户点击分包 → checkBundleVersion()                  │
│     ↓                                                   │
│  4. 检测到版本变化 → 显示更新弹窗                          │
│     ↓                                                   │
│  5. 用户点击"立即更新"                                    │
│     ↓                                                   │
│  6. invalidateScripts() 清除缓存                         │
│     ↓                                                   │
│  7. RNRestart.restart() 重启应用                         │
│     ↓                                                   │
│  8. 重新加载 → 从远程下载新版本分包                        │
│     ↓                                                   │
│  9. AsyncStorage 恢复用户状态                            │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 新增依赖

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "^2.x.x",
    "react-native-restart": "^0.x.x"
  }
}
```

---

## 📁 修改的文件

| 文件 | 修改内容 |
|------|---------|
| `index.js` | URL 版本化、版本跟踪逻辑、AsyncStorage 配置 |
| `App.tsx` | 使用 RNRestart 重启应用 |
| `src/store/useAppStore.ts` | 添加 Zustand persist 持久化 |
| `package.json` | 新增依赖 |

---

## 🔧 测试步骤

1. 构建 APK：`npm run build:android`
2. 安装到设备：`adb install -r NebulaRN2-release.apk`
3. 打开应用，点击刷新加载配置
4. 进入任意分包（如 Profile）
5. 在服务端修改该分包版本号
6. 返回首页，点击刷新
7. 再次点击该分包 → 应弹出更新对话框
8. 点击"立即更新" → 应用重启
9. 验证：登录状态保留，分包内容更新
