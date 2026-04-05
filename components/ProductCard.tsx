import { Image, Text, TouchableOpacity, View } from "react-native";

type Product = {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
};

interface Props {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: Props) {
  const isLowStock = product.stock <= 10;
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
    >
      {/* Product Image */}
      <View className="bg-blue-50 rounded-xl h-24 items-center justify-center mb-3 overflow-hidden">
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-3xl">📦</Text>
        )}
      </View>

      {/* Category Badge */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="bg-blue-50 self-start px-2 py-1 rounded-full mb-3">
          <Text className="text-blue-600 text-xs font-medium">
            {product.category}
          </Text>
        </View>
        {isLowStock && (
          <View className="bg-red-50 px-2 py-1 rounded-full mb-3">
            <Text className="text-red-500 text-xs font-medium">Low Stock</Text>
          </View>
        )}
      </View>

      {/* Product Name */}
      <Text className="text-gray-800 font-semibold text-sm" numberOfLines={2}>
        {product.name}
      </Text>

      {/* Price */}
      <Text className="text-blue-600 font-bold text-lg mt-2">
        ₹{product.price}
      </Text>

      {/* Stock */}
      <Text className="text-gray-400 text-xs mt-1">Stock: {product.stock}</Text>
    </TouchableOpacity>
  );
}
