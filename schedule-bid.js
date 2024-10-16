import { postData } from './src/services/apiServices.js';
import { getMarket } from './get-market.js';
import { formatCurrency } from './src/common/utils.js';
import { getLastAccessInfo } from './get-last-access.js';
import 'dotenv/config';
import cron from 'node-cron';
import fs from 'fs';

const lastAccessInfo = await getLastAccessInfo();
console.log(lastAccessInfo);

cron.schedule(
  '00 02 * * *',
  async () => {
    const lastAccessInfo = await getLastAccessInfo();
    console.log(lastAccessInfo);
    fs.writeFileSync('last-access.json', JSON.stringify(lastAccessInfo));
    await submitBidWithMaxPrice('574dc94bb9278bf5518b1e7b', 42000000);
  },
  { timezone: 'Europe/Madrid' }
);

console.log('Task scheduled. Waiting for the specified time...');

function roundToNearestTenThousand(num) {
  return Math.ceil(num / 10000) * 10000;
}

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
      id: playerId,
    };
}

async function submitBid(playerId) {
  const playerData = await getPlayerData(playerId);
  if (playerData) {
    let rawBidAmount = playerData.price + playerData.change * playerData.bids;

    if (playerData.bids > 0)
      rawBidAmount = roundToNearestTenThousand(rawBidAmount);
    const bidAmount = rawBidAmount;
    await sendBidRequest(playerData, bidAmount);
  } else console.error('Player not found in Market');
}

async function submitBidWithMaxPrice(playerId, maxPrice) {
  const playerData = await getPlayerData(playerId);
  if (playerData) {
    const bidAmount = playerData.bids > 0 ? maxPrice : playerData.price;
    await sendBidRequest(playerData, bidAmount);
  } else console.error('Player not found in Market');
}

async function sendBidRequest(playerData, bidAmount) {
  const bidBody = await getBidBody(
    playerData.player_slug,
    playerData.id,
    bidAmount
  );

  console.log(
    `Vas a enviar una puja de ${formatCurrency(bidAmount)} por ${playerData.name}. Este jugador tiene actualmente ${playerData.bids} pujas.`
  );
  try {
    const response = await postData('/market/bid', bidBody);
    if (response.answer.code === 'api.general.ok')
      console.log(`Has pujado por ${playerData.name}`);
    else console.error(response.answer.code);
  } catch (error) {
    console.error('Error calling market endpoint:', error);
  }
}
