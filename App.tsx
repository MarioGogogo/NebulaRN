/**
 * 主应用入口
 */

import React, { Suspense, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';

// 使用 React.lazy 和 webpackChunkName 实现远程分包加载
const FeatureScreen = React.lazy(
  () =>
    import(
      /* webpackChunkName: "feature" */ './src/screens/FeatureScreen'
    ),
);

interface Navigation {
  navigate: (screen: string) => void;
}

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<string>('home');

  const navigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const goBack = () => {
    setCurrentScreen('home');
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'home' ? (
        <HomeScreen navigation={{ navigate } as unknown as Navigation} />
      ) : (
        <Suspense fallback={<ActivityIndicator style={styles.loading} />}>
          <FeatureScreen navigation={{ goBack } as unknown as { goBack: () => void }} />
        </Suspense>
      )}
    </View>
  );
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
