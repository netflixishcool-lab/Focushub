import express from 'express';
import Project from '../models/Project.js';
import RobloxScript from '../models/RobloxScript.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET: Download Script für Roblox Executor
router.get('/download/:scriptKey', async (req, res) => {
  try {
    const { scriptKey } = req.params;

    const script = await RobloxScript.findOne({ scriptKey });

    if (!script) {
      return res.status(404).json({ message: 'Script nicht gefunden' });
    }

    if (!script.isActive) {
      return res.status(403).json({ message: 'Script ist deaktiviert' });
    }

    // Prüfe ob Script abgelaufen ist
    if (script.expiresAt && new Date() > script.expiresAt) {
      return res.status(403).json({ message: 'Script ist abgelaufen' });
    }

    // Update usage count
    script.usageCount += 1;
    script.lastUsed = new Date();
    await script.save();

    // Rückgabe als Lua-Script für Roblox
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${scriptKey}.lua"`);
    res.send(script.scriptContent);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Script hochladen (Admin)
router.post('/upload', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, scriptContent, projectId } = req.body;

    if (!name || !scriptContent) {
      return res.status(400).json({ message: 'Name und Script-Inhalt erforderlich' });
    }

    const project = new Project({
      name,
      description,
      scriptContent,
      owner: req.user._id,
      isPublic: true
    });

    await project.save();

    res.status(201).json({
      message: 'Script erfolgreich hochgeladen',
      project
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Alle Projekte (Admin: alle, sonst nur public)
router.get('/projects', protect, adminOnly, async (req, res) => {
  try {
    const projects = await Project.find({})
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Ein Projekt
router.get('/projects/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Projekt nicht gefunden' });
    }

    if (!project.isPublic && (!req.user || project.owner.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Zugriff verweigert' });
    }

    // Increment downloads
    project.downloads += 1;
    await project.save();

    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Projekt erstellen (Admin)
router.post('/projects', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, scriptContent, category, isPublic } = req.body;

    if (!name || !scriptContent) {
      return res.status(400).json({ message: 'Name und Script-Inhalt erforderlich' });
    }

    const project = new Project({
      name,
      description,
      scriptContent,
      category,
      isPublic: isPublic || false,
      owner: req.user._id
    });

    await project.save();

    res.status(201).json({
      message: 'Projekt erfolgreich erstellt',
      project
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT: Projekt bearbeiten (Admin)
router.put('/projects/:projectId', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, scriptContent, category, isPublic, isActive } = req.body;

    let project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Projekt nicht gefunden' });
    }

    // Nur Owner kann bearbeiten
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Nur der Ersteller kann dieses Projekt bearbeiten' });
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (scriptContent) project.scriptContent = scriptContent;
    if (category) project.category = category;
    if (typeof isPublic === 'boolean') project.isPublic = isPublic;
    if (typeof isActive === 'boolean') project.isActive = isActive;
    project.lastModified = new Date();

    await project.save();

    res.json({
      message: 'Projekt aktualisiert',
      project
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE: Projekt löschen (Admin)
router.delete('/projects/:projectId', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Projekt nicht gefunden' });
    }

    // Nur Owner kann löschen
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Nur der Ersteller kann dieses Projekt löschen' });
    }

    await Project.deleteOne({ _id: req.params.projectId });

    res.json({ message: 'Projekt gelöscht' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
