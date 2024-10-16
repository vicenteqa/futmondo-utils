import { postData } from './src/services/apiServices.js';
import { getMarket } from './get-market.js';
import { formatCurrency } from './src/common/utils.js';
import 'dotenv/config';
import cron from 'node-cron';

cron.schedule(
  '00 02 * * *',
  async () => {
    await submitBid('66d248cb8fa6c103e3f7015f');
    await submitBid('66c63be676de1f03e6d2b553');
  },
  { timezone: 'Europe/Madrid' }
);

console.log('Task scheduled. Waiting for the specified time...');

async function getBidBody(playerSlug, playerId, price) {
  return {
    header: {
      token: process.env.TOKEN,
      userid: process.env.USER_ID,
    },
    query: {
      championshipId: process.env.CHAMPIONSHIP_ID,
      userteamId: process.env.USER_TEAM_ID,
      player_slug: playerSlug,
      player_id: playerId,
      price: price,
      isClause: false,
    },
    answer: {},
  };
}

async function getPlayerData(playerId) {
  const market = await getMarket();
  const player = market.find((player) => player.id === playerId);
  if (!player) return null;
  else
    return {
      name: player.name,
      bids: player.numberOfBids,
      price: player.price,
      player_slug: player.slug,
      change: player.change,
    };
}

async function submitBid(playerId) {
  const playerData = await getPlayerData(playerId);
  if (playerData) {
    const bidAmount = playerData.price + playerData.change * playerData.bids;
    const bidBody = await getBidBody(
      playerData.player_slug,
      playerId,
      bidAmount
    );
    console.log(
      `Vas a enviar una puja de ${formatCurrency(bidAmount)} por ${playerData.name}. Este jugador tiene actualmente ${playerData.bids} pujas.`
    );
    const response = await sendBidRequest(bidBody);
    if (response.answer.code === 'api.general.ok')
      console.log(`Has pujado por ${playerData.name}`);
    else console.error(response.answer.code);
  } else console.error('Player not found in Market');
}

async function sendBidRequest(bidBody) {
  try {
    const response = await postData('/market/bid', bidBody);
    return response;
  } catch (error) {
    console.error('Error calling market endpoint:', error);
  }
}
