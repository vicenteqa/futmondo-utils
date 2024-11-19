import { Telegraf } from 'telegraf';
import fs from 'fs';
import { payClausula } from './src/endpoints/pay-clausula.js';
import { getSortedMarket } from './src/features/mejores-mercado.feat.js';
import { getBestMarket } from './src/features/mejores-mercado.feat.js';
import { getBetis } from './src/features/mejores-mercado.feat.js';
import { getLastAccessInfo } from './src/logic/ultimo-acceso.js';
import { setBid } from './src/logic/puja.js';
import { formatCurrency, sleep } from './src/common/utils.js';
import { getPlayersFromSpecificUser } from './src/logic/get-teams-players.js';
import { getTodayRichmondTransfers } from './src/logic/get-today-transfers.js';
import { getTodayTransfers } from './src/logic/get-today-transfers.js';
import { setPlayersInMarket } from './src/logic/get-sell-candidates.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import cron from 'node-cron';

dayjs.extend(utc);
dayjs.extend(timezone);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

let scheduledBidStatus = true;
let scheduledSetPlayersInMarketStatus = true;

bot.start((ctx) => ctx.reply('¡Hola! Soy tu bot de Futmondo.'));

bot.command('addplayer', async (ctx) => {
  const args = getArgs(ctx);
  const player = {
    slug: args[1],
    price: args[2],
    id: args[3],
    name: args[4],
  };
  await addPlayerClausulazosJson(player);
  ctx.reply('Jugador añadido a la lista de clausulazos');
});

async function addPlayerClausulazosJson(player) {
  if (fs.existsSync('clausulazos.json')) {
    const data = fs.readFileSync('clausulazos.json');
    let clausulazos = JSON.parse(data);
    clausulazos.push(player);
    fs.writeFileSync('clausulazos.json', JSON.stringify(clausulazos));
  } else fs.writeFileSync('clausulazos.json', JSON.stringify([player]));
}

bot.command('listaClausulazos', async (ctx) => {
  const clausulazos = JSON.parse(fs.readFileSync('clausulazos.json'));
  if (clausulazos.length > 0)
    clausulazos.forEach((player) => ctx.reply(player.name));
  else ctx.reply('No hay jugadores en la lista de clausulazos');
});

bot.command('resetClausulazos', async (ctx) => {
  fs.writeFileSync('clausulazos.json', JSON.stringify([]));
  ctx.reply('Lista de clausulazos reseteada');
});

bot.help((ctx) =>
  ctx.reply(
    'Comandos disponibles:\n\n' +
      '/fichajes\n' +
      '/misfichajes\n' +
      '/market\n' +
      '/wanted\n' +
      '/betis\n' +
      '/team\n' +
      '/puja\n' +
      '/conexiones\n' +
      '/switchbid\n' +
      '/switchsell\n\n' +
      `Pujas automáticas: ${scheduledBidStatus ? 'Activado' : 'Desactivado'}\n` +
      `Poner en mercado automático: ${scheduledSetPlayersInMarketStatus ? 'Activado' : 'Desactivado'}`
  )
);

bot.command('misfichajes', async (ctx) => {
  const todayOwnTransfers = await getTodayRichmondTransfers();
  if (todayOwnTransfers.length > 0) {
    const answer = formatOwnTransfersData(todayOwnTransfers);
    ctx.reply(`Fichajes de hoy:\n\n${answer}`, { parse_mode: 'Markdown' });
  } else ctx.reply('No hay fichajes de hoy');
});

cron.schedule('00 4 * * *', async () => {
  if (scheduledSetPlayersInMarketStatus) await setPlayersInMarket();
});

bot.command('switchsell', async (ctx) => {
  scheduledSetPlayersInMarketStatus = !scheduledSetPlayersInMarketStatus;
  const message = `Poner en mercado automático: ${scheduledSetPlayersInMarketStatus ? 'Activado' : 'Desactivado'}`;
  ctx.reply(message);
});

cron.schedule('45 6 * * *', async () => {
  const chatId = process.env.CHAT_ID;
  const todayOwnTransfers = await getTodayRichmondTransfers();
  if (todayOwnTransfers.length > 0) {
    const answer = formatOwnTransfersData(todayOwnTransfers);
    bot.telegram.sendMessage(chatId, `Fichajes de hoy:\n\n${answer}`, {
      parse_mode: 'Markdown',
    });
  }
});

bot.command('fichajes', async (ctx) => {
  const todayTransfers = await getTodayTransfers();
  if (todayTransfers.length > 0) {
    const message = formatTransfersData(todayTransfers);
    ctx.reply(message, { parse_mode: 'Markdown' });
  } else ctx.reply('No hay fichajes de hoy');
});

function formatTransfersData(transfers) {
  let answer = '';
  transfers.forEach(
    (transfer) =>
      (answer += `*${transfer._player.name}* de *${transfer._seller === undefined ? 'CPU' : transfer._seller.name}* a *${transfer._buyer === undefined ? 'CPU' : transfer._buyer.name}* por ${formatCurrency(transfer.price)}\n`)
  );
  return answer;
}

function formatOwnTransfersData(transfers) {
  let answer = '';
  transfers.forEach((transfer, index) => {
    answer += `Has fichado a *${transfer._player.name}* por ${formatCurrency(transfer.price)}\n`;
  });
  return answer;
}

bot.command('switchbid', async (ctx) => {
  scheduledBidStatus = !scheduledBidStatus;
  const message = `Pujas automáticas: ${scheduledBidStatus ? 'Activadas' : 'Desactivadas'}`;
  ctx.reply(message);
});

