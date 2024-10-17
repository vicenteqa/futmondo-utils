import { setPlayerInMarket } from './src/endpoints/set-player-in-market.js';
import { getMyPlayersInMarket } from './src/endpoints/get-my-players-in-market.js';
import { removePlayerFromMarket } from './src/endpoints/remove-player-from-market.js';
import { hidePlayerInMarket } from './src/endpoints/hide-player-in-market.js';
import 'dotenv/config';

async function repeatSellMarket() {
  const response = await getMyPlayersInMarket();
  await response.answer.forEach(async (player) => {
    await removePlayerFromMarket(player.id);
    await setPlayerInMarket(player.id, player.price);
    await hidePlayerInMarket(player.id);
  });
}

repeatSellMarket();
