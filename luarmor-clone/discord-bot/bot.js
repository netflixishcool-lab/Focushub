require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const crypto = require('crypto');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

const API_URL = process.env.API_URL || 'http://localhost:5000';
const ADMIN_DISCORD_ID = process.env.ADMIN_DISCORD_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

/**
 * API Client für Backend Kommunikation
 */
class APIClient {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.token = null;
  }

  /**
   * Login mit Admin-Credentials
   */
  async adminLogin(username, password) {
    try {
      const response = await axios.post(`${this.apiUrl}/auth/login`, {
        username,
        password
      });

      this.token = response.data.token;
      return response.data;
    } catch (error) {
      throw new Error(`Admin login failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * API Request mit Token
   */
  async request(method, endpoint, data = null) {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      };

      const url = `${this.apiUrl}${endpoint}`;

      let response;
      if (method === 'GET') {
        response = await axios.get(url, config);
      } else if (method === 'POST') {
        response = await axios.post(url, data, config);
      } else if (method === 'PUT') {
        response = await axios.put(url, data, config);
      } else if (method === 'DELETE') {
        response = await axios.delete(url, config);
      }

      return response.data;
    } catch (error) {
      throw new Error(`API request failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async createLicenseKey(productName, expiresInDays = null) {
    return this.request('POST', '/api/license/create', {
      product_name: productName,
      expires_in_days: expiresInDays,
      quantity: 1
    });
  }

  async activateLicense(licenseKey, hwid) {
    return this.request('POST', '/api/license/activate', {
      license_key: licenseKey,
      hwid
    });
  }

  async getAdminStats() {
    return this.request('GET', '/api/admin/stats');
  }

  async getAdminUsers() {
    return this.request('GET', '/api/admin/users');
  }

  async getLicenseKeys() {
    return this.request('GET', '/api/license/keys');
  }
}

const api = new APIClient(API_URL);

/**
 * Slash Commands registrieren
 */
async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('license')
      .setDescription('License Management Commands')
      .addSubcommand(subcommand =>
        subcommand
          .setName('create')
          .setDescription('Create a new license key (Admin only)')
          .addStringOption(option =>
            option
              .setName('product')
              .setDescription('Product name')
              .setRequired(true)
          )
          .addIntegerOption(option =>
            option
              .setName('expires_in_days')
              .setDescription('Days until expiration (optional)')
              .setRequired(false)
          )
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('activate')
          .setDescription('Activate a license key')
          .addStringOption(option =>
            option
              .setName('key')
              .setDescription('License key')
              .setRequired(true)
          )
          .addStringOption(option =>
            option
              .setName('hwid')
              .setDescription('Hardware ID (64 character hex string)')
              .setRequired(true)
          )
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('list')
          .setDescription('List all license keys (Admin only)')
      ),

    new SlashCommandBuilder()
      .setName('admin')
      .setDescription('Admin Commands')
      .addSubcommand(subcommand =>
        subcommand
          .setName('stats')
          .setDescription('Get system statistics (Admin only)')
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('users')
          .setDescription('List all users (Admin only)')
      ),

    new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Ping the bot')
  ];

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    await guild.commands.set(commands);
    console.log('✅ Slash commands registered');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
}

/**
 * Event: Bot Ready
 */
client.on('ready', async () => {
  console.log(`\n╔═══════════════════════════════════════╗`);
  console.log(`║  Discord Bot Connected: ${client.user.tag}     ║`);
  console.log(`╚═══════════════════════════════════════╝\n`);

  // Setze Bot Status
  client.user.setActivity('/license - License Management', { type: 'LISTENING' });

  // Registriere Commands
  await registerCommands();
});

