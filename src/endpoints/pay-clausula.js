import { postData } from '../services/apiServices.js';
import endpoints from './endpoints.js';
import bodyTemplate from './body-template.js';

const endpoint = endpoints.PAY_PLAYER_CLAUSE;

function setBody(playerSlug, playerPrice, playerId) {
  const body = JSON.parse(JSON.stringify(bodyTemplate));
  body.query.player_id = playerId;
  body.query.player_slug = playerSlug;
  body.query.price = playerPrice;
  delete body.query.type;

  return body;
}

export async function payClausula(playerSlug, playerPrice, playerId) {
  const body = setBody(playerSlug, playerPrice, playerId);

  try {
    const response = await postData(endpoint, body);
    return response;
  } catch (error) {
    return `Error calling player summary endpoint: ${error.status}`;
  }
}
