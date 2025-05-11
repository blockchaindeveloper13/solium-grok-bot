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

// Tek content - Tüm bilgiler burada
const content = `
Solium Coin (SLM) ile helal finans devrimine katıl! 🌙
Proje: Solium Coin
Website: https://soliumcoin.com
Toplam Arz: 100,000,000 SLM
Presale: 50,000,000 SLM (50%)
Airdrop: 10,000,000 SLM (10%)
Blockchain: Binance Smart Chain (BSC) ve Solana
BSC Contract Address: 0x307a0dc0814CbD64E81a9BC8517441Ca657fB9c7
Solana Contract Address: 9rFLChxL7444pp1ykat7eoaFh76BiLEZNXUvn9Fpump

Tokenomics:
- Presale: 50M SLM (50%)
- Liquidity: 20M SLM (20%)
- Airdrop: 10M SLM (10%)
- Staking: 10M SLM (10%)
- GameFi & Rewards: 10M SLM (10%)

Özellikler:
- %100 Adil Lansman: Takım token’ı yok, dev ücreti yok, özel satış yok.
- Web3 Değerleri: Şeffaflık, merkeziyetsizlik, topluluk odaklı.
- Staking, DAO yönetimi, GameFi genişlemesi ve çapraz zincir köprüsü planlanıyor.
- ABD, Kanada veya OFAC yaptırımlı ülke vatandaşlarına açık değil.

Roadmap:
Q1 – Lansman & Presale
- Token oluşturuldu, akıllı kontrat deploy edildi (Tamamlandı)
- Website, GitHub, Medium, Telegram, X başlatıldı (Tamamlandı)
- Presale başladı (Tamamlandı)
- İlk influencer iş birlikleri
- Topluluk büyümesi

Q2 – Büyüme & Görünürlük
- DEXTools, CoinGecko, CoinMarketCap listelenmeleri
- İlk CEX listelenmesi (Hedef: MEXC veya Bitget)
- Airdrop dağıtımı (10M SLM)
- Topluluk katılımı ve staking Dapp entegrasyonu

Q3 – Genişleme
- Staking lansmanı (10M SLM ayrıldı)
- KuCoin & Binance listelenme hedefleri
- GameFi konsepti tanıtımı
- DAO geliştirme ve köprü araştırması

Q4 – Ekosistem Geliştirme
- GameFi lansmanı, SLM kullanımı
- Gerçek dünya entegrasyonları & uzun vadeli staking
- Kullanım odaklı NFT koleksiyonu
- Global pazarlama ve topluluk genişlemesi

Resmi Linkler:
- Website: https://soliumcoin.com
- Telegram Grup: https://t.me/soliumcoinchat
- Telegram Kanal: https://t.me/soliumcoin
- Twitter/X: https://x.com/soliumcoin
- GitHub: https://github.com/soliumcoin/solium-project
- Medium: https://medium.com/@soliumcoin

Faydalar:
- Hız: Binance Smart Chain ve Solana ile yıldırım hızında işlemler.
- Güvenlik: Gelişmiş şifreleme protokolleri ile fonlar güvende.
- Ölçeklenebilirlik: Yüksek işlem hacimlerini destekleyen sağlam platform.
- Topluluk Odaklı: Projenin gelişimini şekillendiren tutkulu bir topluluk.

Şeffaflık ve Güvenlik:
- Denetlenen Kontratlar: BSC Kontrat Adresi: 0x307a0dc0814CbD64E81a9BC8517441Ca657fB9c7
- Açık Kaynak Kod: GitHub’da mevcut: https://github.com/soliumcoin/solium-project
- Takım Token’ı Yok: Adil token dağıtımı.

Airdrop ve Presale:
- Airdrop: Telegram grubuna katıl (t.me/soliumcoinchat) ve BSC adresini paylaş. Her 7 günde 1M $SLM kazanma şansı!
- Presale: https://soliumcoin.com adresinden MetaMask ile BNB kullanarak $SLM al (1 BNB = 10,000 $SLM). En iyi alıcılar için ödüller:
  - 1.: 1M $SLM
  - 2.: 500K $SLM
  - 3.: 100K $SLM
  - 4.-10.: Ek ödüller!

Solium Coin, blockchain dünyasını devrimleştirmeyi hedefleyen çığır açan bir kripto projesi. Airdrop ve Presale’e katılarak geleceğin parçası ol. Daha fazla bilgi için: https://soliumcoin.com #SoliumCoin #HelalFinans
`;

