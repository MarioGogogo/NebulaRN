/**
 * 主应用入口 - 支持多分包 + 错误处理 + 模块更新检测 + Android 滑动动画
 */

import React, { Suspense, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Animated, Dimensions } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import ChunkErrorBoundary from './src/components/ChunkErrorBoundary';
import UpdateDialog from './src/components/UpdateDialog';
import { useAppStore } from './src/store/useAppStore';
import { setVersionCheckCallback, confirmBundleUpdate } from './index';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 使用 React.lazy 和 webpackChunkName 实现多分包加载
const FeatureScreen = React.lazy(
  () => import(/* webpackChunkName: "feature" */ './src/screens/FeatureScreen'),
);

const SettingsScreen = React.lazy(
  () => import(/* webpackChunkName: "settings" */ './src/screens/SettingsScreen'),
);

const ProfileScreen = React.lazy(
  () => import(/* webpackChunkName: "profile" */ './src/screens/ProfileScreen'),
);

const ShopScreen = React.lazy(
  () => import(/* webpackChunkName: "shop" */ './src/screens/ShopScreen'),
);

const UpdateTestScreen = React.lazy(
  () => import(/* webpackChunkName: "update" */ './src/screens/UpdateTestScreen'),
);

// 屏幕映射
const screens: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  feature: FeatureScreen,
  settings: SettingsScreen,
  profile: ProfileScreen,
  shop: ShopScreen,
  update: UpdateTestScreen,
};

// 动画配置
const ANIMATION_DURATION = 350;

function App(): React.JSX.Element {
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [nextScreen, setNextScreen] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // 动画值
  const homeProgress = useRef(new Animated.Value(1)).current;
  const nextProgress = useRef(new Animated.Value(0)).current;

  // 从 Zustand 获取更新相关状态
  const { setPendingUpdate, setCheckingUpdate } = useAppStore();

  // 缓存 navigation 对象
  const navigation = useMemo(() => ({
    navigate: (screen: string) => {
      if (currentScreen === 'home' && screen !== 'home') {
        startSlideIn(screen);
      }
    },
  }), [currentScreen]);

  // 滑动进入动画
  const startSlideIn = useCallback((screen: string) => {
    setNextScreen(screen);
    setIsDetailVisible(true);

    // 并行执行动画
    Animated.parallel([
      // 首页向左滑出
      Animated.timing(homeProgress, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      // 新页面从右侧滑入
      Animated.timing(nextProgress, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentScreen(screen);
      setNextScreen(null);
      // 重置首页位置
      homeProgress.setValue(0);
      nextProgress.setValue(1);
    });
  }, [homeProgress, nextProgress]);

  // 返回动画
  const startSlideOut = useCallback(() => {
    // 并行执行动画
    Animated.parallel([
      // 首页从左侧滑入
      Animated.timing(homeProgress, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      // 当前页面向右滑出
      Animated.timing(nextProgress, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsDetailVisible(false);
      setCurrentScreen('home');
      // 重置所有状态
      homeProgress.setValue(1);
      nextProgress.setValue(0);
    });
  }, [homeProgress, nextProgress]);

  const goBack = useCallback(() => {
    startSlideOut();
  }, [startSlideOut]);

  const handleRetry = useCallback(() => {
    setRetryKey(prev => prev + 1);
  }, []);

  // 版本检查回调
  const handleVersionCheck = useCallback((updateInfo: { screen: string; currentVersion: string; latestVersion: string; isUpdateAvailable: boolean }) => {
    console.log('[App] Version check found update:', updateInfo);
    setPendingUpdate(updateInfo);
    setCheckingUpdate(false);
  }, [setPendingUpdate, setCheckingUpdate]);

  useEffect(() => {
    setVersionCheckCallback(handleVersionCheck);
  }, [handleVersionCheck]);

  const handleUpdateConfirm = useCallback(() => {
    console.log('[App] User confirmed update, clearing cache and reloading...');
    // 确认更新，更新已确认版本
    const pending = useAppStore.getState().pendingUpdate;
    if (pending) {
      confirmBundleUpdate(pending.screen, pending.latestVersion);
    }
    setPendingUpdate(null);
    setRetryKey(prev => prev + 1);
  }, [setPendingUpdate]);

  const handleUpdateCancel = useCallback(() => {
    console.log('[App] User cancelled update, will use cached version');
    setPendingUpdate(null);
  }, [setPendingUpdate]);

  // 根据 progress 计算位移
  const homeTranslateX = homeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, 0],
  });

  const nextTranslateX = nextProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH, 0],
  });

  // 渲染首页
  const renderHome = () => (
    <Animated.View
      style={[
        styles.screen,
        {
          transform: [{ translateX: homeTranslateX }],
        },
      ]}
    >
      <HomeScreen navigation={navigation} />
    </Animated.View>
  );

  // 渲染详情页
  const renderDetail = () => {
    if (!isDetailVisible && currentScreen === 'home') return null;

    const screenName = nextScreen || currentScreen;
    const Screen = screens[screenName];
    if (!Screen) return null;

    return (
      <Animated.View
        style={[
          styles.screen,
          {
            transform: [{ translateX: nextTranslateX }],
          },
        ]}
      >
        <ChunkErrorBoundary key={retryKey} onGoBack={goBack} onRetry={handleRetry}>
          <Suspense fallback={<ActivityIndicator size="large" style={styles.loading} />}>
            <Screen navigation={{ goBack }} />
          </Suspense>
        </ChunkErrorBoundary>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHome()}
      {renderDetail()}
      <UpdateDialog onUpdate={handleUpdateConfirm} onCancel={handleUpdateCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  screen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
