import { deleteProduct, getProductById, Product } from "@/services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    const data = await getProductById(id as string);
    setProduct(data);
    setLoading(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${product?.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            await deleteProduct(id as string);
            Toast.show({
              type: "success",
              text1: "Product Deleted 🗑️",
              text2: `${product?.name} removed.`,
            });
            router.back();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-400 text-lg">Product not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-600 mt-4">← Go Back</Text>
        </TouchableOpacity>
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
        <Text className="text-white text-xl font-bold">Product Details</Text>
      </View>

      <ScrollView className="flex-1 p-5">
        {/* Product Image Placeholder */}
        <View className="bg-blue-50 rounded-3xl h-52 items-center justify-center mb-6 overflow-hidden">
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-6xl">📦</Text>
          )}
        </View>

        {/* Category Badge */}
        <View className="bg-blue-50 self-start px-3 py-1 rounded-full mb-3">
          <Text className="text-blue-600 text-sm font-medium">
            {product.category}
          </Text>
        </View>

        {/* Name */}
        <Text className="text-gray-800 text-2xl font-bold mb-2">
          {product.name}
        </Text>

        {/* Price */}
        <Text className="text-blue-600 text-3xl font-bold mb-4">
          ₹{product.price}
        </Text>

        {/* Divider */}
        <View className="h-px bg-gray-200 mb-4" />

        {/* Description */}
        <Text className="text-gray-500 text-sm font-medium mb-1">
          Description
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          {product.description}
        </Text>

        {/* Stock Info */}
        <View className="bg-white rounded-2xl p-4 border border-gray-100 mb-6">
          <Text className="text-gray-500 text-sm mb-1">Available Stock</Text>
          <Text className="text-gray-800 text-xl font-bold">
            {product.stock} units
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity
            className="flex-1 bg-blue-600 py-4 rounded-2xl items-center"
            onPress={() =>
              router.push({
                pathname: "/add-product",
                params: { id: product._id },
              })
            }
          >
            <Text className="text-white font-semibold text-base">✏️ Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-4 rounded-2xl items-center border border-red-200 ${deleting ? "bg-red-100" : "bg-red-50"}`}
            onPress={handleDelete}
            disabled={deleting}
          >
            <Text className="text-red-500 font-semibold text-base">
              {deleting ? "Deleting..." : "🗑️ Delete"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
