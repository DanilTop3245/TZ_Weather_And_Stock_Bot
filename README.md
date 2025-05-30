# 🌤📈 TZ_Weather_And_Stock_Bot

Простой Telegram-бот на Node.js, который предоставляет:

- Текущую погоду по команде `/weather <город>`
- Последнюю цену акций по команде `/stock <тикер>`

## 📌 Команды

- `/start` — приветственное сообщение
- `/help` — список доступных команд
- `/weather <город>` — узнает текущую температуру (например: `/weather Kyiv`)
- `/stock <тикер>` — получает цену закрытия акции (например: `/stock AAPL`)

## 🧰 Технологии

- Node.js
- Telegraf
- WeatherAPI.com
- Nasdaq Data Link (QUANDL)

## ⚙️ Установка и запуск

```bash
# 1. Клонировать проект
git clone https://github.com/your-username/TZ_Weather_And_Stock_Bot.git
cd TZ_Weather_And_Stock_Bot

# 2. Установить зависимости
npm install

# 3. Создать .env файл и добавить ключи API
echo "BOT_TOKEN=ваш_токен_бота" > .env
echo "WEATHER_API_KEY=ваш_ключ_от_weatherapi" >> .env
echo "STOCK_API_KEY=ваш_ключ_от_nasdaq" >> .env

# 4. Запустить бота
node index.js
```

## 📁 Структура проекта

```
TZ_Weather_And_Stock_Bot/
├── index.js        # Основная логика бота
├── .env            # Переменные окружения (не публиковать!)
├── package.json    # Зависимости и информация о проекте
└── README.md       # Документация проекта
```

## ❗ Важно

- Не публикуйте `.env` — он содержит приватные ключи.
- Убедитесь, что ваши API-ключи действительны и не превышают лимиты.
- Для корректной работы убедитесь, что у вас установлен Node.js версии ≥14.

## 📝 Лицензия

Этот проект распространяется под лицензией MIT.
