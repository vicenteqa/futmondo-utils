import axios from 'axios';

async function sendGetRequest(userId, n) {
  const url = `https://googleads.g.doubleclick.net/pagead/interaction/?ai=CPtN3h7gDZ_O0J5iL3rsPreTtsQefzpHWdemer63hAsCNtwEQASAAYNX104K8CIIBG2NhLWFwcC1wdWItMTU1MTc2MjQ3MDY1MDA5M8gBBagDAcgDApgECKoEwwJP0ItQz4I1WbIEs6IDoip7woCtAUPAAnlTtIVKv8HZR8QG1lna_IiiYG2cFcWNKsrBqm5KlxCtgxFt1WoJ_ORVMs3Umg8fibfTvRWts1ZjMsOZhOJydgqnUt4XH86rlr-MFzxuh7t0wZG5Ptzq3EiWAQyNHl_e-3au2qXRwg_LXeoyrp8CXh-UwECdmqbAdFkK23U5gP7F5iixZEaDCQe8Hy3DtpbRkGnlye2_7HXjuFUFD3B4m1MqA3McYN_t9zrKMK9Z4zDhSfyW923W81qF7q4E2SLXHijk00u88AexART2KeyquSziYaxDpjAIn2cRNU8UkMPku5CdMLJb6H8tgeAcsBWusxaO2-7Df4SX6RUTqF3lVAgVS80UzgCHYJd_SIovv3_mtfRJb1-Fce4Guo5__GQ3rFep0LpBuGlsRjCJEIAGzey4ipXAzZMToAYqqAemvhuoB5bYG6gHqpuxAqgHg62xAqgH_56xAqgH35-xAqgHrb6xAtgHANIIJAiAYRABMgKKAjoLgECAwICAgKCogAJIvf3BOlj95MuziPyIA4AKAvoLAggBgAwB0BUBgBcBshccChgSFHB1Yi0xNTUxNzYyNDcwNjUwMDkzGAAYDA&sigh=Hdh5OU-todU&cid=CAQShgEA6Wl539gRfdHKNlLfFnuO1G7uBmHUgf4QLRI9bBFHP-ohDjKKXpaETP85qbzq0qGHGnfYqPArITDD03xDG_vMbjorUuVmT8uDTvSn2frYfVU8XTNenB7pbcykJMbEtJVp4gXlaGecxZDzYoTlxMC9GI_7ydPksSjbvBFd_BntCdzyAYS0rQ&label=admob_reward_granted&rwd_transid=ALxupshM4wUibulP3GAOgf6hFp1Qs4ADXkFFwAvhBh4FxHVtwZ0cR4P3QTAC3EcbHAe21ksraF2svUuHFMLppWm8TZ6j&rwd_userid=${userId}&rwd_custom_data=&rwd_tmstmp=1728297156224&ad_network_id=5450213213286189855&rwd_amt=25&rwd_itm=Mondos&slotname=6835248348&rwd_expr_tmstmp=1728383496177&rwd_sig=WdMblVSJGXdVlfZLj93Rxw&pburl=https://api.futmondo.com/admob/ssv`;

  for (let i = 0; i < n; i++) {
    try {
      await axios.get(url);
      console.log(`Request ${i + 1} for userId ${userId}`);
    } catch (error) {
      console.error(`Error in request ${i + 1} for userId ${userId}: `, error);
    }
  }
}

const userIds = [
  // { id: '6527bf532ccd69060ecc4da1' },
  // { id: '6528485154e06a061637e257' },
  // { id: '652862c8a0d05805de803447' },
  // { id: '65284ad654e06a061637e420' },
  { id: '652bc64b2ccd69060ecfb26e' },
  // { id: '5d2356b8a9afa203db590592' },
  // { id: '5d23526c7c5d5440102c3c6c' },
  // { id: '66f9800749fb9a0d154cd190' },
  // { id: '5d35cc288f613c24d052812e' },
];

const amountOfMondos = process.env.AMOUNT;

async function sendGetRequestForAllUsers(amountOfMondos) {
  const numberOfRequests = amountOfMondos / 25;
  userIds.forEach((user) => sendGetRequest(user.id, numberOfRequests));
}

sendGetRequestForAllUsers(amountOfMondos);
