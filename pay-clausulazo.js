import { postData } from './src/services/apiServices.js';
import 'dotenv/config';
import { getPlayerData } from './get-player-data.js';

async function rosterClauseBody() {
  const playerData = await getPlayerData();
  console.log(playerData);
  console.log('______________');
  return {
    header: {
      token: process.env.TOKEN,
      userid: '652bc64b2ccd69060ecfb26e',
    },
    query: {
      championshipId: '6527184d361d0805fd6a729b',
      userteamId: '652bc9051485a17231213ec8',
      player_slug: playerData.slug,
      player_id: process.env.PLAYER_ID,
      price: playerData.price,
    },
    answer: {},
  };
}

async function payClausula() {
  const body = await rosterClauseBody();
  console.log(body);

  try {
    const response = await postData('/market/rosterclause', body);
    return handleRosterClauseResponse(response);
  } catch (error) {
    console.error('Error calling player summary endpoint:', error);
  }
}

async function handleRosterClauseResponse(response) {
  if (response.answer.error) return response.answer.code;
  else return response;
}

const result = await payClausula();
console.log(result);
