import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { Product } from '../interface/Product';
import { HomeStackParamList } from '../navigation/type';
import { api } from '../../api/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<HomeStackParamList>>();
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]); // 存放所有商品
  const [filteredProducts, setFilteredProducts] = useState([]); // 搜索後的商品

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(api.GetAllProducts);
      const data = await response.json();
      if (data.code === 200) {
        setProducts(data.body);
        setFilteredProducts(data.body); // 初始值與所有商品相同
        setLoading(false);
      } else {
        Alert.alert('錯誤', data.message || '無法獲取商品數據');
      }
    } catch (error) {
      Alert.alert('錯誤', '無法連接到伺服器');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // 當頁面獲得焦點時執行
      fetchProducts();
    }, [])
  );

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((product: Product) =>
          product.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setFilteredProducts(products);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productContainer}
      onPress={() =>
        navigation.navigate('Product', { productId: item._id, source: 'Home' })
      }
    >
      <Image
        source={{ uri: item.photouri }}
        style={styles.productImage}
      />
      <View style={styles.detailContainer}>
        <Text style={styles.productTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.author} numberOfLines={1}>{item.author}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.searchBox}>
            <Ionicons style={styles.searchImg} name="search-outline" size={20} />
            <TextInput
              style={styles.search}
              placeholder="搜尋商品"
              value={searchText}
              onChangeText={handleSearch}
            />
            {searchText ? (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="gray" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <Text style={styles.footerText}>沒有更多商品了</Text>
          }
          onRefresh={fetchProducts}
          refreshing={loading}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '90%',
    paddingHorizontal: 10,
  },
  searchImg: {
    marginRight: 8,
  },
  search: {
    flex: 1,
    height: 40,
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 20,
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    width: width - 20,
    alignSelf: 'center',
  },
  productImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
  detailContainer: {
    flexDirection: 'column',
  },
  productTitle: {
    maxWidth: 260,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  author: {
    maxWidth: 260,
    fontSize: 12,
    paddingBottom: 10,
    color: '#777'
  },
  productPrice: {
    fontSize: 16,
    color: 'red',
  },
  updateText: {
    marginTop: 10,
    color: 'blue',
    fontSize: 14,
  },
  footerText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 10,
    fontSize: 14,
  },
});