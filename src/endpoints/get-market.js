import { postData } from '../services/apiServices.js';
import endpoints from './endpoints.js';
import bodyTemplate from './body-template.js';

const endpoint = endpoints.GET_MARKET;

function setBody() {
  const body = bodyTemplate;
  body.query.type = 'market';
  return body;
}

export async function getMarket() {
  const body = setBody();
  try {
    const response = await postData(endpoint, body);
    if (response.answer.error) return undefined;
    else return response.answer;
  } catch (error) {
    return undefined;
  }
}
