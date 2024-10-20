import { postData } from '../services/apiServices.js';
import endpoints from './endpoints.js';
import bodyTemplate from './body-template.js';

const endpoint = endpoints.GET_TEAM_PLAYERS;

function setBody(teamId) {
  const body = bodyTemplate;
  body.query.userteamId = teamId;
  return body;
}

const TEAMS = [
  '6527c04631079349c1155e0d',
  '65284916b02b2049bf91f9bf',
  '652863932d3fc549aa29e343',
  '65284c0f2d3fc549aa29c1d7',
  '66b88a121616a34d2df5aed6',
  '652843e141dc7349b78ecc55',
  '66f9809e5a28014b158e596c',
  '66c8e229c1b12f13dc43cbaa',
];

export async function getTeamPlayers(teamId) {
  const body = setBody(teamId);
  try {
    const response = await postData(endpoint, body);
    return response;
  } catch (error) {
    return response.answer.error;
  }
}

async function getAllPlayers() {
  const players = [];

  // Usar Promise.all para esperar a que todas las promesas se resuelvan
  const responses = await Promise.all(
    TEAMS.map(async (team) => {
      const response = await getTeamPlayers(team);
      return response.answer;
    })
  );

  // Aplanar el array de respuestas y añadirlo a players
  responses.forEach((response) => {
    players.push(...response);
  });

  return players;
}

async function filterPlayers() {
  const players = await getAllPlayers();
  return players.filter((player) => {
    const clausePriceWithinRange = player.clause.price <= player.value * 1.4;
    const averageLastFiveAboveThreshold = player.average.averageLastFive >= 7;
    const changeAboveThreshold = player.change > 30000;

    return (
      clausePriceWithinRange &&
      averageLastFiveAboveThreshold &&
      changeAboveThreshold
    );
  });
}

const filteredPlayers = await filterPlayers();
filteredPlayers.forEach((player) => {
  console.log(player.name);
});
