# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# ============================================
# React Native 优化规则
# ============================================

# 保留 React Native 相关类
-keep class com.facebook.react.** { *; }
-keep class com.facebook.bridge.** { *; }
-keep class com.facebook.csslayout.** { *; }
-keep class com.facebook.proguard.** { *; }
-keep class com.facebook.soloader.** { *; }
-keep class com.facebook.yoga.** { *; }

# 保留 Hermes 引擎
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# 保留第三方库（按需修改）
-keep class io.invertase.** { *; }
-keep class org.webrtc.** { *; }

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

# 优化 Kotlin（如果使用 Kotlin）
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keepclassmembers class **$WhenMappings {
    <fields>;
}
-keepclassmembers class kotlin.Metadata {
    public <methods>;
}

# 保留枚举
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# 保留 Parcelable
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# 保留 Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# 移除 R8 产生的额外字段描述
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# 优化算法
-optimizations !code/simplification/arithmetic,!field/*,!class/merging/*

# 压缩级别
-optimizationpasses 5

# 允许访问修改成员变量
-allowaccessmodification

# 混淆时保留注解
-keepattributes *Annotation*

# 保留泛型信息
-keepattributes Signature

# 保留内部类
-keepattributes InnerClasses
