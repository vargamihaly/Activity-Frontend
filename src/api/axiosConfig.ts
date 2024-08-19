import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = 'https://localhost:8082'; // Replace with your API's base URL

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10 seconds
    withCredentials: true, // Important for cookies / auth
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // You can modify the request config here
        // For example, you could add an auth token
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers['Authorization'] = `Bearer ${token}`;
        // }
        return config;
    },
    (error: AxiosError) => {
        // Do something with request error
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response;
    },
    (error: AxiosError) => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error data:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Error request:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;