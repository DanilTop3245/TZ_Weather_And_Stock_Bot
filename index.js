require("dotenv").config();
const { Telegraf } = require("telegraf");
const fetch = require("node-fetch");
const fs = require("fs");

const bot = new Telegraf(process.env.BOT_TOKEN);

// Функция логирования
function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync("bot.log", `[${timestamp}] ${message}\n`);
}

bot.start((ctx) => {
  ctx.reply(
    "Привет! Я бот для получения погоды и цены закрытия акций по тикеру компании.\nНапиши команду /help чтобы узнать как пользоваться ботом."
  );
  log(`START: ${ctx.from.username || ctx.from.first_name}`);
});

bot.help((ctx) => {
  ctx.reply(
    "Главные команды:\n/start - Начать взаимодействие с ботом\n/help - Получить список доступных команд\n/weather <city> - Получить текущую погоду по определённому городу, например: /weather Kiev\n/stock <ticker> - Получить цену закрытия акций по тикеру компании, например: /stock AAPL"
  );
  log(`HELP: ${ctx.from.username || ctx.from.first_name}`);
});

// Команда погоды
bot.command("weather", async (ctx) => {
  const parts = ctx.message.text.split(" ");
  const city = parts[1];
  const user = ctx.from.username || ctx.from.first_name;

  if (!city) {
    ctx.reply(
      "Вы неверно ввели команду для полуения погоды введите /weather <название города>."
    );
    log(`WEATHER: ${user} — Город не указан`);
    return;
  }

  try {
    const response = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`
    );
    const data = await response.json();
    if (data.error) {
      ctx.reply(`Ошибка: ${data.error.message}`);
      log(`WEATHER: ${user} — Ошибка: ${data.error.message}`);
    } else {
      const temp = data.current.temp_c;
      const message =
        temp < 15
          ? `Сегодня температура ${temp} градусов, холодно, одень куртку`
          : `Сегодня ${temp} градусов, отличный день, можно бегать в футболке`;
      ctx.reply(message);
      log(`WEATHER: ${user} — ${city}: ${temp}°C`);
    }
  } catch (error) {
    ctx.reply(
      "Не удалось получить данные о погоде. Пожалуйста, попробуйте позже или проверьту правильность написания команды."
    );
    log(`WEATHER: ${user} — Ошибка при fetch`);
  }
});

// Команда акций
bot.command("stock", async (ctx) => {
  const parts = ctx.message.text.split(" ");
  const ticker = parts[1];
  const user = ctx.from.username || ctx.from.first_name;

  if (!ticker) {
    ctx.reply(
      "Вы неверно ввели команду для полуения цены закрытия акций введите /stock <тикер компании>."
    );
    log(`STOCK: ${user} — Тикер не указан`);
    return;
  }

  try {
    const response = await fetch(
      `https://data.nasdaq.com/api/v3/datatables/QUOTEMEDIA/PRICES?ticker=${ticker}&api_key=${process.env.NASDAQ_API_KEY}`
    );
    const data = await response.json();
    const rows = data.datatable.data;
    if (rows.length === 0) {
      ctx.reply(
        "Данные не найдены для указанного тикера. Пожалуйста, проверьте правильность написания тикера или по данному тикеру может не быть данных."
      );
      log(`STOCK: ${user} — Нет данных для тикера ${ticker}`);
      return;
    }
    const latest = rows[0];
    const date = latest[1];
    const closePrice = latest[5];
    ctx.reply(`Дата: ${date}\nЦена закрытия акций ${ticker}: $${closePrice}`);
    log(`STOCK: ${user} — ${ticker}: $${closePrice}`);
  } catch (error) {
    ctx.reply(
      "Произошла ошибка при получении данных о ценах акций. Пожалуйста, попробуйте позже или проверьте правильность написания тикера."
    );
    log(`STOCK: ${user} — Ошибка при fetch`);
  }
});

bot.launch();
log("Бот запущен");

// Остановка
process.once("SIGINT", () => {
  log("Остановка бота (SIGINT)");
  bot.stop("SIGINT");
});
process.once("SIGTERM", () => {
  log("Остановка бота (SIGTERM)");
  bot.stop("SIGTERM");
});
