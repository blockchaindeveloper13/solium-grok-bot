// Uygulama başlatılıyor
console.log('Application starting...');

try {
  // Bağımlılıkları yükle
  require('dotenv').config();
  console.log('dotenv yüklendi.');
  const TelegramBot = require('node-telegram-bot-api');
  const express = require('express');
  const axios = require('axios');
  const franc = require('franc');
  console.log('Bağımlılıklar yüklendi: node-telegram-bot-api, express, axios, franc.');
} catch (error) {
  console.error('Bağımlılık yükleme hatası:', error.message, error.stack);
  process.exit(1);
}

// Ortam değişkenlerini kontrol et
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('HATA: TELEGRAM_BOT_TOKEN tanımlı değil! Config Vars’ı kontrol et.');
  process.exit(1);
}
const HEROKU_APP_NAME = process.env.HEROKU_APP_NAME || 'solium-grok-bot-741701423e96';
console.log(`HEROKU_APP_NAME: ${HEROKU_APP_NAME}`);
const GROK_API_KEY = process.env.GROK_API_KEY;
if (!GROK_API_KEY) {
  console.warn('UYARI: GROK_API_KEY tanımlı değil, fallback kullanılacak.');
}

// Express ve bot ayarları
const app = express();
app.use(express.json()); // Webhook için JSON isteklerini işle
console.log('Express ayarlandı.');

const bot = new TelegramBot(token, { polling: false });

// Bot kimliğini önbelleğe al
let botId = null;
bot.getMe()
  .then((botInfo) => {
    botId = botInfo.id;
    console.log(`Bot kimliği alındı: ${botId}`);
  })
  .catch((error) => {
    console.error('Bot kimliği alınamadı:', error.message, error.stack);
    process.exit(1);
  });

// Heroku app URL'si ve webhook ayarı
const webhookUrl = `https://${HEROKU_APP_NAME}.herokuapp.com/bot${token}`;
console.log(`Webhook URL’si: ${webhookUrl}`);
bot.setWebHook(webhookUrl)
  .then(() => {
    console.log(`Webhook başarıyla ayarlandı: ${webhookUrl}`);
  })
  .catch((error) => {
    console.error('Webhook ayarlanamadı:', error.message, error.stack);
    process.exit(1);
  });

// Content - İngilizce, otomatik paylaşımlar için uygun
const content = `
Join the halal finance revolution with Solium Coin (SLM)! 🌙
Project: Solium Coin
Website: https://soliumcoin.com
Total Supply: 100,000,000 SLM
Presale: 50,000,000 SLM (50%)
Airdrop: 10,000,000 SLM (10%)
Blockchain: Binance Smart Chain (BSC) and Solana
BSC Contract Address: 0x307a0dc0814CbD64E81a9BC8517441Ca657fB9c7
Solana Contract Address: 9rFLChxL7444pp1ykat7eoaFh76BiLEZNXUvn9Fpump

Tokenomics:
- Presale: 50M SLM (50%)
- Liquidity: 20M SLM (20%)
- Airdrop: 10M SLM (10%)
- Staking: 10M SLM (10%)
- GameFi & Rewards: 10M SLM (10%)

Features:
- 100% Fair Launch: No team tokens, no dev fees, no private sale.
- Web3 Values: Transparency, decentralization, community-driven.
- Staking, DAO governance, GameFi expansion, and cross-chain bridge planned.
- Not available to residents of the USA, Canada, or OFAC-sanctioned countries.

Roadmap:
Q1 – Launch & Presale
- Token created, smart contract deployed (Completed)
- Website, GitHub, Medium, Telegram, X launched (Completed)
- Presale started (Completed)
- First influencer collaborations
- Community growth

Q2 – Growth & Visibility
- DEXTools, CoinGecko, CoinMarketCap listings
- First CEX listing (Target: MEXC or Bitget)
- Airdrop distribution (10M SLM)
- Community engagement and staking Dapp integration

Q3 – Expansion
- Staking launch (10M SLM allocated)
- KuCoin & Binance listing targets
- GameFi concept introduction
- DAO development and bridge research

Q4 – Ecosystem Development
- GameFi launch with SLM usage
- Real-world integrations & long-term staking
- Utility-driven NFT collection
- Global marketing and community expansion

Official Links:
- Website: https://soliumcoin.com
- Telegram Group: https://t.me/soliumcoinchat
- Telegram Channel: https://t.me/soliumcoin
- Twitter/X: https://x.com/soliumcoin
- GitHub: https://github.com/soliumcoin/solium-project
- Medium: https://medium.com/@soliumcoin

Benefits:
- Speed: Lightning-fast transactions with BSC and Solana.
- Security: Advanced encryption protocols keep funds safe.
- Scalability: Robust platform supporting high transaction volumes.
- Community-Driven: A passionate community shaping the project.

Transparency and Security:
- Audited Contracts: BSC Contract Address: 0x307a0dc0814CbD64E81a9BC8517441Ca657fB9c7
- Open Source Code: Available on GitHub: https://github.com/soliumcoin/solium-project
- No Team Tokens: Fair token distribution.

Airdrop and Presale:
- Airdrop: Join the Telegram group (t.me/soliumcoinchat) and share your BSC address. Chance to win 1M $SLM every 7 days!
- Presale: Buy $SLM with BNB via MetaMask at https://soliumcoin.com (1 BNB = 10,000 $SLM). Rewards for top buyers:
  - 1st: 1M $SLM
  - 2nd: 500K $SLM
  - 3rd: 100K $SLM
  - 4th-10th: Additional rewards!

Solium Coin is a groundbreaking crypto project aiming to revolutionize the blockchain world. Join the Airdrop and Presale to be part of the future. More info: https://soliumcoin.com #SoliumCoin #HalalFinance
`;

