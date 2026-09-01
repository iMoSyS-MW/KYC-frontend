import axios from 'axios';

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
});

client.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success === true) {
        if ('pagination' in response.data) {
          (response as any).pagination = response.data.pagination;
        }
        response.data = response.data.data;
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.data && typeof error.response.data === 'object' && 'success' in error.response.data) {
      const body = error.response.data;
      error.response.data = {
        message: body.message || 'An error occurred',
        ...(body.errors && { errors: body.errors }),
      };
    }
    return Promise.reject(error);
  }
);

export default client;
