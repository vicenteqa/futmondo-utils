import { setNewBid } from './src/endpoints/set-new-bid.js';
import { getMarket } from './src/endpoints/get-market.js';
import { formatCurrency } from './src/common/utils.js';
import { getNextCronExecution } from './src/common/get-next-cron-execution.js';
import 'dotenv/config';
import cron from 'node-cron';

puja();

async function puja(schedule = true) {
  const playerId = '52358785c62c560a4a0009ab';
  if (schedule) {
    const cronExpression = '00 02 * * *';
    const timezone = 'Europe/Madrid';
    const nextExecution = await getNextCronExecution(cronExpression, timezone);
    console.log(`Clausulazo programado a las ${nextExecution}`);
    cron.schedule(cronExpression, async () => await sendBidRequest(playerId), {
      timezone: timezone,
    });
  } else {
    await sendBidRequest(playerId);
  }
}

function roundToNearestTenThousand(num) {
  return Math.ceil(num / 10000) * 10000;
}

async function getDataFromPlayerInMarket(playerId) {
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

function calculateBidAmount(playerData, maxBidAmount) {
  if (maxBidAmount === undefined) {
    if (playerData.bids === 0) return playerData.price;
    else
      return roundToNearestTenThousand(
        playerData.price + playerData.change * playerData.bids
      );
  } else return playerData.bids > 0 ? maxBidAmount : playerData.price;
}

async function sendBidRequest(playerId, maxBidAmount) {
  const playerData = await getDataFromPlayerInMarket(playerId);
  const bidAmount = calculateBidAmount(playerData, maxBidAmount);
  console.log(
    `Vas a pujar ${formatCurrency(bidAmount)} por ${playerData.name} que tiene ${playerData.bids} pujas`
  );
  const response = await setNewBid(playerData.player_slug, playerId, bidAmount);
  if (response.answer.error)
    console.log(`Error al realizar la puja: ${response.answer.code}`);
  else if (response.answer.code === 'api.general.ok')
    console.log(`Has pujado por ${playerData.name}`);
}
