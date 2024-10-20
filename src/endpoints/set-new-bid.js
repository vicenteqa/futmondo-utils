import { postData } from '../services/apiServices.js';
import bodyTemplate from './body-template.js';
import endpoints from './endpoints.js';

const endpoint = endpoints.SET_BID;

function setBody(playerSlug, playerId, price) {
  const body = bodyTemplate;
  body.query.player_slug = playerSlug;
  body.query.player_id = playerId;
  body.query.price = price;
  return body;
}

export async function setNewBid(playerSlug, playerId, price) {
  const body = setBody(playerSlug, playerId, price);
  try {
    const response = await postData(endpoint, body);
    return response;
  } catch (error) {
    return `Error setting player in market: ${error.status}`;
  }
}
