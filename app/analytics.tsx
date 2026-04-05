import { Product } from "@/services/api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundColor: "#2563eb",
  backgroundGradientFrom: "#2563eb",
  backgroundGradientTo: "#1d4ed8",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

export default function AnalyticsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { getProducts } = await import("@/services/api");
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  };

  // Category wise count
  const categoryData = products.reduce((acc: Record<string, number>, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const barData = {
    labels: Object.keys(categoryData).map((k) => k.substring(0, 5)),
    datasets: [{ data: Object.values(categoryData) }],
  };

  const COLORS = [
    "#2563eb",
    "#7c3aed",
    "#db2777",
    "#ea580c",
    "#16a34a",
    "#ca8a04",
  ];

  const pieData = Object.keys(categoryData).map((cat, i) => ({
    name: cat,
    population: categoryData[cat],
    color: COLORS[i % COLORS.length],
    legendFontColor: "#374151",
    legendFontSize: 12,
  }));

  // Top 3 expensive products
  const topProducts = [...products]
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);

  // Low stock products
  const lowStockProducts = products.filter((p) => p.stock <= 10);

  // Total inventory value
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-5 px-5 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-white text-lg">←</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-white text-xl font-bold">Analytics</Text>
          <Text className="text-blue-200 text-xs">Inventory Insights</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Stats Cards */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
            <Text className="text-gray-400 text-xs">Total Products</Text>
            <Text className="text-blue-600 text-2xl font-bold">
              {products.length}
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
            <Text className="text-gray-400 text-xs">Low Stock</Text>
            <Text className="text-red-500 text-2xl font-bold">
              {lowStockProducts.length}
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
            <Text className="text-gray-400 text-xs">Categories</Text>
            <Text className="text-purple-600 text-2xl font-bold">
              {Object.keys(categoryData).length}
            </Text>
          </View>
        </View>

        {/* Inventory Value */}
        <View className="bg-blue-600 rounded-2xl p-4 mb-4">
          <Text className="text-blue-200 text-sm">Total Inventory Value</Text>
          <Text className="text-white text-3xl font-bold">
            ₹{totalValue.toLocaleString("en-IN")}
          </Text>
        </View>

        {/* Bar Chart */}
        {Object.keys(categoryData).length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <Text className="text-gray-700 font-bold mb-3">
              Products by Category
            </Text>
            <BarChart
              data={barData}
              width={screenWidth - 64}
              height={180}
              chartConfig={chartConfig}
              style={{ borderRadius: 12 }}
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
            />
          </View>
        )}

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <Text className="text-gray-700 font-bold mb-3">
              Category Distribution
            </Text>
            <PieChart
              data={pieData}
              width={screenWidth - 64}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>
        )}

        {/* Top Products */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <Text className="text-gray-700 font-bold mb-3">
            🏆 Top 3 Expensive Products
          </Text>
          {topProducts.map((p, i) => (
            <View
              key={p._id}
              className="flex-row items-center justify-between py-2 border-b border-gray-50"
            >
              <View className="flex-row items-center">
                <Text className="text-gray-400 text-sm mr-3">#{i + 1}</Text>
                <Text
                  className="text-gray-700 text-sm font-medium"
                  numberOfLines={1}
                >
                  {p.name}
                </Text>
              </View>
              <Text className="text-blue-600 font-bold">₹{p.price}</Text>
            </View>
          ))}
        </View>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <View className="bg-red-50 rounded-2xl p-4 mb-8 border border-red-100">
            <Text className="text-red-600 font-bold mb-3">
              ⚠️ Low Stock Alert
            </Text>
            {lowStockProducts.map((p) => (
              <View
                key={p._id}
                className="flex-row items-center justify-between py-2 border-b border-red-100"
              >
                <Text className="text-gray-700 text-sm">{p.name}</Text>
                <View className="bg-red-100 px-2 py-1 rounded-full">
                  <Text className="text-red-500 text-xs font-bold">
                    {p.stock} left
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
