import { postData } from '../services/apiServices.js';
import bodyTemplate from './body-template.js';
import endpoints from './endpoints.js';

const endpoint = endpoints.PRESSROOM;

export async function getTransfers() {
  const body = bodyTemplate;
  try {
    const response = await postData(endpoint, body);
    return response;
  } catch (error) {
    return `Error getting transfer list: ${error.status}`;
  }
}
