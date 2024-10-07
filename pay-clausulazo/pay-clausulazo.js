import axios from 'axios';
import { getBody } from './body-template.js';

const url = 'https://api.futmondo.com/1/market/rosterclause';
const body = getBody();

axios
  .post(url, body)
  .then((response) => {
    console.log(response.data.answer.code);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
