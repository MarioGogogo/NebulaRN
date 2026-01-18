# React Native APK 体积优化指南

本文档记录了 NebulaRN2 项目的 APK 体积优化过程，包括配置修改和遇到的问题及解决方案，供其他项目参考学习。

## 目录

- [优化效果](#优化效果)
- [优化配置](#优化配置)
- [常见错误及解决方案](#常见错误及解决方案)
- [使用说明](#使用说明)

---

## 优化效果

| 优化项 | 优化前 | 优化后 | 说明 |
|--------|--------|--------|------|
| JS 引擎 | JSC (~6MB) | Hermes (~3MB) | 体积减少约 50% |
| 架构拆分 | 通用 APK (~25MB) | 按架构 (~8-10MB) | 用户下载体积减少 60%+ |
| 代码混淆 | 未启用 | R8 混淆 | 移除未使用代码 |
| 构建速度 | 基础配置 | 并行 + 缓存 | 提升 30%+ |

---

## 优化配置

### 1. Hermes 引擎配置

启用 Hermes 替代 JavaScriptCore (JSC)，Hermes 体积更小、启动更快。

**修改文件**: `android/gradle.properties`

```properties
# 启用 Hermes 引擎
hermesEnabled=true
```

> **注意**: Debug 模式建议设为 `false`，方便开发者调试；Release 模式设为 `true` 用于生产环境。

### 2. Proguard/R8 混淆配置

启用代码压缩和混淆，移除未使用的类和资源。

**修改文件**: `android/app/build.gradle`

```groovy
def enableProguardInReleaseBuilds = true

android {
    buildTypes {
        release {
            minifyEnabled enableProguardInReleaseBuilds
            shrinkResources enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

### 3. Proguard 规则配置

**修改文件**: `android/app/proguard-rules.pro`

```proguard
# React Native 相关类
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# 修复 R8 缺失类问题
-dontwarn com.google.errorprone.annotations.**
-keep class com.google.errorprone.annotations.** { *; }

# 修复 Nimbus JOSE 库缺失类
-dontwarn com.nimbusds.**
-keep class com.nimbusds.** { *; }

# 移除日志（Release 版本减少体积）
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
```

### 4. APK 架构拆分配置

按 CPU 架构拆分 APK，用户只需下载对应架构的版本。

**修改文件**: `android/app/build.gradle`

```groovy
android {
    splits {
        abi {
            enable true
            reset()
            include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
            universalApk true  // 同时生成通用 APK
        }
    }
}
```

### 5. 构建脚本支持多架构导出

**修改文件**: `scripts/build-android.sh`

```bash
# 构建所有架构 APK
./scripts/build-android.sh release all

# 构建单一架构
./scripts/build-android.sh release arm64-v8a    # 64位 ARM
./scripts/build-android.sh release armeabi-v7a  # 32位 ARM
./scripts/build-android.sh release x86          # x86 模拟器
./scripts/build-android.sh release universal    # 通用 APK

# 查看帮助
./scripts/build-android.sh help
```

### 6. Gradle 构建优化

**修改文件**: `android/gradle.properties`

```properties
# 启用并行构建
org.gradle.parallel=true

# 启用构建缓存
org.gradle.caching=true

# 启用配置缓存（实验性功能）
org.gradle.configuration-cache=true

# JVM 内存配置
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
```

### 7. package.json 脚本配置

**修改文件**: `package.json`

```json
{
  "scripts": {
    "build:android": "./scripts/build-android.sh release",
    "build:android:debug": "./scripts/build-android.sh debug",
    "build:android:arm64": "./scripts/build-android.sh release arm64-v8a",
    "build:android:arm32": "./scripts/build-android.sh release armeabi-v7a",
    "build:android:help": "./scripts/build-android.sh help"
  }
}
```

---

## 常见错误及解决方案

### 错误 1: hermesEnabled 变量冲突

**错误信息**:
```
No signature of method: java.lang.Boolean.call() is applicable for argument types: (Boolean) values: [false]
```

**原因**: 在 `build.gradle` 中定义了 `def hermesEnabled = true`，然后在 `buildTypes` 中尝试设置 `hermesEnabled false`，导致变量作用域冲突。

**解决方案**:

1. 移除 `build.gradle` 中重复的 `def hermesEnabled` 定义
2. `hermesFlags` 只能在 `react {}` 块中配置，不能在 `buildTypes` 中设置

**错误配置** (❌):
```groovy
def hermesEnabled = true

android {
    buildTypes {
        debug {
            hermesEnabled false  // 错误！不能在 buildTypes 中设置
        }
    }
}
```

**正确配置** (✅):
```groovy
// gradle.properties
hermesEnabled=true

// build.gradle - react 块中配置 hermesFlags
react {
    hermesFlags = ["-O", "-output-source-map"]
}
```

### 错误 2: 签名文件路径错误

**错误信息**:
```
Keystore file '/Users/.../android/app/my-release-key.keystore' not found for signing config 'release'.
```

**原因**: 签名文件路径配置错误，文件实际在 `android/` 目录，但配置指向 `android/app/`。

**解决方案**:
```groovy
signingConfigs {
    release {
        // 使用相对路径 ../ 指向 android 目录
        storeFile file('../my-release-key.keystore')
        storePassword "your-password"
        keyAlias "your-alias"
        keyPassword "your-password"
    }
}
```

### 错误 3: R8 混淆缺失类

**错误信息**:
```
Missing class com.google.errorprone.annotations.CanIgnoreReturnValue
```

**原因**: R8 混淆时移除了第三方库引用的类，导致运行时可能出问题。

**解决方案**:
```proguard
# proguard-rules.pro 中添加
-dontwarn com.google.errorprone.annotations.**
-keep class com.google.errorprone.annotations.** { *; }

-dontwarn com.nimbusds.**
-keep class com.nimbusds.** { *; }
```

> **提示**: R8 会生成 `app/build/outputs/mapping/release/missing_rules.txt`，列出所有缺失的类，参考该文件添加规则。

### 错误 4: hermesFlags 配置位置错误

**错误信息**:
```
Could not set unknown property 'hermesFlags' for BuildType$AgpDecorated...
```

**原因**: `hermesFlags` 是 `react {}` 块的配置属性，不能在 `buildTypes` 中设置。

**解决方案**:
```groovy
// react 块中配置 ✅
react {
    hermesFlags = ["-O", "-output-source-map"]
}

// buildTypes 中不要配置 hermesFlags ❌
android {
    buildTypes {
        release {
            // 不要在这里设置 hermesFlags
        }
    }
}
```

---

## 使用说明

### 快速开始

```bash
# 安装依赖
npm install

# 构建 Release APK（所有架构）
npm run build:android

# 构建单一架构（推荐用于分发）
npm run build:android:arm64    # 64位 ARM 设备
npm run build:android:arm32    # 32位 ARM 设备

# 查看帮助
npm run build:android:help
```

### APK 输出说明

构建完成后，APK 文件会生成在以下位置：

| 架构 | 文件名 | 预估大小 |
|------|--------|----------|
| 64位 ARM | `app-release-arm64-v8a.apk` | ~8-10 MB |
| 32位 ARM | `app-release-armeabi-v7a.apk` | ~7-9 MB |
| x86 模拟器 | `app-release-x86.apk` | ~10-12 MB |
| 64位 x86 | `app-release-x86_64.apk` | ~10-12 MB |
| 通用 | `app-release-universal.apk` | ~20-25 MB |

### 发布建议

- **Google Play**: 使用架构拆分 APK，用户设备会自动下载对应版本
- **内部分发**: 推荐使用 `arm64-v8a` 架构，覆盖 95%+ 设备
- **调试版本**: 使用 `npm run build:android:debug`

---

## 最佳实践

1. **始终使用 Release 模式测试**: Debug 模式无法验证 Proguard/R8 的问题
2. **查看 R8 警告**: 每次构建后检查 `build/outputs/mapping/release/`
3. **测试所有架构**: 确保应用在不同设备上正常工作
4. **备份签名文件**: 签名文件丢失将无法更新已发布的应用
5. **使用环境变量**: 生产环境签名密码不要硬编码在配置文件中

---

## 参考资源

- [React Native - 构建 APK](https://reactnative.dev/docs/signed-apk)
- [Hermes 引擎文档](https://hermesengine.dev)
- [R8 混淆规则](https://developer.android.com/build/shrink-code)
- [APK Splits 配置](https://developer.android.com/studio/build/configure-apk-splits)
