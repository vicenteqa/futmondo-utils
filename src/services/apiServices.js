import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.futmondo.com',
  timeout: 10000,
});

export async function postData(endpoint, data) {
  try {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
}
