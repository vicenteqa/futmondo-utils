import { getTeamPlayers } from '../endpoints/get-team-players.js';
import { setPlayerInMarket } from '../endpoints/set-player-in-market.js';
import { removePlayerFromMarket } from '../endpoints/remove-player-from-market.js';
import { getMyPlayersInMarket } from '../endpoints/get-my-players-in-market.js';

async function getSellablePlayers() {
  const myTeamPlayersResponse = await getTeamPlayers();

  const sellablePlayers = myTeamPlayersResponse.answer.filter((player) => {
    return (
      player.team !== 'Betis' &&
      player.role !== 'portero' &&
      player.clause.transferred === false
    );
  });

  return sellablePlayers.sort((a, b) => a.change - b.change).slice(0, 5);
}

export async function setPlayersInMarket() {
  const response = await getMyPlayersInMarket();
  await response.answer.forEach(
    async (player) => await removePlayerFromMarket(player.id)
  );

  const sellablePlayers = await getSellablePlayers();

  sellablePlayers.forEach(
    async (player) => await setPlayerInMarket(player.id, player.value)
  );
}