// Çok dilli samimi yanıtlar
const casualResponses = {
  en: [
    'Hey, what’s up! 😎 Ready to join the halal finance revolution with Solium Coin? Ask away!',
    'I’m good, how about you? 😄 Checked out the Solium Coin presale yet? Don’t miss it!',
    'Yo, what’s on your mind? Solium Coin’s got all the halal finance vibes! 🚀',
  ],
  tr: [
    'Kanka, naber! 😎 Solium Coin’le helal finans devrimine hazır mısın? Sor bakalım!',
    'İyiyim kanka, sen nasılsın? 😄 Presale’e bi göz attın mı, fırsat kaçmaz!',
    'Hadi kanka, ne sorcan? Solium Coin’in helal finans dünyasında her şey bende! 🚀',
  ],
  ar: [
    'مرحبًا، كيف حالك؟ 😎 هل أنت جاهز لثورة التمويل الحلال مع Solium Coin؟ اسألني!',
    'أنا بخير، وأنت؟ 😄 هل اطلعت على بيع Solium Coin المسبق؟ لا تفوتها!',
    'هيا، ما الذي تريد معرفته؟ Solium Coin هو عالم التمويل الحلال! 🚀',
  ],
};

// Dil tespit fonksiyonu (franc ile)
function detectLanguage(text) {
  if (!text) {
    console.log('Dil tespiti: Metin yok, varsayılan İngilizce.');
    return 'en';
  }
  try {
    const langCode = franc(text, { minLength: 2, whitelist: ['eng', 'tur', 'ara'] });
    const detected = langCode === 'tur' ? 'tr' : langCode === 'ara' ? 'ar' : 'en';
    console.log(`Dil tespiti: "${text}" -> ${detected}`);
    return detected;
  } catch (error) {
    console.error('Dil tespit hatası:', error.message, error.stack);
    return 'en';
  }
}

