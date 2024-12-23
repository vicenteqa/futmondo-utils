import { getChampionshipInfo } from '../endpoints/get-championship-info.js';
import { getTeamPlayers } from '../endpoints/get-team-players.js';

export async function getTeams() {
  const championshipInfoResponse = await getChampionshipInfo();
  if (championshipInfoResponse === undefined)
    return 'Error calling championship info endpoint';
  else if (championshipInfoResponse.answer.error === true)
    return 'Error calling championship info endpoint';
  else {
    const teamsInfo = championshipInfoResponse.answer.teams;
    return teamsInfo;
  }
}

async function getAllPlayers() {
  const teamsInfo = await getTeams();
  const allPlayers = [];

  // Usar Promise.all para esperar a que todas las promesas se resuelvan
  const teamPromises = teamsInfo.map(async (team) => {
    const response = await getTeamPlayers(team.id);
    const teamPlayers = response.answer;
    const players = teamPlayers.map((player) => ({
      jugador: player.name,
      slug: player.slug,
      lesionado: player.status.includes('injured'),
      propietario: team.name,
      cambio: player.change,
      pujas: player.numberOfBids || 0,
      clausula: player.clause.price,
      media: player.average.average,
      forma: getAverageLastThreeMatches(player.average.fitness),
      id: player.id,
    }));
    allPlayers.push(...players);
  });

  await Promise.all(teamPromises);

  return allPlayers;
}

export async function getPlayersFromSpecificUser(user) {
  const allPlayers = await getAllPlayers();
  if (user === 'juanma') user = 'jmcormo';
  else if (user === 'dani') user = 'Daniel Gonzalez';
  else if (user === 'lopez') user = 'jordilo23';
  else if (user === 'alex') user = 'Alex Sánchez Salazar';
  else if (user === 'peta') user = 'carlospg10';
  else if (user === 'dami') user = 'Damián';
  else if (user === 'herrero') user = 'Davido';
  else if (user === 'situ') user = 'Manchester Situ';
  else if (user === 'pop') user = 'Rubén Tenor';
  else return undefined;

  const playersFromUser = allPlayers.filter(
    (player) => player.propietario === user
  );
  return playersFromUser;
}

function getAverageLastThreeMatches(lastFiveMatches) {
  const lastThreeMatches = lastFiveMatches.slice(2);
  const average = lastThreeMatches.reduce((acc, match) => acc + match, 0) / 3;
  return Math.round(average * 2) / 2;
}
