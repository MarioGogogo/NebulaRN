/**
 * Zustand 全局状态管理
 *
 * 这个 store 会被主包和所有分包共享
 * 分包可以读取和修改主包中的状态
 */

import { create } from 'zustand';

// 用户信息类型
interface User {
  name: string;
  level: number;
  points: number;
}

// 分包配置类型
interface BundleConfig {
  screen: string;
  uniqueKey: string;
  label: string;
  color: string;
  emoji: string;
  url: string;
  version: string;
  des: string;
}

// 模块更新检测类型
interface ModuleUpdateInfo {
  screen: string;
  currentVersion: string;
  latestVersion: string;
  isUpdateAvailable: boolean;
}

// Store 状态类型
interface AppState {
  // 用户认证
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;

  // 应用设置
  darkMode: boolean;
  notifications: boolean;

  // 购物车
  cartCount: number;

  // 分包配置（持久化缓存）
  bundleConfigs: BundleConfig[];
  bundleConfigUpdated: string | null;

  // 模块更新检测
  pendingUpdate: ModuleUpdateInfo | null;
  isCheckingUpdate: boolean;

  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  setDarkMode: (value: boolean) => void;
  setNotifications: (value: boolean) => void;
  addToCart: () => void;
  clearCart: () => void;
  setBundleConfigs: (configs: BundleConfig[]) => void;
  setPendingUpdate: (update: ModuleUpdateInfo | null) => void;
  setCheckingUpdate: (checking: boolean) => void;
}

// 创建 Store
export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  token: null,
  user: null,
  isLoggedIn: false,
  darkMode: false,
  notifications: true,
  cartCount: 0,
  bundleConfigs: [],
  bundleConfigUpdated: null,
  pendingUpdate: null,
  isCheckingUpdate: false,

  // 登录
  login: (token, user) => set({
    token,
    user,
    isLoggedIn: true,
  }),

  // 登出
  logout: () => set({
    token: null,
    user: null,
    isLoggedIn: false,
  }),

  // 设置暗黑模式
  setDarkMode: (value) => set({ darkMode: value }),

  // 设置通知
  setNotifications: (value) => set({ notifications: value }),

  // 购物车操作
  addToCart: () => set((state) => ({ cartCount: state.cartCount + 1 })),
  clearCart: () => set({ cartCount: 0 }),

  // 设置分包配置
  setBundleConfigs: (configs) => set({
    bundleConfigs: configs,
    bundleConfigUpdated: new Date().toLocaleTimeString(),
  }),

  // 设置待更新模块
  setPendingUpdate: (update) => set({ pendingUpdate: update }),

  // 设置检查更新状态
  setCheckingUpdate: (checking) => set({ isCheckingUpdate: checking }),
}));

// 导出便捷 hooks
export const useUser = () => useAppStore((state) => state.user);
export const useIsLoggedIn = () => useAppStore((state) => state.isLoggedIn);
export const useCartCount = () => useAppStore((state) => state.cartCount);
