import ProductCard from "@/components/ProductCard";
import { toggleTheme, useTheme } from "@/hooks/useTheme";
import { getProducts, Product } from "@/services/api";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CATEGORIES = [
  "All",
  "Electronics",
  "Footwear",
  "Kitchen",
  "Stationery",
  "Clothing",
  "Other",
];

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, []),
  );

  const fetchProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) =>
        selectedCategory === "All" ? true : p.category === selectedCategory,
      )
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search, selectedCategory]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-4 px-5">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-white text-2xl font-bold">Stockify</Text>
            <Text className="text-blue-200 text-sm">
              {filteredProducts.length} Products
            </Text>
          </View>
          <View className="flex-row gap-2">
            {/* Dark Mode Toggle */}
            <TouchableOpacity
              onPress={toggleTheme}
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              className="px-3 py-2 rounded-xl"
            >
              <Text className="text-base">{isDark ? "☀️" : "🌙"}</Text>
            </TouchableOpacity>

            {/* Analytics Button */}
            <TouchableOpacity
              onPress={() => router.push("/analytics")}
              className="bg-blue-500 px-3 py-2 rounded-xl"
            >
              <Text className="text-white text-xs font-medium">
                📊 Analytics
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-4 mt-3 mb-3">
          <View className="bg-blue-500 rounded-2xl px-4 py-2 flex-1 items-center">
            <Text className="text-white text-lg font-bold">
              {products.length}
            </Text>
            <Text className="text-blue-200 text-xs">Total Products</Text>
          </View>
          <View className="bg-blue-500 rounded-2xl px-4 py-2 flex-1 items-center">
            <Text className="text-white text-lg font-bold">
              {products.filter((p) => p.stock <= 10).length}
            </Text>
            <Text className="text-blue-200 text-xs">Low Stock</Text>
          </View>
          <View className="bg-blue-500 rounded-2xl px-4 py-2 flex-1 items-center">
            <Text className="text-white text-lg font-bold">
              ₹
              {products
                .reduce((sum, p) => sum + p.price * p.stock, 0)
                .toLocaleString("en-IN")}
            </Text>
            <Text className="text-blue-200 text-xs">Inventory Value</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={{ backgroundColor: colors.card }}
          className="rounded-2xl flex-row items-center px-4 py-2"
        >
          <Text className="text-gray-400 mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-sm"
            style={{ color: colors.text }}
            placeholder="Search products..."
            placeholderTextColor={colors.subtext}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={{ color: colors.subtext }} className="text-lg">
                ×
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, minHeight: 50 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          gap: 8,
        }}
      >
        {CATEGORIES.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setSelectedCategory(item)}
            style={{
              alignSelf: "flex-start",
              marginRight: 8,
              backgroundColor:
                selectedCategory === item ? colors.primary : colors.card,
              borderColor:
                selectedCategory === item ? colors.primary : colors.border,
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                color: selectedCategory === item ? "#ffffff" : colors.text,
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.subtext }} className="mt-3">
            Loading products...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={{ padding: 12 }}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchProducts}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() =>
                router.push({
                  pathname: "/product/[id]",
                  params: { id: item._id },
                })
              }
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-32">
              <Text className="text-4xl mb-4">🔍</Text>
              <Text style={{ color: colors.subtext }} className="text-lg">
                No products found
              </Text>
              <Text style={{ color: colors.subtext }} className="text-sm mt-1">
                {search ? `No results for "${search}"` : "Tap + to add one"}
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={{ backgroundColor: colors.primary }}
        className="absolute bottom-8 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push("/add-product")}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </TouchableOpacity>
    </View>
  );
}
