import { postData } from '../services/apiServices.js';
import 'dotenv/config';

const endpoint = '/market/putonmarket';

async function setBodyForPlayerInMarket(playerId, price) {
  return {
    header: {
      token: process.env.TOKEN,
      userid: process.env.USER_ID,
    },
    query: {
      championshipId: process.env.CHAMPIONSHIP_ID,
      userteamId: process.env.USER_TEAM_ID,
      price: price,
      player_id: playerId,
      isClause: null,
      mode: null,
      toLoan: null,
    },
    answer: {},
  };
}

export async function setPlayerInMarket(playerId, price) {
  const body = await setBodyForPlayerInMarket(playerId, price);
  try {
    const response = await postData(endpoint, body);
    return response;
  } catch (error) {
    console.error('Error setting player in market:', error.status);
  }
}
