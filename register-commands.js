import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const commands = [
  {
    name: 'redeem',
    description: 'Löst einen License Key ein',
    options: [
      {
        name: 'key',
        type: 3, // STRING
        description: 'Dein License Key',
        required: true
      }
    ]
  },
  {
    name: 'status',
    description: 'Zeigt den Systemstatus'
  },
  {
    name: 'myinfo',
    description: 'Zeigt deine Benutzerinformationen'
  },
  {
    name: 'info',
    description: 'Zeigt alle verfügbaren Commands'
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log('📝 Registriere Slash-Commands...');
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Slash-Commands erfolgreich registriert!');
  } catch (error) {
    console.error('❌ Fehler beim Registrieren:', error);
    process.exit(1);
  }
})();