// Content’i prompt’a göre seçme (fallback)
function selectContentByContext(prompt, language = 'en') {
  console.log(`Content seçiliyor, prompt: ${prompt}, dil: ${language}`);
  try {
    if (
      prompt.toLowerCase().includes('naber') ||
      prompt.toLowerCase().includes('nasılsın') ||
      prompt.toLowerCase().includes('iyi misin') ||
      prompt.toLowerCase().includes('ne haber') ||
      prompt.toLowerCase().includes("what's up") ||
      prompt.toLowerCase().includes('how are you') ||
      prompt.toLowerCase().includes('مرحبا') ||
      prompt.toLowerCase().includes('كيف حالك')
    ) {
      const responses = casualResponses[language] || casualResponses.en;
      const casual = responses[Math.floor(Math.random() * responses.length)];
      console.log(`Samimi yanıt seçildi: ${casual}`);
      return casual;
    }

    const lines = content.split('\n').filter((line) => line.trim() !== '');
    const relevantLines = lines.filter(
      (line) =>
        (prompt.toLowerCase().includes('presale') && line.toLowerCase().includes('presale')) ||
        (prompt.toLowerCase().includes('halal') && line.toLowerCase().includes('halal')) ||
        (prompt.toLowerCase().includes('ethical') && line.toLowerCase().includes('ethical')) ||
        (prompt.toLowerCase().includes('dubai') && line.toLowerCase().includes('dubai')) ||
        (prompt.toLowerCase().includes('info') && line.toLowerCase().includes('solium coin'))
    );
    const selected =
      relevantLines.length > 0
        ? relevantLines[Math.floor(Math.random() * relevantLines.length)]
        : 'Join Solium Coin’s halal finance revolution! 😎 More info: https://soliumcoin.com';
    console.log(`Seçilen content: ${selected}`);
    return selected;
  } catch (error) {
    console.error('selectContentByContext hatası:', error.message, error.stack);
    return 'Join Solium Coin’s halal finance revolution! 😎 More info: https://soliumcoin.com';
  }
}

// Grok API'den içerik alma
async function getGrokContent(prompt, language = 'en') {
  console.log(`Grok API çağrılıyor, prompt: ${prompt}, dil: ${language}`);
  try {
    if (!GROK_API_KEY) {
      console.warn('GROK_API_KEY eksik, content’ten seçim yapılıyor.');
      return selectContentByContext(prompt, language);
    }
    const systemPrompt = `
You are Solium Coin’s friendly and informative assistant. Use the provided content as a knowledge base to answer user questions naturally, emphasizing halal finance. Detect the user’s language from the prompt and respond only in that language after the first English response. Ensure proper grammar, punctuation, and tone (friendly and engaging). For Turkish, follow Turkish spelling and grammar rules (correct capitalization, punctuation). Add #SoliumCoin and #HalalFinance. Do not respond in multiple languages. Content:\n\n${content}
`;
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: 'grok-beta',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      { headers: { Authorization: `Bearer ${GROK_API_KEY}` } }
    );
    const grokContent = response.data.choices[0].message.content.trim();
    if (!grokContent || grokContent.length < 10) {
      console.warn('Grok API içeriği geçersiz, content’ten seçim yapılıyor.');
      return selectContentByContext(prompt, language);
    }
    console.log(`Grok API cevabı: ${grokContent}`);
    return grokContent;
  } catch (error) {
    console.error('Grok API hatası:', error.message, error.stack);
    return selectContentByContext(prompt, language);
  }
}

// 3 saatte bir otomatik paylaşım (İngilizce)
const targetChat = '@soliumcoin'; // Grup için '@soliumcoinchat' yap veya chat ID kullan
setInterval(async () => {
  console.log(`Otomatik paylaşım başlıyor, hedef: ${targetChat}`);
  try {
    let message;
    try {
      const content = await getGrokContent(
        'Write a short, compelling Telegram post praising Solium Coin, emphasizing its halal finance vision and encouraging investment. Use an enthusiastic tone and English only.',
        'en'
      );
      message = `${content} 🚀 #SoliumCoin #HalalFinance\nMore info: https://soliumcoin.com`;
    } catch (error) {
      console.warn('Grok API paylaşım hatası, fallback kullanılıyor:', error.message, error.stack);
      message =
        'Solium Coin is revolutionizing halal finance with transparency and community power! 🌙 Join the presale now at https://soliumcoin.com 🚀 #SoliumCoin #HalalFinance';
    }
    if (message.length > 4096) {
      console.warn('Mesaj çok uzun, kısaltılıyor.');
      await bot.sendMessage(targetChat, message.substring(0, 4090) + '...');
    } else {
      await bot.sendMessage(targetChat, message);
    }
    console.log('Paylaşım yapıldı:', message);
  } catch (error) {
    console.error('Paylaşım hatası:', error.message, error.stack);
  }
}, 3 * 60 * 60 * 1000); // 3 saat

// Webhook endpoint
app.post(`/bot${token}`, (req, res) => {
  console.log('Webhook isteği alındı:', JSON.stringify(req.body));
  try {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook işleme hatası:', error.message, error.stack);
    res.sendStatus(500);
  }
});

// Kök route (H81 hatalarını azaltmak için)
app.get('/', (req, res) => {
  console.log('Kök route çağrıldı.');
  res.send('Solium Moon Bot çalışıyor!');
});

