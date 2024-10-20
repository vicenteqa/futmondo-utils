import { postData } from '../services/apiServices.js';
import endpoints from './endpoints.js';
import bodyTemplate from './body-template.js';

const endpoint = endpoints.GET_CHAMPIONSHIP_INFO;

function setBody() {
  const body = bodyTemplate;
  body.query.type = 'market';
  return body;
}

export async function getChampionshipInfo() {
  const body = setBody();
  try {
    const response = await postData(endpoint, body);
    return response;
  } catch (error) {
    return `Error calling championship info endpoint: ${error}`;
  }
}
