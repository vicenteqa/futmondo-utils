import { postData } from '../services/apiServices.js';
import bodyTemplate from './body-template.js';
import endpoints from './endpoints.js';

const endpoint = endpoints.REMOVE_PLAYER_FROM_MARKET;

function setBody(playerId) {
  const body = bodyTemplate;
  body.query.player_id = playerId;
  return body;
}

export async function removePlayerFromMarket(playerId) {
  const body = setBody(playerId);
  try {
    const response = await postData(endpoint, body);
    return response;
  } catch (error) {
    console.error(
      'Error removing player from market:',
      error.status,
      error.code,
      endpoint
    );
  }
}
