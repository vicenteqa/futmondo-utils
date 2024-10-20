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

export async function getMarket(retries = 10) {
  const body = setBody();
  if (retries > 0) {
    try {
      const response = await postData(endpoint, body);
      if (response.answer.error) {
        console.log(
          `API error: ${response.answer.code}. Retrying ${retries - 1} more times`
        );
        await sleep(2000);
        return await getMarket(retries - 1);
      } else {
        return response.answer;
      }
    } catch (error) {
      console.log(
        `Request error: ${error.message}. Retrying ${retries - 1} more times`
      );
      await sleep(2000);
      return await getMarket(retries - 1);
    }
  } else {
    return undefined;
  }
}
