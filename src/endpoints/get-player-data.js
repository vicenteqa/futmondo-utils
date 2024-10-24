import { postData } from '../services/apiServices.js';
import endpoints from './endpoints.js';
import bodyTemplate from './body-template.js';

const endpoint = endpoints.GET_PLAYER_DATA;

function setBody(playerId) {
  const body = bodyTemplate;
  body.query.playerId = playerId;
  return body;
}

export async function getPlayerData(playerId) {
  const body = setBody(playerId);
  try {
    const response = await postData(endpoint, body);
    return response;
  } catch (error) {
    return undefined;
  }
}
