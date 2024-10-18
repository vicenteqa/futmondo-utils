import { postData } from '../services/apiServices.js';
import endpoints from './endpoints.js';
import bodyTemplate from './body-template.js';

const endpoint = endpoints.GET_MARKET;

function setBody() {
  const body = bodyTemplate;
  body.query.type = 'market';
  return body;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getMarket(tries = 10) {
  const body = setBody();
  try {
    const response = await postData(endpoint, body);
    if (response.answer.length > 15) return response.answer;
    else console.log(response.answer.code);
  } catch (error) {
    if (tries > 0) {
      tries--;
      console.log(`Retrying ${endpoint} ${tries} more times`);
      await sleep(2000);
      await getMarket(tries);
    } else console.log(`${endpoint} giving ${error.status}`);
  }
}