/**
 * Event: Slash Command Interaction
 */
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, subcommandName, options, user } = interaction;

  try {
    if (commandName === 'ping') {
      await interaction.reply('🏓 Pong!');
    }

    else if (commandName === 'license') {
      if (subcommandName === 'create') {
        // Admin Check
        if (user.id !== ADMIN_DISCORD_ID) {
          return await interaction.reply({
            content: '❌ Du benötigst Admin-Rechte für diesen Befehl',
            ephemeral: true
          });
        }

        await interaction.deferReply();

        const productName = options.getString('product');
        const expiresInDays = options.getInteger('expires_in_days');

        // Login als Admin
        await api.adminLogin('admin', 'admin123'); // Verwende echte Credentials

        const result = await api.createLicenseKey(productName, expiresInDays);

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ License Key Erstellt')
          .addFields(
            { name: 'Product', value: productName, inline: true },
            { name: 'Key', value: `\`${result.keys[0].key}\``, inline: false },
            { name: 'Expires At', value: result.keys[0].expires_at || 'Never', inline: true }
          )
          .setFooter({ text: 'License Key Management System' })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }

      else if (subcommandName === 'activate') {
        await interaction.deferReply();

        const licenseKey = options.getString('key');
        const hwid = options.getString('hwid');

        // Validiere HWID Format (64 Character Hex)
        if (!/^[A-Fa-f0-9]{64}$/.test(hwid)) {
          return await interaction.editReply({
            content: '❌ Ungültiges HWID Format. Muss 64 Zeichen lang sein.'
          });
        }

        const result = await api.activateLicense(licenseKey, hwid);

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ License Aktiviert')
          .addFields(
            { name: 'Product', value: result.license.product, inline: true },
            { name: 'Activated', value: result.license.activated_at, inline: true },
            { name: 'Expires', value: result.license.expires_at || 'Never', inline: true }
          )
          .setFooter({ text: 'License Key Management System' })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }

      else if (subcommandName === 'list') {
        // Admin Check
        if (user.id !== ADMIN_DISCORD_ID) {
          return await interaction.reply({
            content: '❌ Du benötigst Admin-Rechte für diesen Befehl',
            ephemeral: true
          });
        }

        await interaction.deferReply();

        // Login als Admin
        await api.adminLogin('admin', 'admin123'); // Verwende echte Credentials

        const result = await api.getLicenseKeys();

        let description = '';
        for (const key of result.keys.slice(0, 10)) {
          description += `🔑 **${key.product}** - ${key.key}\n`;
          description += `   Status: ${key.is_active ? '✅ Active' : '❌ Inactive'}\n`;
          description += `   Activated: ${key.activated_by}\n\n`;
        }

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('📋 License Keys')
          .setDescription(description || 'Keine Keys vorhanden')
          .setFooter({ text: `Showing ${Math.min(10, result.keys.length)} of ${result.keys.length}` })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }
    }

    else if (commandName === 'admin') {
      // Admin Check
      if (user.id !== ADMIN_DISCORD_ID) {
        return await interaction.reply({
          content: '❌ Du benötigst Admin-Rechte für diesen Befehl',
          ephemeral: true
        });
      }

      await interaction.deferReply();

      // Login als Admin
      await api.adminLogin('admin', 'admin123'); // Verwende echte Credentials

      if (subcommandName === 'stats') {
        const stats = await api.getAdminStats();

        const embed = new EmbedBuilder()
          .setColor('#ff9900')
          .setTitle('📊 System Statistiken')
          .addFields(
            { name: 'Total Users', value: stats.stats.total_users.toString(), inline: true },
            { name: 'Total License Keys', value: stats.stats.total_license_keys.toString(), inline: true },
            { name: 'Activated Keys', value: stats.stats.activated_keys.toString(), inline: true },
            { name: 'Pending Keys', value: stats.stats.pending_keys.toString(), inline: true },
            { name: 'Total HWIDs', value: stats.stats.total_hwids.toString(), inline: true },
            { name: 'Verified HWIDs', value: stats.stats.verified_hwids.toString(), inline: true },
            { name: 'Activations (24h)', value: stats.stats.activations_last_24h.toString(), inline: true }
          )
          .setFooter({ text: 'System Management' })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }

      else if (subcommandName === 'users') {
        const result = await api.getAdminUsers();

        let description = '';
        for (const user of result.users.slice(0, 10)) {
          description += `👤 **${user.username}** (${user.email})\n`;
          description += `   Status: ${user.is_active ? '✅ Active' : '❌ Inactive'}\n`;
          description += `   Role: ${user.is_admin ? '🔑 Admin' : 'User'}\n\n`;
        }

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('👥 Registered Users')
          .setDescription(description || 'Keine Benutzer vorhanden')
          .setFooter({ text: `Showing ${Math.min(10, result.users.length)} of ${result.users.length}` })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }
    }
  } catch (error) {
    console.error('Command error:', error);
    const errorEmbed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('❌ Fehler')
      .setDescription(`\`\`\`${error.message}\`\`\``)
      .setTimestamp();

    if (interaction.replied) {
      await interaction.editReply({ embeds: [errorEmbed] });
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
});

/**
 * Event: Error Handling
 */
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled rejection:', error);
});

// ============= BOT LOGIN =============
client.login(process.env.DISCORD_BOT_TOKEN);
