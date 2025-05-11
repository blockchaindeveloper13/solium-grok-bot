// Bağımlılıkları yükle
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

// Express ve bot ayarları
const app = express();
app.use(express.json()); // Webhook için JSON isteklerini işle

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('HATA: TELEGRAM_BOT_TOKEN tanımlı değil!');
  process.exit(1);
}
const bot = new TelegramBot(token);

// Bot kimliğini önbelleğe al
let botId = null;
bot.getMe().then((botInfo) => {
  botId = botInfo.id;
  console.log(`Bot kimliği alındı: ${botId}`);
}).catch((error) => {
  console.error('Bot kimliği alınamadı:', error.message);
});

// Heroku app URL'si ve webhook ayarı
const HEROKU_APP_NAME = process.env.HEROKU_APP_NAME || 'solium-grok-bot-741701423e96'; // Fallback
const webhookUrl = `https://${HEROKU_APP_NAME}.herokuapp.com/bot${token}`;
console.log(`Webhook URL’si: ${webhookUrl}`);
bot.setWebHook(webhookUrl).then(() => {
  console.log(`Webhook başarıyla ayarlandı: ${webhookUrl}`);
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

// Genel sorular için samimi fallback yanıtlar
const casualResponses = [
  'Kanka, naber! 😎 Solium Coin’le helal finans devrimine hazır mısın? Sor bakalım, ne konuşalım!',
  'İyiyim kanka, sen nasılsın? 😄 Presale’e bi göz attın mı, fırsat kaçmaz ha!',
  'Hadi kanka, ne sorcan? Solium Coin’in helal finans dünyasında her şey bende! 🚀',
  'Kanka, keyfim yerinde! 😎 Solium Coin’le geleceği inşa ediyoruz, sen de gel! Ne dersin?',
];

// Content’i prompt’a göre seçme
function selectContentByContext(prompt) {
  console.log(`Content seçiliyor, prompt: ${prompt}`);
  // Genel sorular için samimi yanıt
  if (prompt.toLowerCase().includes('naber') || 
      prompt.toLowerCase().includes('nasılsın') || 
      prompt.toLowerCase().includes('iyi misin') || 
      prompt.toLowerCase().includes('ne haber')) {
    const casual = casualResponses[Math.floor(Math.random() * casualResponses.length)];
    console.log(`Samimi yanıt seçildi: ${casual}`);
    return casual;
  }

  // Anahtar kelimelere göre satır seçimi
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const relevantLines = lines.filter(line => 
    (prompt.toLowerCase().includes('presale') && line.toLowerCase().includes('presale')) ||
    (prompt.toLowerCase().includes('helal') && line.toLowerCase().includes('helal')) ||
    (prompt.toLowerCase().includes('etik') && line.toLowerCase().includes('etik')) ||
    (prompt.toLowerCase().includes('dubai') && line.toLowerCase().includes('dubai')) ||
    (prompt.toLowerCase().includes('bilgi') && line.toLowerCase().includes('solium coin'))
  );
  const selected = relevantLines.length > 0 
    ? relevantLines[Math.floor(Math.random() * relevantLines.length)]
    : 'Kanka, Solium Coin’le helal finans devrimine katıl! 😎 Daha fazla bilgi için: https://soliumcoin.com';
  console.log(`Seçilen content: ${selected}`);
  return selected;
}

// Grok API'den içerik alma
async function getGrokContent(prompt, contextType = 'general') {
  console.log(`Grok API çağrılıyor, prompt: ${prompt}, context: ${contextType}`);
  try {
    if (!process.env.GROK_API_KEY) {
      console.warn('GROK_API_KEY eksik, content’ten seçim yapılıyor.');
      return selectContentByContext(prompt);
    }
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      { 
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: `Sen Solium Coin’in samimi ve bilgilendirici asistanısın. Kullanıcı sorularına aşağıdaki içeriği kullanarak, helal finans vurgusu yaparak, samimi ve doğal bir tonda cevap ver. #SoliumCoin ekle.\n\n${content}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      },
      { headers: { Authorization: `Bearer ${process.env.GROK_API_KEY}` } }
    );
    const grokContent = response.data.choices[0].message.content;
    if (!grokContent || grokContent.length < 10) {
      console.warn('Grok API içeriği geçersiz, content’ten seçim yapılıyor.');
      return selectContentByContext(prompt);
    }
    console.log(`Grok API cevabı: ${grokContent}`);
    return grokContent;
  } catch (error) {
    console.error('Grok API hatası:', error.message);
    return selectContentByContext(prompt);
  }
}

// 3 saatte bir otomatik paylaşım
setInterval(async () => {
  try {
    console.log('Otomatik paylaşım başlıyor...');
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
  console.log('Webhook isteği alındı:', JSON.stringify(req.body));
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Kök route (H81 hatalarını azaltmak için)
app.get('/', (req, res) => {
  res.send('Solium Moon Bot çalışıyor!');
});

// Komut: /start
bot.onText(/\/start/, (msg) => {
  console.log(`Komut alındı: /start, chatId: ${msg.chat.id}, chatType: ${msg.chat.type}`);
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Kanka, Solium Moon Bot’a hoş geldin! 🌙\nSolium Coin’le helal finans devrimine katıl!\nKomutlar için /help yaz.');
});

// Komut: /presale
bot.onText(/\/presale/, (msg) => {
  console.log(`Komut alındı: /presale, chatId: ${msg.chat.id}, chatType: ${msg.chat.type}`);
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Solium Coin presale fırsatını kaçırma! 😎\nMetamask cüzdanını hazırla: https://soliumcoin.com');
});

// Komut: /help
bot.onText(/\/help/, (msg) => {
  console.log(`Komut alındı: /help, chatId: ${msg.chat.id}, chatType: ${msg.chat.type}`);
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Solium Moon Bot komutları:\n/start - Başla\n/presale - Presale detayları\n/help - Bu mesaj\n\nBotun mesajlarını alıntılayarak Grok’a soru sorabilirsin! 🚀');
});

// Alıntı mesajla Grok’u tetikleme
bot.on('message', async (msg) => {
  console.log(`Mesaj alındı: chatId: ${msg.chat.id}, chatType: ${msg.chat.type}, text: ${msg.text}, from: ${msg.from.id}`);
  const chatId = msg.chat.id;

  // Botun kendi mesajlarını ve komutları yoksay
  if (!botId) {
    console.error('Bot kimliği henüz alınmadı, mesaj işlenemiyor.');
    return;
  }
  if (msg.from.id === botId || msg.text?.startsWith('/')) {
    console.log('Botun kendi mesajı veya komut, yoksayılıyor.');
    return;
  }

  // Alıntı mesaj varsa ve botun mesajına yanıt ise
  if (msg.reply_to_message && msg.reply_to_message.from.id === botId) {
    console.log('Alıntı mesaj tespit edildi:', JSON.stringify(msg.reply_to_message));
    const userQuestion = msg.text || 'Sorun ne kanka?';
    try {
      const grokResponse = await getGrokContent(`Kullanıcı şunu sordu: "${userQuestion}". Solium Coin odaklı, samimi bir cevap ver.`, 'general');
      const reply = `${grokResponse} 😎\n#SoliumCoin #HelalFinans`;
      if (reply.length > 4096) {
        console.warn('Yanıt çok uzun, kısaltılıyor.');
        await bot.sendMessage(chatId, reply.substring(0, 4090) + '...', { reply_to_message_id: msg.message_id });
      } else {
        await bot.sendMessage(chatId, reply, { reply_to_message_id: msg.message_id });
      }
      console.log(`Grok cevabı gönderildi: ${reply}`);
    } catch (error) {
      console.error('Grok tetikleme hatası:', error.message);
      await bot.sendMessage(chatId, 'Ups, bir şeyler yanlış gitti! 😅 Tekrar dene.', { reply_to_message_id: msg.message_id });
    }
  } else {
    console.log('Alıntı mesaj değil veya botun mesajına yanıt değil.');
  }
});

// Express sunucusunu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot sunucusu ${PORT} portunda çalışıyor...`);
});
