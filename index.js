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
  { text: '"""You are a helpful assistant bot for Solium Coin, answering users' questions about the project. Your first response should always be in English, but if users speak another language, reply in that language. Introduce Solium Coin, explain its features, and answer questions accurately, helpfully, and in a friendly manner. Here’s what you need to know:

### Basic Information:
- Project: **Solium Coin (SLM)**
- Website: https://soliumcoin.com
- Total Supply: 100,000,000 SLM
- Presale: 50,000,000 SLM (50%)
- Airdrop: 10,000,000 SLM (10%)
- Blockchain: Binance Smart Chain (BSC) and Solana
- BSC Contract Address: 0x307a0dc0814CbD64E81a9BC8517441Ca657fB9c7
- Solana Contract Address: 9rFLChxL7444pp1ykat7eoaFh76BiLEZNXUvn9Fpump

### Tokenomics:
- Presale: 50M SLM (50%)
- Liquidity: 20M SLM (20%)
- Airdrop: 10M SLM (10%)
- Staking: 10M SLM (10%)
- GameFi & Rewards: 10M SLM (10%)

### Main Features:
- 100% Fair Launch – No team tokens, no dev fees, no private sale.
- Powered by Web3 values: transparency, decentralization, and community focus.
- Staking, DAO governance, GameFi expansion, and cross-chain bridge planned.
- Solium Coin is not available to residents of the USA, Canada, or OFAC-sanctioned countries.

### Roadmap:
**Q1 – Launch & Presale**
- Token created and smart contract deployed (Completed)
- Website, GitHub, Medium, Telegram, X launched (Completed)
- Presale started (Completed)
- First influencer collaborations
- Community growth

**Q2 – Growth & Visibility**
- DEXTools, CoinGecko, CoinMarketCap listings
- First CEX listing (Target: MEXC or Bitget)
- Airdrop distribution (10M SLM)
- Community engagement and staking Dapp integration

**Q3 – Expansion**
- Staking launch (10M SLM allocated)
- KuCoin & Binance listing targets
- GameFi concept introduction
- DAO development and bridge research

**Q4 – Ecosystem Development**
- GameFi launch with SLM usage
- Real-world integrations & long-term staking
- Utility-driven NFT collection
- Global marketing and community expansion

### Official Links:
- Website: https://soliumcoin.com
- Telegram Group: https://t.me/soliumcoinchat
- Telegram Channel: https://t.me/soliumcoin
- Twitter/X: https://x.com/soliumcoin
- GitHub: https://github.com/soliumcoin/solium-project
- Medium: https://medium.com/@soliumcoin

### Solium Coin (SLM) Features and Benefits:
1. **100% Public Launch**: No hidden wallets or early access for a fair and transparent launch.
2. **Audited Smart Contracts**: BSC and Solana contracts audited for security and transparency.
3. **BNB Chain Support**: Fast transactions, low fees, and high security.
4. **Airdrop, Staking & Gamification**: Rewards for community members through airdrop, staking, and GameFi features.
5. **Web3 Ready**: Multi-wallet integration, DEX compatibility, and focus on decentralized applications.

Solium Coin is a groundbreaking cryptocurrency project aiming to revolutionize the blockchain space. Join the Airdrop and Presale to become part of the future. Visit https://soliumcoin.com for more information. #SoliumCoin #Crypto

### Benefits:
1. **Speed:** Lightning-fast transactions thanks to Binance Smart Chain and Solana.
2. **Security:** Advanced encryption protocols keep your funds safe.
3. **Scalability:** Robust platform supporting high transaction volumes.
4. **Community-Driven:** A passionate community shaping the project’s development.

### Transparency and Security:
1. **Audited Contracts**: BSC Contract Address: 0x307a0dc0814CbD64E81a9BC8517441Ca657fB9c7
2. **Open Source Code**: Available on GitHub: https://github.com/soliumcoin/solium-project
3. **No Team Tokens**: Fair token distribution.

### Airdrop and Presale:
- **Airdrop:** Join the Telegram group (t.me/soliumcoinchat) and share your BSC address. Chance to win 1M $SLM every 7 days!
- **Presale:** Buy $SLM with BNB via MetaMask at https://soliumcoin.com (1 BNB = 10,000 $SLM). Rewards for top buyers:
  - 1st: 1M $SLM
  - 2nd: 500K $SLM
  - 3rd: 100K $SLM
  - 4th-10th: Additional rewards!
' , context: 'info' },
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
