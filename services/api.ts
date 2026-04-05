// Jwhen we have a real backend, this file will contain all API calls. For now, it simulates a backend with in-memory data and fake network delays.
// Just uncomment the BASE_URL and replace the mock functions with real fetch/axios calls to your backend.
import axios from "axios";

const BASE_URL = "https://stockify-backend-production-b777.up.railway.app/api";
const api = axios.create({ baseURL: BASE_URL });

export type Product = {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
  imageUrl?: string;
};

// GET all products
export const getProducts = async (): Promise<Product[]> => {
  const res = await api.get("/products");
  return res.data;
};

// GET single product
export const getProductById = async (id: string): Promise<Product | null> => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

// POST - create product
export const createProduct = async (
  data: Omit<Product, "_id">,
): Promise<Product> => {
  const res = await api.post("/products", data);
  return res.data;
};

// PUT - update product
export const updateProduct = async (
  id: string,
  data: Omit<Product, "_id">,
): Promise<Product> => {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
};

// DELETE product
export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

// POST - upload image to Cloudinary
export const uploadImage = async (imageUri: string): Promise<string> => {
  const formData = new FormData();
  formData.append("image", {
    uri: imageUri,
    type: "image/jpeg",
    name: "product.jpg",
  } as any);

  const res = await api.post("/products/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.imageUrl;
};

// AI - generate description
export const generateDescription = async (
  name: string,
  category: string,
  price: string,
): Promise<string> => {
  const res = await api.post("/ai/generate-description", {
    name,
    category,
    price,
  });
  return res.data.description;
};
