import { setNewBid } from '../endpoints/set-new-bid.js';
import { getMarket } from '../endpoints/get-market.js';
import { formatCurrency } from '../common/utils.js';
import { getNextCronExecution } from '../common/get-next-cron-execution.js';
import { getLastAccessInfo } from '../logic/ultimo-acceso.js';
import { parseBidsFile } from '../common/parse-bids-file.js';
import 'dotenv/config';
import cron from 'node-cron';
import fs from 'fs';

async function puja(schedule = true) {
  if (schedule) {
    const cronExpression = '00 02 * * *';
    const timezone = 'Europe/Madrid';
    const nextExecution = await getNextCronExecution(cronExpression, timezone);
    console.log(`Puja programada a las ${nextExecution}`);
    cron.schedule(
      cronExpression,
      async () => {
        await readBidsFileAndSendBids();
        await logLastAccessInfo();
      },
      {
        timezone: timezone,
      }
    );
  } else await readBidsFileAndSendBids();
}

async function readBidsFileAndSendBids() {
  const wantedBids = parseBidsFile();
  for (let i = 0; i < wantedBids.length; i++) {
    const bid = wantedBids[i];
    await sendBidRequest(bid.playerId, bid.maxBidAmount);
  }
}

async function logLastAccessInfo() {
  const lastAccessInfo = await getLastAccessInfo();
  console.log(lastAccessInfo);
  fs.writeFileSync(
    'ultimo-acceso.json',
    JSON.stringify(lastAccessInfo, null, 2)
  );
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

export async function sendBidRequest(playerId, maxBidAmount) {
  const playerData = await getDataFromPlayerInMarket(playerId);
  const bidAmount = calculateBidAmount(playerData, maxBidAmount);
  console.log(
    `Vas a pujar ${formatCurrency(bidAmount)} por ${playerData.name} que tiene ${playerData.bids} pujas`
  );
  const response = await setNewBid(playerData.player_slug, playerId, bidAmount);
  if (response.answer.error)
    if (response.answer.code === 'api.market.max_number_players_in_roster')
      return 'Has alcanzado el número máximo de jugadores';
    else return `Error al realizar la puja: ${response.answer.code}`;
  else if (response.answer.code === 'api.general.ok')
    return `Has pujado por ${playerData.name}`;
}
