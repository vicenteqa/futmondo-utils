import { postData } from '../services/apiServices.js';
import endpoints from './endpoints.js';
import bodyTemplate from './body-template.js';

const endpoint = endpoints.GET_MY_PLAYERS_IN_MARKET;

function setBody() {
  const body = bodyTemplate;
  body.query.type = 'market';
  return body;
}

export async function getMyPlayersInMarket() {
  const body = setBody();
  try {
    const response = await postData(endpoint, body);
    return response;
  } catch (error) {
    console.error('Error calling market endpoint:', error);
  }
}

getMyPlayersInMarket();
