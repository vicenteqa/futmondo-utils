export function getBody(playerSlug, playerId, price) {
  return {
    header: {
      token: process.env.TOKEN,
      userid: '652bc64b2ccd69060ecfb26e',
    },
    query: {
      championshipId: '6527184d361d0805fd6a729b',
      userteamId: '652bc9051485a17231213ec8',
      player_slug: process.env.PLAYER_SLUG,
      player_id: process.env.PLAYER_ID,
      price: process.env.PRICE,
    },
    answer: {},
  };
}
