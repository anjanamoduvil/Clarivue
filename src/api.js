import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:5004" });
export default api;
