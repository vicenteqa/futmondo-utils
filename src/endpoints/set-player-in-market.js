import { postData } from '../services/apiServices.js';
import bodyTemplate from './body-template.js';
import endpoints from './endpoints.js';

const endpoint = endpoints.SET_PLAYER_IN_MARKET;

function setBody(playerId, price) {
  const body = bodyTemplate;
  body.query.player_id = playerId;
  body.query.price = price;
  return body;
}

export async function setPlayerInMarket(playerId, price) {
  const body = setBody(playerId, price);
  try {
    const response = await postData(endpoint, body);
    return response;
  } catch (error) {
    console.error('Error setting player in market:', error.status);
  }
}
