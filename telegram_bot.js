import { Telegraf } from 'telegraf';
import { getSortedMarket } from './src/features/mejores-mercado.feat.js';
import { getLastAccessInfo } from './src/logic/ultimo-acceso.js';
import { sendBidRequest } from './src/logic/puja.js';
import { formatCurrency } from './src/common/utils.js';
import { getPlayerDataAndPayClausula } from './src/logic/clausulazo.js';
import 'dotenv/config';

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.start((ctx) => ctx.reply('¡Hola! Soy tu bot de Futmondo.'));

bot.help((ctx) =>
  ctx.reply(
    'Puedes usar los siguientes comandos:\n/start - Iniciar el bot\n/help - Obtener ayuda\n/puja {id} {cantidad} - Pujar por un jugador\n/mejores - Obtener los mejores jugadores del mercado\n/mejores id - Obtener los mejores jugadores del mercado con su id\n/caros - Obtener los jugadores más caros del mercado\n/caros id - Obtener los jugadores más caros del mercado con su id\n'
  )
);

bot.command('puja', async (ctx) => {
  const message = ctx.message.text;
  const args = message.split(' ');
  const id = args[1];
  const amount = args[2];
  const response = await sendBidRequest(id, amount);
  ctx.reply(response, { parse_mode: 'Markdown' });
});

bot.command('market', async (ctx) => {
  const message = ctx.message.text;
  const args = message.split(' ');
  let sortingMethod = args[1];
  let showId = false;
  if (args.length === 2) showId = true;
  const players = await getSortedMarket(sortingMethod);
  const answer = formatMarketDataToString(players, showId);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

function formatMarketDataToString(players, showId) {
  let answer = '';
  players.forEach((player) => {
    answer += `*${player.jugador}* ${player.lesionado ? '🏥' : ''}\n`;
    answer += `${player.propietario}\n`;
    answer += `Cambio: ${formatCurrency(player.cambio)}\n`;
    answer += `Pujas: ${player.pujas}\n`;
    answer += `Precio: ${formatCurrency(player.precio)}\n`;
    answer += `Media: ${player.media}\n`;
    answer += `Forma: ${player.forma}\n`;
    if (showId) {
      answer += `\n\`${player.id}\`\n\n\n`; // Mostrar el ID solo si showId es true
    }
    answer += '\n\n';
  });
  return answer;
}

bot.command('conexiones', async (ctx) => {
  const lastUserConnections = await getLastAccessInfo();
  const answer = formatLastAccessDataToString(lastUserConnections);
  ctx.reply(answer, { parse_mode: 'Markdown' });
});

bot.command('clausulazo', async (ctx) => {
  const args = getArgs(ctx);
  const playerId = args[1];
  const answer = await getPlayerDataAndPayClausula(playerId);
  ctx.reply(answer, { parse_mode: 'Markdown' });
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
