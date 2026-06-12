import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages
  ]
});

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const PUBLIC_API_URL = process.env.PUBLIC_API_URL || 'https://focushub-production-145e.up.railway.app/api';

// Hilfsfunktion: Script als DM in 1900-Char-Chunks senden
async function sendScriptToUser(user, scriptContent) {
  if (!user) return;
  try {
    const max = 1900;
    if (!scriptContent) return;
    if (scriptContent.length <= max) {
      await user.send({ content: '```lua\n' + scriptContent + '\n```' }).catch(() => {});
      return;
    }

    for (let i = 0; i < scriptContent.length; i += max) {
      const chunk = scriptContent.slice(i, i + max);
      await user.send({ content: '```lua\n' + chunk + '\n```' }).catch(() => {});
    }
  } catch (err) {
    // ignore DM errors (user may have DMs disabled)
  }
}
client.on('ready', () => {
  console.log(`✓ Discord Bot eingeloggt als ${client.user.tag}`);
  client.user.setActivity('FocusHub Admin Panel', { type: 'WATCHING' });
});

// Slash-Commands Handler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;

  try {
    // /redeem <key>
    if (commandName === 'redeem') {
      const key = options.getString('key');
      
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🔐 Key Einlösung läuft...')
        .setDescription('Verarbeite deinen Key...');
      
      await interaction.reply({ embeds: [embed] });
      
      try {
        const response = await axios.post(`${API_URL}/keys/redeem`, {
          key: key,
          discordId: interaction.user.id,
          discordTag: interaction.user.tag,
          discordAvatar: interaction.user.displayAvatarURL({ size: 128, extension: 'png' })
        });
        
        // Script-Loader-Code (kleiner, sauberer Code)
        const scriptKey = response.data.script.scriptKey;
        const loaderCode = `script_key="${scriptKey}";\nloadstring(game:HttpGet("${PUBLIC_API_URL}/files/loader.lua?key=${scriptKey}"))()`;

        const successEmbed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✓ Key erfolgreich eingelöst!')
          .addFields(
            { name: '📝 Benutzer', value: response.data.discordTag, inline: true },
            { name: '⏰ Verfällsdatum', value: new Date(response.data.expiresAt).toLocaleDateString('de-DE'), inline: true },
            { name: '📋 Script Key', value: `\`${scriptKey}\``, inline: false },
            { name: '🧾 Loader Code (Execute im Roblox Executor)', value: '```lua\n' + loaderCode + '\n```', inline: false }
          )
          .setFooter({ text: 'Kopiere den Code oben und füge ihn im Roblox Executor ein.' })
          .setTimestamp();

        await interaction.editReply({ embeds: [successEmbed] });
      } catch (error) {
        console.error('Redeem Error:', error.response?.data || error.message);
        const errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('✗ Fehler beim Einlösen')
          .setDescription(error.response?.data?.message || 'Ungültiger oder bereits verwendeter Key')
          .setTimestamp();
        
        try {
          await interaction.editReply({ embeds: [errorEmbed] });
        } catch (replyErr) {
          console.error('Reply Edit Error:', replyErr.message);
        }
      }
    }

    // /status
    if (commandName === 'status') {
      try {
        const response = await axios.get(`${API_URL}/dashboard/stats`);
        
        const statsEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('📊 System Status')
          .addFields(
            { name: 'Aktive Benutzer', value: response.data.activeUsers.toString(), inline: true },
            { name: 'Gesamt Keys', value: response.data.totalKeys.toString(), inline: true },
            { name: 'Eingelöste Keys', value: response.data.redeemedKeys.toString(), inline: true },
            { name: 'Verfügbare Keys', value: response.data.availableKeys.toString(), inline: true }
          )
          .setTimestamp();
        
        await interaction.reply({ embeds: [statsEmbed] });
      } catch (error) {
        await interaction.reply({ content: '✗ Fehler beim Abrufen der Statistiken', ephemeral: true });
      }
    }

    // /myinfo
    if (commandName === 'myinfo') {
      try {
        const response = await axios.get(`${API_URL}/users/discord/${interaction.user.id}`);
        
        if (response.data) {
          const userEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('👤 Deine Account Informationen')
            .addFields(
              { name: 'Username', value: response.data.username, inline: true },
              { name: 'Status', value: response.data.isActive ? '✓ Aktiv' : '✗ Inaktiv', inline: true },
              { name: 'Verfällsdatum', value: response.data.expiresAt ? new Date(response.data.expiresAt).toLocaleDateString('de-DE') : 'Keine Lizenz', inline: true }
            )
            .setTimestamp();
          
          await interaction.reply({ embeds: [userEmbed], ephemeral: true });
        } else {
          await interaction.reply({ content: '✗ Account nicht gefunden. Löse einen Key ein!', ephemeral: true });
        }
      } catch (error) {
        await interaction.reply({ content: '✗ Fehler beim Abrufen deiner Informationen', ephemeral: true });
      }
    }

    // /info
    if (commandName === 'info') {
      const infoEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('ℹ️ FocusHub Admin Panel Befehle')
        .addFields(
          { name: '/redeem <key>', value: 'Löse einen Key ein', inline: false },
          { name: '/status', value: 'Zeige Systemstatus', inline: false },
          { name: '/myinfo', value: 'Zeige deine Account-Informationen', inline: false },
          { name: '/info', value: 'Zeige diese Hilfe', inline: false }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
    }
  } catch (error) {
    console.error('Slash-Command Fehler:', error);
    await interaction.reply({ content: '✗ Ein Fehler ist aufgetreten', ephemeral: true }).catch(() => {});
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  try {
    // !redeem <key>
    if (message.content.startsWith('!redeem ')) {
      const key = message.content.slice(8).trim();
      
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🔐 Key Einlösung läuft...')
        .setDescription('Verarbeite deinen Key...');
      
      const reply = await message.reply({ embeds: [embed] });
      
      try {
        const response = await axios.post(`${API_URL}/keys/redeem`, {
          key: key,
          discordId: message.author.id,
          discordTag: message.author.tag,
          discordAvatar: message.author.displayAvatarURL({ size: 128, extension: 'png' })
        });
        
        const successEmbed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✓ Key erfolgreich eingelöst!')
          .addFields(
            { name: 'Benutzer', value: response.data.user.username, inline: true },
            { name: 'Verfällsdatum', value: new Date(response.data.user.expiresAt).toLocaleDateString('de-DE'), inline: true }
          )
          .setTimestamp();
        
        await reply.edit({ embeds: [successEmbed] });

        // Falls das Backend Script liefert, sende es per DM ebenfalls
        const scriptContent = response.data.script?.scriptContent || '';
        const preview = scriptContent.length > 600 ? scriptContent.slice(0,600) + '...' : scriptContent;
        if (preview) {
          const previewEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🧾 Script (Vorschau)')
            .addFields({ name: 'Script (kurz)', value: '```lua\n' + preview + '\n```' });
          await message.author.send({ embeds: [previewEmbed] }).catch(() => {});
          await sendScriptToUser(message.author, scriptContent);
        } else {
          await message.author.send({ embeds: [successEmbed] }).catch(() => {});
        }
      } catch (error) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('✗ Fehler beim Einlösen')
          .setDescription(error.response?.data?.message || 'Ungültiger oder bereits verwendeter Key')
          .setTimestamp();
        
        await reply.edit({ embeds: [errorEmbed] });
      }
    }

    // !status
    if (message.content === '!status') {
      try {
        const response = await axios.get(`${API_URL}/dashboard/stats`);
        
        const statsEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('📊 System Status')
          .addFields(
            { name: 'Aktive Benutzer', value: response.data.activeUsers.toString(), inline: true },
            { name: 'Gesamt Keys', value: response.data.totalKeys.toString(), inline: true },
            { name: 'Eingelöste Keys', value: response.data.redeemedKeys.toString(), inline: true },
            { name: 'Verfügbare Keys', value: response.data.availableKeys.toString(), inline: true }
          )
          .setTimestamp();
        
        await message.reply({ embeds: [statsEmbed] });
      } catch (error) {
        await message.reply('✗ Fehler beim Abrufen der Statistiken');
      }
    }

    // !myinfo
    if (message.content === '!myinfo') {
      try {
        const response = await axios.get(`${API_URL}/users/discord/${message.author.id}`);
        
        if (response.data) {
          const userEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('👤 Deine Account Informationen')
            .addFields(
              { name: 'Username', value: response.data.username, inline: true },
              { name: 'Status', value: response.data.isActive ? '✓ Aktiv' : '✗ Inaktiv', inline: true },
              { name: 'Verfällsdatum', value: response.data.expiresAt ? new Date(response.data.expiresAt).toLocaleDateString('de-DE') : 'Keine Lizenz', inline: true }
            )
            .setTimestamp();
          
          await message.reply({ embeds: [userEmbed], ephemeral: true }).catch(async () => {
            await message.reply({ embeds: [userEmbed] });
          });
        } else {
          await message.reply('✗ Account nicht gefunden. Löse einen Key ein!');
        }
      } catch (error) {
        await message.reply('✗ Fehler beim Abrufen deiner Informationen');
      }
    }

    // !info
    if (message.content === '!info') {
      const infoEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('ℹ️ FocusHub Admin Panel Befehle')
        .addFields(
          { name: '!redeem <key>', value: 'Löse einen Key ein', inline: false },
          { name: '!status', value: 'Zeige Systemstatus', inline: false },
          { name: '!myinfo', value: 'Zeige deine Account-Informationen', inline: false },
          { name: '!info', value: 'Zeige diese Hilfe', inline: false }
        )
        .setTimestamp();
      
      await message.reply({ embeds: [infoEmbed] });
    }
  } catch (error) {
    console.error('Discord Bot Fehler:', error);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);