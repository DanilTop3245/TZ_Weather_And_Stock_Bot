require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const fetch = require("node-fetch");
const fs = require("fs");

const bot = new Telegraf(process.env.BOT_TOKEN);

function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync("bot.log", `[${timestamp}] ${message}\n`);
}

bot.start((ctx) => {
  ctx.reply(
    "Привет! Выберите, что хотите узнать:",
    Markup.inlineKeyboard([
      [
        Markup.button.callback("Погода", "ask_weather"),
        Markup.button.callback("Акции", "ask_stock"),
      ],
    ])
  );
  bot.context.mode = null;
  log(`START: ${ctx.from.username || ctx.from.first_name}`);
});

bot.help((ctx) => {
  ctx.reply(
    "Главные команды:\n/start - Начать\n/help - Помощь\n/weather <город>\n/stock <тикер>"
  );
  log(`HELP: ${ctx.from.username || ctx.from.first_name}`);
});

// Обработка кнопки Погода
bot.action("ask_weather", (ctx) => {
  ctx.reply("Введите название города, чтобы узнать погоду.");
  bot.context.mode = { type: "weather", userId: ctx.from.id };
});

// Обработка кнопки Акции
bot.action("ask_stock", (ctx) => {
  ctx.reply("Введите название компании или тикер, чтобы узнать цену акций.");
  bot.context.mode = { type: "stock", userId: ctx.from.id };
});

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const userInput = ctx.message.text.trim();
  const user = ctx.from.username || ctx.from.first_name;

  const mode = bot.context.mode;
  if (!mode || mode.userId !== userId) {
    ctx.reply('Пожалуйста, нажмите кнопку "Погода" или "Акции", чтобы начать.');
    return;
  }

  if (mode.type === "weather") {
    return getWeather(ctx, userInput, user);
  }

  if (mode.type === "stock") {
    return getStock(ctx, userInput, user);
  }
});

async function getWeather(ctx, city, user) {
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
          ? `Сегодня температура ${temp}°C, холодно, одень куртку.`
          : `Сегодня ${temp}°C, отличный день, можно бегать в футболке.`;
      ctx.reply(message);
      log(`WEATHER: ${user} — ${city}: ${temp}°C`);
    }
  } catch (error) {
    ctx.reply("Ошибка при получении данных о погоде. Попробуйте позже.");
    log(`WEATHER: ${user} — Ошибка при fetch`);
  }
}

async function getStock(ctx, input, user) {
  try {
    const guessTicker = input.toUpperCase();
    let response = await fetch(
      `https://data.nasdaq.com/api/v3/datatables/QUOTEMEDIA/PRICES?ticker=${guessTicker}&api_key=${process.env.NASDAQ_API_KEY}`
    );
    let data = await response.json();

    if (!data.datatable || data.datatable.data.length === 0) {
      ctx.reply(
        "Не найден тикер. Попробуйте точный тикер, например AAPL или MSFT."
      );
      log(`STOCK: ${user} — Не найден тикер ${input}`);
      return;
    }

    const latest = data.datatable.data[0];
    const date = latest[1];
    const closePrice = latest[5];
    ctx.reply(
      `Дата: ${date}\nЦена закрытия акций ${guessTicker}: $${closePrice}`
    );
    log(`STOCK: ${user} — ${guessTicker}: $${closePrice}`);
  } catch (error) {
    ctx.reply("Ошибка при получении данных об акциях. Попробуйте позже.");
    log(`STOCK: ${user} — Ошибка при fetch`);
  }
}

bot.launch();
log("Бот запущен");

process.once("SIGINT", () => {
  log("Остановка бота (SIGINT)");
  bot.stop("SIGINT");
});
process.once("SIGTERM", () => {
  log("Остановка бота (SIGTERM)");
  bot.stop("SIGTERM");
});
