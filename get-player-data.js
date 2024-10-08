import axios from 'axios';

const url = 'https://api.futmondo.com/1/player/summary';

async function getPlayerSummaryRequestBody(playerId) {
  return {
    header: {
      token: process.env.TOKEN,
      userid: '652bc64b2ccd69060ecfb26e',
    },
    query: {
      championshipId: '6527184d361d0805fd6a729b',
      userteamId: '652bc9051485a17231213ec8',
      playerId: playerId,
    },
    answer: {},
  };
}

async function getPlayerData(playerId) {
  const body = getPlayerSummaryRequestBody(playerId);
  const result = await axios
    .post(url, body)
    .then((response) => {
      if (!response.data.answer.error) {
        return {
          slug: response.data.answer.data.slug,
          price: response.data.answer.championship.clause.price,
        };
      } else return response.data.answer.code;
    })
    .catch((error) => console.error('Error:', error));
  return result;
}

const result = await getPlayerData('644d90d4479a44042784eb9f');
console.log(result);
