const { Client, GatewayIntentBits } = require('discord.js');
const { ping } = require('minecraft-protocol');

const config = {
    serverIP: 'klasa6W.aternos.me',
    serverPort: 40634,
    channelId: '1430961542781866096',
    refreshInterval: 60000
};

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

let lastStatus = null;

async function checkServerStatus() {
    return new Promise((resolve) => {
        ping({
            host: config.serverIP,
            port: config.serverPort,
            timeout: 10000
        }, (err, response) => {
            if (err) {
                console.log('🔴 Serwer OFFLINE - nie odpowiada');
                resolve({ online: false, players: 0, maxPlayers: 0 });
            } else {
                console.log('🟢 Serwer ONLINE - Gracze:', response.players.online + '/' + response.players.max);
                resolve({
                    online: true,
                    players: response.players.online,
                    maxPlayers: response.players.max
                });
            }
        });
    });
}

async function updateChannelName() {
    try {
        console.log('--- SPRAWDZANIE ---');

        const status = await checkServerStatus();
        const channel = await client.channels.fetch(config.channelId);

        let newChannelName;

        // PROSTA LOGIKA: online = zielony, offline = czerwony
        if (status.online) {
            newChannelName = `🟢・${status.players}・online`;
        } else {
            newChannelName = `🔴・offline`;
        }

        console.log('🏷️ Obecna nazwa:', channel.name);
        console.log('✏️ Nowa nazwa:', newChannelName);

        if (channel.name !== newChannelName) {
            console.log('🔄 Zmieniam nazwę...');
            await channel.setName(newChannelName);
            console.log('✅ Nazwa zmieniona!');
        } else {
            console.log('ℹ️ Nazwa aktualna');
        }

    } catch (error) {
        console.error('❌ BŁĄD:', error.message);
    }
}

client.once('ready', () => {
    console.log('================================');
    console.log(`✅ Bot StatusSerwera#2190 jest online!`);
    console.log(`🎤 Monitoruje kanał głosowy`);
    console.log(`🔄 Aktualizacja co 60 sekund`);
    console.log('================================');

    updateChannelName();
    setInterval(updateChannelName, config.refreshInterval);
});

// Dodaj do kodu - pinguje co 5 minut
setInterval(() => {
    console.log('🏓 Ping - keeping repl alive');
}, 300000);

client.on('messageCreate', async (message) => {
    if (message.content === '!status') {
        const status = await checkServerStatus();

        if (status.online) {
            message.reply(`🟢 **Serwer ONLINE!**\n👥 Gracze: ${status.players}/${status.maxPlayers}`);
        } else {
            message.reply('🔴 **Serwer OFFLINE**');
        }
    }
});

process.removeAllListeners('warning');
client.login('MTQzMDkzMzE2NDg4ODU1OTcyMA.G6ZRuS.UqJWMZxcv_w1ZXBxRmpgO-kzjXn2ZFD0Xrm5fE');
