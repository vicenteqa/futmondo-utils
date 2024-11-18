import { postData } from '../services/apiServices.js';
import endpoints from './endpoints.js';
import bodyTemplate from './body-template.js';

const endpoint = endpoints.GET_TEAM_PLAYERS;

function setBody(teamId) {
  const body = JSON.parse(JSON.stringify(bodyTemplate));
  if (teamId !== undefined) body.query.userteamId = teamId;
  return body;
}

export async function getTeamPlayers(teamId = undefined) {
  const body = setBody(teamId);
  try {
    const response = await postData(endpoint, body);
    return response;
  } catch (error) {
    return error.status;
  }
}
