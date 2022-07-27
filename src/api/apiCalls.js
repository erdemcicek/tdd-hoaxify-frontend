import axios from "axios";

export const signup = (user) => {
  return axios.post("/api/1.0/users", user);
};

// axios post takes 3 parameters
// 1. path  2. request body 3. config of axios
export const login = (user) => {
  //                      1            2        3
  return axios.post("/api/1.0/login", {}, { auth: user });
};

export const listUsers = (param = { page: 0, size: 3 }) => {
  const path = `/api/1.0/users?page=${param.page || 0}&size=${param.size || 3}`;
  return axios.get(path);
};

export const getUser = (username) => {
  return axios.get(`/api/1.0/users/${username}`);
};
