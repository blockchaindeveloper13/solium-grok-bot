// Bağımlılıkları yükle
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

// Express ve bot ayarları
const app = express();
app.use(express.json()); // Webhook için JSON isteklerini işle

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token);

// Heroku app URL'si ve webhook ayarı
const HEROKU_APP_NAME = process.env.HEROKU_APP_NAME || 'solium-grok-bot-741701423e96'; // Fallback
const webhookUrl = `https://${HEROKU_APP_NAME}.herokuapp.com/bot${token}`;
bot.setWebHook(webhookUrl).then(() => {
  console.log(`Webhook ayarlandı: ${webhookUrl}`);
}).catch((error) => {
  console.error('Webhook ayarlanamadı:', error.message);
});

// Ham içerik (content) - Kodda tutuyoruz
const contentPool = [
  { text: 'Solium Coin presale başlıyor! Helal finansla geleceği inşa ediyoruz.', context: 'presale' },
  { text: 'Dubai’den dünyaya helal finans devrimi! Solium Coin’le tanış.', context: 'intro' },
  { text: 'Etik yatırım mı arıyorsun? Solium Coin tam sana göre!', context: 'ethics' },
  { text: 'Presale fırsatını kaçırma! Solium Coin’le kazan.', context: 'presale' },
];

// Content’i kontekste göre seçme ve akıl yürütme
function selectContentByContext(prompt, contextType) {
  // Önce kontekste uygun içerikleri filtrele
  const relevantContent = contentPool.filter(item => item.context === contextType);
  // Eğer uygun içerik yoksa, genel bir içerik seç
  const fallbackContent = contentPool[Math.floor(Math.random() * contentPool.length)].text;
  
  // Akıl yürütme: Prompt’a göre içeriği özelleştir
  if (prompt.toLowerCase().includes('presale')) {
    return relevantContent.find(item => item.context === 'presale')?.text || fallbackContent;
  } else if (prompt.toLowerCase().includes('helal') || prompt.toLowerCase().includes('etik')) {
    return relevantContent.find(item => item.context === 'ethics')?.text || fallbackContent;
  } else if (prompt.toLowerCase().includes('dubai') || prompt.toLowerCase().includes('tanış')) {
    return relevantContent.find(item => item.context === 'intro')?.text || fallbackContent;
  }
  return fallbackContent;
}

// Grok API'den içerik alma
async function getGrokContent(prompt, contextType = 'general') {
  try {
    if (!process.env.GROK_API_KEY) {
      console.warn('GROK_API_KEY eksik, contentPool’dan seçim yapılıyor.');
      return selectContentByContext(prompt, contextType);
    }
    const response = await axios.post(
      'https://api.x.ai/grok',
      { prompt: `${prompt} Samimi bir tonda, helal finans vurgusu yap, #SoliumCoin ekle.` },
      { headers: { Authorization: `Bearer ${process.env.GROK_API_KEY}` } }
    );
    const content = response.data.content;
    if (!content || content.length < 10) {
      console.warn('Grok API içeriği geçersiz, contentPool’dan seçim yapılıyor.');
      return selectContentByContext(prompt, contextType);
    }
    return content;
  } catch (error) {
    console.error('Grok API hatası:', error.message);
    return selectContentByContext(prompt, contextType);
  }
}

// 3 saatte bir otomatik paylaşım
setInterval(async () => {
  try {
    const content = await getGrokContent('Solium Coin için kısa, çarpıcı bir Telegram gönderisi yaz.', 'presale');
    const message = `${content} 🚀 #SoliumCoin #HelalFinans\nDetaylar: soliumcoin.com`;
    await bot.sendMessage('@soliumcoin', message); // Kanalda paylaş
    console.log('Paylaşım yapıldı:', message);
  } catch (error) {
    console.error('Paylaşım hatası:', error.message);
  }
}, 3 * 60 * 60 * 1000); // 3 saat (10800000 ms)

// Webhook endpoint
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Kök route (H81 hatalarını azaltmak için)
app.get('/', (req, res) => {
  res.send('Solium Moon Bot çalışıyor!');
});

// Komut: /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Kanka, Solium Moon Bot’a hoş geldin! 🌙\nSolium Coin’le helal finans devrimine katıl!\nKomutlar için /help yaz.');
});

// Komut: /presale
bot.onText(/\/presale/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Solium Coin presale fırsatını kaçırma! 😎\nMetamask cüzdanını hazırla: soliumcoin.com');
});

// Komut: /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Solium Moon Bot komutları:\n/start - Başla\n/presale - Presale detayları\n/help - Bu mesaj\n\nBotun mesajlarını alıntılayarak Grok’a soru sorabilirsin! 🚀');
});

// Alıntı mesajla Grok’u tetikleme
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  // Botun kendi mesajlarını ve komutları yoksay
  if (msg.from.id === bot.getMe().id || msg.text?.startsWith('/')) return;

  // Alıntı mesaj varsa ve botun mesajına yanıt ise
  if (msg.reply_to_message && msg.reply_to_message.from.id === (await bot.getMe()).id) {
    const userQuestion = msg.text || 'Sorun ne kanka?';
    try {
      const contextType = userQuestion.toLowerCase().includes('presale') ? 'presale' : 
                         userQuestion.toLowerCase().includes('helal') ? 'ethics' : 'general';
      const grokResponse = await getGrokContent(`Kullanıcı şunu sordu: "${userQuestion}". Solium Coin odaklı, samimi bir cevap ver.`, contextType);
      const reply = `Kanka, işte cevabın: ${grokResponse} 😎\n#SoliumCoin #HelalFinans`;
      await bot.sendMessage(chatId, reply, { reply_to_message_id: msg.message_id });
      console.log(`Grok cevabı gönderildi: ${reply}`);
    } catch (error) {
      console.error('Grok tetikleme hatası:', error.message);
      await bot.sendMessage(chatId, 'Ups, bir şeyler yanlış gitti! 😅 Tekrar dene.', { reply_to_message_id: msg.message_id });
    }
  }
});

// Express sunucusunu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot sunucusu ${PORT} portunda çalışıyor...`);
});
