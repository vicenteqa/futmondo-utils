import { postData } from '../services/apiServices.js';
import 'dotenv/config';

const endpoint = '/market/cancelsell';

async function setBodyHidePlayerInMarket(playerId) {
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
