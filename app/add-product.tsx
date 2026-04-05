import {
  createProduct,
  generateDescription,
  getProductById,
  updateProduct,
  uploadImage,
} from "@/services/api";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";

export default function AddProduct() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEditing = !!id;
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const CATEGORIES = [
    "Electronics",
    "Footwear",
    "Kitchen",
    "Stationery",
    "Clothing",
    "Other",
  ];

  useEffect(() => {
    if (isEditing) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    setFetching(true);
    const product = await getProductById(id as string);
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setCategory(product.category);
      setDescription(product.description);
      setImageUrl(product.imageUrl || "");
    }
    setFetching(false);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Gallery permission required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setUploadingImage(true);
      try {
        const url = await uploadImage(uri);
        setImageUrl(url);
      } catch (err) {
        alert("Image upload failed. Try again.");
      }
      setUploadingImage(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Product name required";
    if (!price.trim()) newErrors.price = "Price required";
    else if (isNaN(Number(price))) newErrors.price = "Price must be a number";
    if (!stock.trim()) newErrors.stock = "Stock required";
    else if (isNaN(Number(stock))) newErrors.stock = "Stock must be a number";
    if (!category) newErrors.category = "Please select a category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateDescription = async () => {
    if (!name.trim()) {
      alert("Pehle product name daalo!");
      return;
    }
    if (!category) {
      alert("Pehle category select karo!");
      return;
    }
    setGeneratingDesc(true);
    try {
      const desc = await generateDescription(name, category, price || "0");
      setDescription(desc);
    } catch (err) {
      alert("AI generation failed. Try again!");
    }
    setGeneratingDesc(false);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const data = {
      name,
      price: Number(price),
      stock: Number(stock),
      category,
      description,
      imageUrl,
    };
    if (isEditing) {
      await updateProduct(id as string, data);
      Toast.show({
        type: "success",
        text1: "Product Updated! ✅",
        text2: `${name} has been updated.`,
      });
    } else {
      await createProduct(data);
      Toast.show({
        type: "success",
        text1: "Product Added! 🎉",
        text2: `${name} added to catalog.`,
      });
    }
    setLoading(false);
    router.back();
  };

  if (fetching) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    // <KeyboardAvoidingView
    //   className="flex-1"
    //   behavior={Platform.OS === "ios" ? "padding" : "height"}
    //   keyboardVerticalOffset={0}
    // >
    <View className="flex-1">
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-5 px-5 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-white text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">
          {isEditing ? "Edit Product" : "Add Product"}
        </Text>
      </View>

      <KeyboardAwareScrollView
        className="flex-1 p-5"
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={200}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Picker */}
        <TouchableOpacity
          onPress={pickImage}
          className="bg-white border-2 border-dashed border-blue-300 rounded-3xl h-48 items-center justify-center mb-6 overflow-hidden"
        >
          {uploadingImage ? (
            <View className="items-center">
              <ActivityIndicator color="#2563eb" />
              <Text className="text-blue-400 text-sm mt-2">Uploading...</Text>
            </View>
          ) : imageUri || imageUrl ? (
            <Image
              source={{ uri: imageUri || imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center">
              <Text className="text-4xl mb-2">📷</Text>
              <Text className="text-blue-500 font-medium">
                Tap to add image
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                JPG, PNG supported
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Product Name */}
        <Text className="text-gray-600 text-sm font-medium mb-1">
          Product Name *
        </Text>
        <TextInput
          className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
          placeholder="e.g. Wireless Headphones"
          value={name}
          onChangeText={setName}
        />
        {errors.name && (
          <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>
        )}
        <View className="mb-4" />

        {/* Price */}
        <Text className="text-gray-600 text-sm font-medium mb-1">
          Price (₹) *
        </Text>
        <TextInput
          className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
          placeholder="e.g. 1999"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        {errors.price && (
          <Text className="text-red-500 text-xs mt-1">{errors.price}</Text>
        )}
        <View className="mb-4" />

        {/* Stock */}
        <Text className="text-gray-600 text-sm font-medium mb-1">
          Stock Quantity *
        </Text>
        <TextInput
          className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
          placeholder="e.g. 50"
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
        />
        {errors.stock && (
          <Text className="text-red-500 text-xs mt-1">{errors.stock}</Text>
        )}
        <View className="mb-4" />

        {/* Category */}
        <Text className="text-gray-600 text-sm font-medium mb-2">
          Category *
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-1">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={{ alignSelf: "flex-start" }}
              className={`px-4 py-2 rounded-full border ${
                category === cat
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  category === cat ? "text-white" : "text-gray-600"
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.category && (
          <Text className="text-red-500 text-xs mt-1">{errors.category}</Text>
        )}
        <View className="mb-4" />

        {/* Description */}
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-gray-600 text-sm font-medium">Description</Text>
          <TouchableOpacity
            onPress={handleGenerateDescription}
            disabled={generatingDesc}
            className={`flex-row items-center px-3 py-1 rounded-full ${
              generatingDesc ? "bg-purple-200" : "bg-purple-100"
            }`}
          >
            {generatingDesc ? (
              <ActivityIndicator size="small" color="#7c3aed" />
            ) : (
              <Text className="text-purple-600 text-xs font-medium">
                ✨ AI Generate
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <TextInput
          className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 mb-6"
          placeholder="Product description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={{ minHeight: 100 }}
        />

        {/* Submit Button */}
        <TouchableOpacity
          className={`py-4 rounded-2xl items-center mb-8 ${loading ? "bg-blue-400" : "bg-blue-600"}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {isEditing ? "Update Product" : "Add Product"}
            </Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
      {/* </KeyboardAvoidingView> */}
    </View>
  );
}