// Komut: /start
bot.onText(/\/start/, (msg) => {
  console.log(`Komut alınd

ı: /start, chatId: ${msg.chat.id}, chatType: ${msg.chat.type}`);
  try {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to Solium Moon Bot! 🌙\nJoin the halal finance revolution with Solium Coin!\nType /help for commands.');
  } catch (error) {
    console.error('/start komut hatası:', error.message, error.stack);
  }
});

// Komut: /presale
bot.onText(/\/presale/, (msg) => {
  console.log(`Komut alındı: /presale, chatId: ${msg.chat.id}, chatType: ${msg.chat.type}`);
  try {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Don’t miss the Solium Coin presale! 😎\nPrepare your MetaMask: https://soliumcoin.com');
  } catch (error) {
    console.error('/presale komut hatası:', error.message, error.stack);
  }
});

// Komut: /help
bot.onText(/\/help/, (msg) => {
  console.log(`Komut alındı: /help, chatId: ${msg.chat.id}, chatType: ${msg.chat.type}`);
  try {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      'Solium Moon Bot commands:\n/start - Get started\n/presale - Presale details\n/help - This message\n\nReply to my messages to ask about Solium Coin! 🚀'
    );
  } catch (error) {
    console.error('/help komut hatası:', error.message, error.stack);
  }
});

// Komut: /airdrop (çekiliş duyurusu)
bot.onText(/\/airdrop/, (msg) => {
  console.log(`Komut alındı: /airdrop, chatId: ${msg.chat.id}, chatType: ${msg.chat.type}`);
  try {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      'Join the Solium Coin airdrop! 🚀 Share your BSC address in t.me/soliumcoinchat for a chance to win 1M $SLM every 7 days! #SoliumCoin #HalalFinance'
    );
  } catch (error) {
    console.error('/airdrop komut hatası:', error.message, error.stack);
  }
});

// Alıntı mesajla Grok’u tetikleme
bot.on('message', async (msg) => {
  console.log(`Mesaj alındı: chatId: ${msg.chat.id}, chatType: ${msg.chat.type}, text: ${msg.text}, from: ${msg.from?.id}`);
  try {
    if (!botId) {
      console.error('Bot kimliği henüz alınmadı, mesaj işlenemiyor.');
      return;
    }
    if (msg.from?.id === botId || msg.text?.startsWith('/')) {
      console.log('Botun kendi mesajı veya komut, yoksayılıyor.');
      return;
    }
    if (msg.reply_to_message && msg.reply_to_message.from.id === botId) {
      console.log('Alıntı mesaj tespit edildi:', JSON.stringify(msg.reply_to_message));
      const userQuestion = msg.text || 'What’s up?';
      const language = detectLanguage(userQuestion);
      const grokResponse = await getGrokContent(
        `User asked: "${userQuestion}". Provide a friendly, Solium Coin-focused answer in the user’s language (detected as ${language}). First response in English if it’s the user’s first interaction.`,
        language
      );
      const reply = `${grokResponse} 😎\n#SoliumCoin #HalalFinance`;
      if (reply.length > 4096) {
        console.warn('Yanıt çok uzun, kısaltılıyor.');
        await bot.sendMessage(msg.chat.id, reply.substring(0, 4090) + '...', { reply_to_message_id: msg.message_id });
      } else {
        await bot.sendMessage(msg.chat.id, reply, { reply_to_message_id: msg.message_id });
      }
      console.log(`Grok cevabı gönderildi: ${reply}`);
    } else {
      console.log('Alıntı mesaj değil veya botun mesajına yanıt değil.');
    }
  } catch (error) {
    console.error('Mesaj işleme hatası:', error.message, error.stack);
    const language = detectLanguage(msg.text);
    const errorMsg =
      language === 'tr'
        ? 'Ups, bir şeyler yanlış gitti! 😅 Tekrar dene.'
        : language === 'ar'
        ? 'عذرًا، حدث خطأ ما! 😅 حاول مجددًا.'
        : 'Oops, something went wrong! 😅 Try again.';
    await bot.sendMessage(msg.chat.id, errorMsg, { reply_to_message_id: msg.message_id });
  }
});

// Express sunucusunu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot sunucusu ${PORT} portunda çalışıyor...`);
});