bot.command('team', async (ctx) => {
  const args = getArgs(ctx);
  const team = args[1];
  const players = await getPlayersFromSpecificUser(team);
  let answer = '';
  if (players === undefined) answer = 'Necesitas especificar un usuario';
  else answer = formatTeamPlayersDataToString(players);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

bot.command('puja', async (ctx) => {
  const args = getArgs(ctx);
  const id = args[1];
  const amount = args[2];
  const response = await setBid(id, amount);
  ctx.reply(response, { parse_mode: 'Markdown' });
});

bot.command('market', async (ctx) => {
  const args = getArgs(ctx);
  let sortingMethod = args[1];
  const players = await getSortedMarket(sortingMethod);
  let answer = '';
  if (players === undefined)
    answer = 'No se han podido obtener los datos del mercado';
  else answer = formatMarketDataToString(players);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

bot.command('wanted', async (ctx) => {
  const players = await getBestMarket();
  let answer = '';
  if (players === undefined)
    answer = 'No se han podido obtener los datos del mercado';
  else if (players.length === 0)
    answer = 'No hay jugadores deseados en el mercado';
  else answer = formatMarketDataToString(players);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

bot.command('betis', async (ctx) => {
  const players = await getBetis();
  let answer = '';
  if (players === undefined)
    answer = 'No se han podido obtener los datos del mercado';
  else if (players.length === 0)
    answer = 'No hay jugadores del Betis en el mercado';
  else answer = formatMarketDataToString(players);
  ctx.reply(`Jugadores del Betis en el mercado: \n\n${answer}`, {
    parse_mode: 'Markdown',
  });
});

cron.schedule('30 3 * * *', async () => {
  if (scheduledBidStatus) {
    const chatId = process.env.CHAT_ID;
    const players = await getBestMarket();
    if (players.length === 0) return;
    else {
      for (let i = 0; i < players.length; i++) {
        const bidResult = await setBid(players[i].id);
        bot.telegram.sendMessage(chatId, bidResult, { parse_mode: 'Markdown' });
      }
    }
  }
});

function formatMarketDataToString(players) {
  let answer = '';
  players.forEach((player) => {
    answer += `*${player.jugador}* ${player.lesionado ? '🏥' : ''}\n`;
    answer += `${player.propietario}\n`;
    answer += `Cambio: ${formatCurrency(player.cambio)}\n`;
    answer += `Pujas: ${player.pujas}\n`;
    answer += `Precio: ${formatCurrency(player.precio)}\n`;
    answer += `Media: ${player.media}\n`;
    answer += `Forma: ${player.forma}\n`;
    answer += `\n\`/puja ${player.id}\`\n\n\n`;
  });
  return answer;
}

function formatTeamPlayersDataToString(players) {
  let answer = '';
  players.forEach((player) => {
    answer += `*${player.jugador}* ${player.lesionado ? '🏥' : ''}\n`;
    answer += `${player.propietario}\n`;
    answer += `Cambio: ${formatCurrency(player.cambio)}\n`;
    answer += `Pujas: ${player.pujas}\n`;
    answer += `Cláusula: ${formatCurrency(player.clausula)}\n`;
    answer += `Media: ${player.media}\n`;
    answer += `Forma: ${player.forma}\n`;
    answer += `\n\`/addplayer ${player.slug} ${player.clausula} ${player.id} ${player.jugador.replace(/\s+/g, '')}\`\n\n\n`;
  });
  return answer;
}

cron.schedule('20 13 * * *', async () => {
  const players = JSON.parse(fs.readFileSync('clausulazos.json'));
  if (players.length > 0) {
    const results = await Promise.allSettled(
      players.map((player) => payClausula(player.slug, player.price, player.id))
    );
    let message = '';

    results.forEach((result, index) => {
      const timestamp = dayjs()
        .tz('Europe/Madrid')
        .format('DD/MM/YYYY HH:mm:ss');
      if (result.status === 'fulfilled') {
        if (result.value.answer.code === 'api.general.ok')
          message = `Jugador ${players[index].name} comprado por ${formatCurrency(players[index].price)}€`;
        else if (result.value.answer.error)
          message = `Error al pagar clausula de ${players[index].name}: ${result.value.answer.code}`;
        else
          message = `Error desconocido al pagar la clausula de ${players[index].name}`;
      } else
        message = `Error en la request al pagar la clausula de ${players[index].name}`;
      bot.telegram.sendMessage(process.env.CHAT_ID, `${timestamp}: ${message}`);
    });
  }
});

bot.command('conexiones', async (ctx) => {
  const lastUserConnections = await getLastAccessInfo();
  const answer = formatLastAccessDataToString(lastUserConnections);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

cron.schedule('45 06 * * *', async () => {
  const chatId = process.env.CHAT_ID;
  const betisPlayers = await getBetis();
  if (betisPlayers.length === 0) return;
  else {
    const message = formatMarketDataToString(betisPlayers);
    bot.telegram.sendMessage(
      chatId,
      `Jugadores del Betis en el mercado: \n\n${message}`,
      { parse_mode: 'Markdown' }
    );
  }
});

function getArgs(ctx) {
  const message = ctx.message.text;
  return message.split(' ');
}

function formatLastAccessDataToString(data) {
  let answer = '';
  data.forEach((user) => {
    answer += `*${user.nombre}*: ${user.ultimo_acceso}\n`;
  });
  return answer;
}

bot.launch();

console.log('Telegram Bot de Futmondo iniciado');
