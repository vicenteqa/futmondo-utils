import { setNewBid } from '../endpoints/set-new-bid.js';
import { getMarket } from '../endpoints/get-market.js';
import { formatCurrency } from '../common/utils.js';

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
  const response = await setNewBid(playerData.player_slug, playerId, bidAmount);
  if (response.answer.error)
    if (response.answer.code === 'api.market.max_number_players_in_roster')
      return 'Has alcanzado el número máximo de jugadores';
    else return `Error al realizar la puja: ${response.answer.code}`;
  else if (response.answer.code === 'api.general.ok')
    return `Has pujado *${formatCurrency(bidAmount)}* por *${playerData.name}* que actualmente tiene *${playerData.bids}* pujas`;
}
