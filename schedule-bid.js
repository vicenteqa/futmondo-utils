import { postData } from './src/services/apiServices.js';
import { getMarket } from './get-market.js';
import { formatCurrency } from './src/common/utils.js';
import 'dotenv/config';
import cron from 'node-cron';

cron.schedule(
  '00 02 * * *',
  async () => {
    await submitBid('66c9b0acf119260402e26288', 12000000);
    await submitBid('584521ee88569163361f22cc', 10000000);
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

async function setBidAmount(playerData, maxAmount) {
  if (playerData.bids === 0) return playerData.price;
  else if (playerData.bids === 1) return playerData.price + playerData.change;
  else return maxAmount;
}

async function submitBid(playerId, maxAmount) {
  const playerData = await getPlayerData(playerId);

  if (playerData) {
    const bidAmount = await setBidAmount(playerData, maxAmount);
    const bidBody = await getBidBody(
      playerData.player_slug,
      playerId,
      bidAmount
    );
    console.log(
      `Vas a enviar una puja de ${formatCurrency(bidAmount)} por ${playerData.name}`
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
