postinstall() {
  // Automatisch nach npm install aufgerufen
  console.log('
╔═══════════════════════════════════════════════════════════════╗
║          FocusHub - Installation erfolgreich!                 ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║ Nächste Schritte:                                             ║
║                                                               ║
║ 1. Bearbeite deine Konfiguration:                             ║
║    - backend/.env                                             ║
║    - discord-bot/.env                                         ║
║                                                               ║
║ 2. Starte die Services:                                       ║
║                                                               ║
║    Terminal 1:                                                ║
║    cd backend && npm start                                    ║
║                                                               ║
║    Terminal 2:                                                ║
║    cd frontend && npm run dev                                 ║
║                                                               ║
║    Terminal 3:                                                ║
║    cd discord-bot && npm start                                ║
║                                                               ║
║ 3. Öffne: http://localhost:5173                               ║
║                                                               ║
║ 📖 Siehe QUICKSTART.md für Details                            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  ');
}

module.exports = { postinstall };
