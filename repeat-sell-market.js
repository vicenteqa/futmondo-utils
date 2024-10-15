import { postData } from './src/services/apiServices.js';
import { setPlayerInMarket } from './src/endpoints/set-player-in-market.js';
import { getMyPlayersInMarket } from './src/endpoints/get-my-players-in-market.js';
import { removePlayerFromMarket } from './src/endpoints/remove-player-from-market.js';
import 'dotenv/config';

async function repeatSellMarket() {
  const players = await getMyPlayersInMarket();
  await players.answer.forEach(async (player) => {
    await removePlayerFromMarket(player.id);
    await setPlayerInMarket(player.id, player.price);
  });
}

repeatSellMarket();
