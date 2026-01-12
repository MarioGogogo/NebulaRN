/**
 * 主应用入口 - 支持多分包
 */

import React, { Suspense, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';

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

// 屏幕映射
const screens: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  feature: FeatureScreen,
  settings: SettingsScreen,
  profile: ProfileScreen,
  shop: ShopScreen,
};

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<string>('home');

  const navigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const goBack = () => {
    setCurrentScreen('home');
  };

  // 渲染当前屏幕
  const renderScreen = () => {
    if (currentScreen === 'home') {
      return <HomeScreen navigation={{ navigate }} />;
    }

    const Screen = screens[currentScreen];
    if (Screen) {
      return (
        <Suspense fallback={<ActivityIndicator size="large" style={styles.loading} />}>
          <Screen navigation={{ goBack }} />
        </Suspense>
      );
    }

    return <HomeScreen navigation={{ navigate }} />;
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
