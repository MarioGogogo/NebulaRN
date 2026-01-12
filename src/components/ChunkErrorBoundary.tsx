import React, { Component, ReactNode } from 'react';
import { ScriptManager } from '@callstack/repack/client';
import ErrorScreen from '../screens/ErrorScreen';

interface Props {
  children: ReactNode;
  onGoBack: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ChunkErrorBoundary] Failed to load chunk:', error);
  }

  handleRetry = async () => {
    console.log('[ChunkErrorBoundary] Retrying download...');
    
    // 关键修复：清除所有脚本的缓存，强制重新下载
    // 你也可以传递具体的 scriptId 数组如果能获取到的话，但清空所有是最稳妥的重试方式
    await ScriptManager.shared.invalidateScripts([]);
    
    // 重置错误状态，触发 React 重新渲染
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          error={this.state.error || undefined}
          onRetry={this.handleRetry}
          onGoBack={this.props.onGoBack}
        />
      );
    }

    return this.props.children;
  }
}