// Content’i prompt’a göre seçme
function selectContentByContext(prompt) {
  // Grok API hata verirse, content’ten rastgele bir parça seç
  const lines = content.split('\n').filter(line => line.trim() !== '');
  // Prompt’a göre uygun satırları filtrele
  const relevantLines = lines.filter(line => 
    (prompt.toLowerCase().includes('presale') && line.toLowerCase().includes('presale')) ||
    (prompt.toLowerCase().includes('helal') && line.toLowerCase().includes('helal')) ||
    (prompt.toLowerCase().includes('etik') && line.toLowerCase().includes('etik')) ||
    (prompt.toLowerCase().includes('dubai') && line.toLowerCase().includes('dubai')) ||
    (prompt.toLowerCase().includes('bilgi') && line.toLowerCase().includes('solium coin'))
  );
  return relevantLines.length > 0 
    ? relevantLines[Math.floor(Math.random() * relevantLines.length)]
    : lines[Math.floor(Math.random() * lines.length)];
}

// Grok API'den içerik alma
async function getGrokContent(prompt, contextType = 'general') {
  try {
    if (!process.env.GROK_API_KEY) {
      console.warn('GROK_API_KEY eksik, content’ten seçim yapılıyor.');
      return selectContentByContext(prompt);
    }
    const response = await axios.post(
      'https://api.x.ai/grok',
      { 
        prompt: `Aşağıdaki içeriği kullanarak, kullanıcının sorusuna samimi bir tonda, helal finans vurgusu yaparak cevap ver. #SoliumCoin ekle.\n\n${content}\n\nSoru: ${prompt}` 
      },
      { headers: { Authorization: `Bearer ${process.env.GROK_API_KEY}` } }
    );
    const grokContent = response.data.content;
    if (!grokContent || grokContent.length < 10) {
      console.warn('Grok API içeriği geçersiz, content’ten seçim yapılıyor.');
      return selectContentByContext(prompt);
    }
    return grokContent;
  } catch (error) {
    console.error('Grok API hatası:', error.message);
    return selectContentByContext(prompt);
  }
}

// 3 saatte bir otomatik paylaşım
setInterval(async () => {
  try {
    const content = await getGrokContent('Solium Coin için kısa, çarpıcı bir Telegram gönderisi yaz.', 'presale');
    const message = `${content} 🚀 #SoliumCoin #HelalFinans\nDetaylar: https://soliumcoin.com`;
    if (message.length > 4096) {
      console.warn('Mesaj çok uzun, kısaltılıyor.');
      await bot.sendMessage('@soliumcoin', message.substring(0, 4090) + '...');
    } else {
      await bot.sendMessage('@soliumcoin', message);
    }
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
  bot.sendMessage(chatId, 'Solium Coin presale fırsatını kaçırma! 😎\nMetamask cüzdanını hazırla: https://soliumcoin.com');
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
      const grokResponse = await getGrokContent(`Kullanıcı şunu sordu: "${userQuestion}". Solium Coin odaklı, samimi bir cevap ver.`, 'general');
      const reply = `Kanka, işte cevabın: ${grokResponse} 😎\n#SoliumCoin #HelalFinans`;
      if (reply.length > 4096) {
        await bot.sendMessage(chatId, reply.substring(0, 4090) + '...', { reply_to_message_id: msg.message_id });
      } else {
        await bot.sendMessage(chatId, reply, { reply_to_message_id: msg.message_id });
      }
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
