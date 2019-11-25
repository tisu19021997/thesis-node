const axios = require('axios');

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_SERVER_HOST || 'http://localhost:8081',
  timeout: 10000,
});

export default axiosInstance;
