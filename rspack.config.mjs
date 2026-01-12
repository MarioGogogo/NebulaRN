import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Rspack configuration enhanced with Re.Pack defaults for React Native.
 *
 * Learn about Rspack configuration: https://rspack.dev/config/
 * Learn about Re.Pack configuration: https://re-pack.dev/docs/guides/configuration
 */

export default Repack.defineRspackConfig({
  context: __dirname,
  entry: './index.js',
  resolve: {
    ...Repack.getResolveOptions(),
  },
  module: {
    rules: [
      {
        test: /\.[cm]?[jt]sx?$/,
        type: 'javascript/auto',
        use: {
          loader: '@callstack/repack/babel-swc-loader',
          parallel: true,
          options: {},
        },
      },
      ...Repack.getAssetTransformRules(),
    ],
  },
  plugins: [
    new Repack.RepackPlugin({
      // 远程分包配置：分包输出到远程服务器，APK 启动时下载
      extraChunks: [
        {
          // 匹配 feature 分包，设为远程加载
          include: /feature/,
          type: 'remote',
          outputPath: path.join(__dirname, 'build/output/android/remote'),
        },
        {
          // 兜底规则：其他 chunks 也作为 remote 处理
          include: /.*/,
          type: 'remote',
          outputPath: path.join(__dirname, 'build/output/android/remote'),
        },
      ],
    }),
  ],
});