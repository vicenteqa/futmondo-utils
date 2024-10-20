import { postData } from '../services/apiServices.js';
import endpoints from './endpoints.js';
import bodyTemplate from './body-template.js';

const endpoint = endpoints.GET_TEAM_PLAYERS;

function setBody(teamId) {
  const body = JSON.parse(JSON.stringify(bodyTemplate));
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
    return error.status;
  }
}
