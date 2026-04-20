import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export const api = axios.create({
  baseURL: API_URL
});

export const getSpecies = async () => {
  const res = await api.get("/species");
  return res.data;
};