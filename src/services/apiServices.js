import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.futmondo.com/1',
  timeout: 5000,
});

export async function fetchData(endpoint) {
  try {
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function postData(endpoint, data) {
  try {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error('POST API Error:', error);
    throw error;
  }
}
