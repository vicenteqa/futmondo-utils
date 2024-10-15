import { postData } from '../services/apiServices.js';
import 'dotenv/config';

const endpoint = '/market/cancelsell';

async function setBodyRemovePlayerFromMarket(playerId) {
  return {
    header: {
      token: process.env.TOKEN,
      userid: process.env.USER_ID,
    },
    query: {
      championshipId: process.env.CHAMPIONSHIP_ID,
      userteamId: process.env.USER_TEAM_ID,
      player_id: playerId,
    },
    answer: {},
  };
}

export async function removePlayerFromMarket(playerId) {
  const body = await setBodyRemovePlayerFromMarket(playerId);
  try {
    const response = await postData(endpoint, body);
    return response;
  } catch (error) {
    console.error('Error removing player from market:', error.status);
  }
}
