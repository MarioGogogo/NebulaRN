/**
 * 分包页面 - ShopScreen
 * 使用 Zustand 购物车功能（与主包共享）
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import BackButton, { Badge } from '../components/BackButton';
import { useAppStore } from '../store/useAppStore';

interface ShopScreenProps {
  navigation: {
    goBack: () => void;
  };
}

const products = [
  { id: 1, name: 'React Native 入门', price: 99, emoji: '📘' },
  { id: 2, name: 'Re.Pack 进阶', price: 199, emoji: '📦' },
  { id: 3, name: '分包实战课程', price: 299, emoji: '🎓' },
  { id: 4, name: 'Module Federation', price: 399, emoji: '🔗' },
];

export default function ShopScreen({ navigation }: ShopScreenProps) {
  // 使用 Zustand 购物车状态
  const { cartCount, addToCart, clearCart } = useAppStore();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF3E0" />
      <View style={styles.header}>
        <Text style={styles.title}>🛒 商城页面</Text>
        <Badge text="shop" color="#FF9800" />
      </View>
      
      {/* 购物车状态显示 */}
      <View style={styles.cartInfo}>
        <Text style={styles.cartText}>购物车: {cartCount} 件</Text>
        {cartCount > 0 && (
          <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>清空</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.subtitle}>点击"购买"添加到购物车，返回首页查看数量</Text>
      
      <ScrollView style={styles.productList} showsVerticalScrollIndicator={false}>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Text style={styles.productEmoji}>{product.emoji}</Text>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>¥{product.price}</Text>
            </View>
            <TouchableOpacity style={styles.buyButton} onPress={addToCart}>
              <Text style={styles.buyButtonText}>购买</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      
      <BackButton onPress={() => navigation.goBack()} color="#FF9800" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E65100',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  productList: {
    flex: 1,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  productEmoji: {
    fontSize: 36,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
  },
  buyButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
  },
  clearButton: {
    marginLeft: 12,
    backgroundColor: '#f44336',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
  },
});
