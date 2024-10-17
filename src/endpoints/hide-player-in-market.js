import { postData } from '../services/apiServices.js';
import endpoints from './endpoints.js';
import bodyTemplate from './body-template.js';

const endpoint = endpoints.HIDE_PLAYER_IN_MARKET;

function setBody(playerId) {
  const body = bodyTemplate;
  body.query.player_id = playerId;
  return body;
}

export async function hidePlayerInMarket(playerId) {
  const body = setBody(playerId);
  try {
    const response = await postData(endpoint, body);
    return response;
  } catch (error) {
    console.error('Error hiding player in market:', error);
  }
}
