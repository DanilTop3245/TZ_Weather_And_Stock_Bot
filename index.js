require("dotenv").config();
const { Telegraf } = require("telegraf");
const fetch = require("node-fetch");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) =>
  ctx.reply(
    "Привет! Я бот для получения погоды и цены закрытия акций по тикеру компании.\nНапиши команду /help чтобы узнать как пользоваться ботом."
  )
);

bot.help((ctx) =>
  ctx.reply(
    "Главные команды:\n/start - Начать взаимодействие с ботом\n/help - Получить список доступных команд\n/weather <city> - Получить текущую погоду по определённому городу, например: /weather Kiev\n/stock <ticker> - Получить цену закрытия акций по тикеру компании, например: /stock AAPL"
  )
);

// Команда погоды
bot.command("weather", async (ctx) => {
  const parts = ctx.message.text.split(" ");
  const city = parts[1];
  if (!city) {
    ctx.reply(
      "Вы неверно ввели команду для полуения погоды введите /weather <название города>."
    );
    return;
  }

  try {
    const response = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`
    );
    const data = await response.json();
    if (data.error) {
      ctx.reply(`Ошибка: ${data.error.message}`);
    } else {
      const temp = data.current.temp_c;
      const message =
        temp < 15
          ? `Сегодня температура ${temp} градусов, холодно, одень куртку`
          : `Сегодня ${temp} градусов, отличный день, можно бегать в футболке`;
      ctx.reply(message);
    }
  } catch (error) {
    ctx.reply(
      "Не удалось получить данные о погоде. Пожалуйста, попробуйте позже или проверьту правильность написания команды."
    );
  }
});

// Команда акций
bot.command("stock", async (ctx) => {
  const parts = ctx.message.text.split(" ");
  const ticker = parts[1];
  if (!ticker) {
    ctx.reply(
      "Вы неверно ввели команду для полуения цены закрытия акций введите /stock <тикер компании>."
    );
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
      return;
    }
    const latest = rows[0];
    const date = latest[1];
    const closePrice = latest[5];
    ctx.reply(`Дата: ${date}\nЦена закрытия акций ${ticker}: $${closePrice}`);
  } catch (error) {
    ctx.reply(
      "Произошла ошибка при получении данных о ценах акций. Пожалуйста, попробуйте позже или проверьте правильность написания тикера."
    );
  }
});

bot.launch();

// Остановка
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
