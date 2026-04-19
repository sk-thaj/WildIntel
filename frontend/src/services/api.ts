import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:5000"
});

export const getSpecies = async () => {
  const res = await api.get("/species");
  return res.data;
};