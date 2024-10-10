import { postData } from './src/services/apiServices.js';
import 'dotenv/config';

function getPlayerSummaryRequestBody() {
  return {
    header: {
      token: process.env.TOKEN,
      userid: process.env.USER_ID,
    },
    query: {
      championshipId: process.env.CHAMPIONSHIP_ID,
      userteamId: process.env.USER_TEAM_ID,
      playerId: process.env.PLAYER_ID,
    },
    answer: {},
  };
}

async function getPlayerData() {
  const body = getPlayerSummaryRequestBody();
  try {
    const response = await postData('/player/summary', body);
    return handlePlayerDataResponse(response);
  } catch (error) {
    console.error('Error calling player summary endpoint:', error);
  }
}

export { getPlayerData };

async function handlePlayerDataResponse(response) {
  if (!response.answer.error) {
    return {
      slug: response.answer.data.slug,
      price: response.answer.championship.clause.price,
      name: response.answer.data.name,
    };
  } else return response.answer.code;
}
