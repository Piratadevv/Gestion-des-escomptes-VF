const express = require('express');
const cors = require('cors');
const XLSX = require('xlsx');
const path = require('path');
const morgan = require('morgan');
const logger = require('./utils/logger');
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de logging avec Morgan et Winston
app.use(morgan('combined', { stream: logger.stream }));

// Middleware pour capturer les détails des requêtes
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    logger.logRequest(req, res, responseTime);
  });
  
  next();
});

// In-memory data storage
// Data already defined above

// Data already defined above

let configurationData = {
  autorisationBancaire: 200000
};

// Routes de base
app.get('/api/configuration', (req, res) => {
  res.json(configurationData);
});

// Route pour gérer les requêtes à /api/undefined - redirection vers /api/escomptes
app.get('/api/undefined', (req, res) => {
  logger.logAction('REDIRECT', 'api', { from: '/api/undefined', to: '/api/escomptes', severity: 'info' });
  
  // Use the current in-memory data store
  const escomptes = [...escomptesData];
  
  res.json({
    escomptes: escomptes,
    total: escomptes.length,
    page: 1,
    limit: 10,
    totalPages: Math.ceil(escomptes.length / 10)
  });
});

// Route pour gérer les requêtes à /api/undefined/kpi - redirection vers /api/dashboard/kpi
app.get('/api/undefined/kpi', (req, res) => {
  logger.logAction('REDIRECT', 'api', { from: '/api/undefined/kpi', to: '/api/dashboard/kpi', severity: 'info' });
  const cumulTotal = escomptesData.reduce((sum, e) => sum + Number(e.montant || 0), 0);
  const autorisation = configurationData.autorisationBancaire || 0;
  const encoursRestant = autorisation - cumulTotal;
  const nombreEscomptes = escomptesData.length;
  const pourcentageUtilisation = autorisation > 0 ? Math.round((cumulTotal / autorisation) * 100) : 0;
  res.json({
    cumulTotal,
    encoursRestant,
    autorisationBancaire: autorisation,
    nombreEscomptes,
    pourcentageUtilisation
  });
});

// Reset endpoints
app.post('/api/configuration/reset', (req, res) => {
  configurationData = { autorisationBancaire: 100000 };
  escomptesData = [...initialEscomptes];
  const cumulTotal = escomptesData.reduce((sum, e) => sum + Number(e.montant || 0), 0);
  res.json({
    configuration: configurationData,
    kpi: {
      cumulTotal,
      encoursRestant: configurationData.autorisationBancaire - cumulTotal,
      autorisationBancaire: configurationData.autorisationBancaire,
      nombreEscomptes: escomptesData.length,
      pourcentageUtilisation: Math.round((cumulTotal / configurationData.autorisationBancaire) * 100)
    }
  });
});

// Route pour gérer les requêtes d'export - redirection vers /api/escomptes/export
app.get('/api/undefined/export', (req, res) => {
  const format = req.query.format || 'excel';
  logger.logAction('REDIRECT', 'export', { from: '/api/undefined/export', to: '/api/escomptes/export', format, severity: 'info' });
  logger.logAction('EXPORT_REQUEST', 'system', { format, severity: 'info' });
  
  // Simuler un fichier d'export
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=export-escomptes-${Date.now()}.xlsx`);
  
  // Normalement, on enverrait un vrai fichier ici
  // Pour le test, on envoie juste un message
  res.status(200).send('Contenu du fichier Excel simulé');
});

// Ajout de la route correcte pour l'export
app.get('/api/escomptes/export', (req, res) => {
  const format = (req.query.format || 'excel').toString();
  const recherche = req.query.recherche?.toString();
  const dateDebut = req.query.dateDebut?.toString();
  const dateFin = req.query.dateFin?.toString();
  const montantMin = req.query.montantMin ? Number(req.query.montantMin) : undefined;
  const montantMax = req.query.montantMax ? Number(req.query.montantMax) : undefined;

  // Use the current in-memory data store to ensure export reflects latest state
   const allEscomptes = [...escomptesData];

  // Apply filters similar to frontend
  let filtered = allEscomptes;
  if (recherche) {
    const q = recherche.toLowerCase();
    filtered = filtered.filter(e => e.libelle.toLowerCase().includes(q));
  }
  if (dateDebut) {
    filtered = filtered.filter(e => e.dateRemise >= dateDebut);
  }
  if (dateFin) {
    filtered = filtered.filter(e => e.dateRemise <= dateFin);
  }
  if (typeof montantMin === 'number' && !Number.isNaN(montantMin)) {
    filtered = filtered.filter(e => e.montant >= montantMin);
  }
  if (typeof montantMax === 'number' && !Number.isNaN(montantMax)) {
    filtered = filtered.filter(e => e.montant <= montantMax);
  }

  // Prepare rows
  const rows = filtered.map(e => ({
    ID: e.id,
    'Date de remise': e.dateRemise,
    Libellé: e.libelle,
    Montant: e.montant,
    'Ordre de saisie': e.ordreSaisie,
    'Date de création': e.dateCreation,
    'Date de modification': e.dateModification
  }));

  if (format === 'csv') {
    // Generate CSV
    const header = Object.keys(rows[0] || { ID: '', 'Date de remise': '', Libellé: '', Montant: '', 'Ordre de saisie': '', 'Date de création': '', 'Date de modification': '' });
    const csvLines = [
      header.join(','),
      ...rows.map(r => header.map(h => String(r[h] ?? '').replace(/"/g, '""')).map(v => /[",\n]/.test(v) ? `"${v}"` : v).join(','))
    ];
    const csvContent = '\uFEFF' + csvLines.join('\n'); // Add BOM for Excel UTF-8 support

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=escomptes_${new Date().toISOString().split('T')[0]}.csv`);
    return res.status(200).send(csvContent);
  }

  // Default: excel
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Escomptes');
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=escomptes_${new Date().toISOString().split('T')[0]}.xlsx`);
  return res.status(200).send(Buffer.from(wbout));
});

app.put('/api/configuration', (req, res) => {
  const { autorisationBancaire } = req.body;
  const value = Number(autorisationBancaire);
  configurationData.autorisationBancaire = !Number.isNaN(value) && value >= 0 ? value : 100000;
  res.json(configurationData);
});

app.post('/api/configuration/validate-autorisation', (req, res) => {
  res.json({ valid: true });
});

app.post('/api/configuration/calculate-impact', (req, res) => {
  const { nouvelleAutorisation } = req.body;
  res.json({
    ancienneAutorisation: 100000,
    nouvelleAutorisation: nouvelleAutorisation || 120000,
    cumulActuel: 75000,
    nouvelEncours: 45000,
    impactPourcentage: 20,
    depassement: false
  });
});

app.get('/api/dashboard/kpi', (req, res) => {
  // Calculs pour les escomptes
  const cumulTotal = escomptesData.reduce((sum, e) => sum + Number(e.montant || 0), 0);
  const nombreEscomptes = escomptesData.length;
  
  // Calculs pour les refinancements
  const cumulRefinancements = refinancementsData.reduce((sum, r) => sum + Number(r.montantRefinance || 0), 0);
  const nombreRefinancements = refinancementsData.length;
  
  // Calculs globaux (escomptes + refinancements)
  const cumulGlobal = cumulTotal + cumulRefinancements;
  const autorisation = configurationData.autorisationBancaire || 0;
  
  // Encours restants
  const encoursRestant = autorisation - cumulTotal;
  const encoursRestantGlobal = autorisation - cumulGlobal;
  
  // Pourcentages d'utilisation
  const pourcentageUtilisation = autorisation > 0 ? Math.round((cumulTotal / autorisation) * 100) : 0;
  const pourcentageUtilisationGlobal = autorisation > 0 ? Math.round((cumulGlobal / autorisation) * 100) : 0;

  res.json({
    // KPIs Escomptes
    cumulTotal,
    encoursRestant,
    nombreEscomptes,
    pourcentageUtilisation,
    
    // KPIs Refinancements
    cumulRefinancements,
    nombreRefinancements,
    
    // KPIs Globaux
    cumulGlobal,
    encoursRestantGlobal,
    pourcentageUtilisationGlobal,
    
    // Configuration
    autorisationBancaire: autorisation
  });
});

// In-memory data store for escomptes so exports reflect current data
const initialEscomptes = [
  {
    id: '1',
    numeroEffet: 'EFF001',
    nomTireur: 'Société ABC',
    montant: 45000.00,
    dateEcheance: '2025-04-15',
    tauxEscompte: 8.5,
    fraisCommission: 450.00,
    montantNet: 44550.00,
    statut: 'ACTIF',
    dateCreation: '2025-01-23T10:00:00.000Z',
    dateModification: '2025-01-23T10:00:00.000Z'
  },
  {
    id: '2',
    numeroEffet: 'EFF002',
    nomTireur: 'Entreprise XYZ',
    montant: 35000.00,
    dateEcheance: '2025-05-20',
    tauxEscompte: 7.2,
    fraisCommission: 350.00,
    montantNet: 34650.00,
    statut: 'ACTIF',
    dateCreation: '2025-01-23T10:00:00.000Z',
    dateModification: '2025-01-23T10:00:00.000Z'
  }
];
let escomptesData = [...initialEscomptes];

// In-memory data store for refinancements
const initialRefinancements = [
  {
    id: '1',
    libelle: 'Refinancement Crédit Immobilier',
    montantRefinance: 60000.00,
    tauxInteret: 10,
    dateRefinancement: '2025-03-09',
    dureeEnMois: 12,
    encoursRefinance: 0.00,
    fraisDossier: 500,
    conditions: 'Garantie hypothécaire requise',
    statut: 'ACTIF',
    totalInterets: 6000,
    ordreSaisie: 1,
    dateCreation: '2025-01-23T10:00:00.000Z',
    dateModification: '2025-01-23T10:00:00.000Z'
  },
  {
    id: '2',
    libelle: 'Refinancement Crédit Auto',
    montantRefinance: 40000.00,
    tauxInteret: 12,
    dateRefinancement: '2025-03-15',
    dureeEnMois: 24,
    encoursRefinance: 0.00,
    fraisDossier: 300,
    conditions: 'Véhicule en garantie',
    statut: 'ACTIF',
    totalInterets: 9600,
    ordreSaisie: 2,
    dateCreation: '2025-01-23T10:00:00.000Z',
    dateModification: '2025-01-23T10:00:00.000Z'
  }
];
let refinancementsData = [...initialRefinancements];

// In-memory logs storage
// Initial logs data with sample entries
const initialLogs = [
  {
    id: 'log_1',
    timestamp: '2025-01-23T10:00:00.000Z',
    action: 'CREATE',
    category: 'escompte',
    severity: 'info',
    message: 'Création d\'un nouvel escompte EFF001 pour Société ABC',
    entityType: 'escompte',
    entityId: '1',
    userId: 'user_1',
    changes: {
      before: null,
      after: {
        numeroEffet: 'EFF001',
        nomTireur: 'Société ABC',
        montant: 15000.00
      }
    },
    metadata: {
      userAgent: 'Mozilla/5.0',
      ip: '127.0.0.1'
    }
  },
  {
    id: 'log_2',
    timestamp: '2025-01-23T10:15:00.000Z',
    action: 'UPDATE',
    category: 'escompte',
    severity: 'info',
    message: 'Modification de l\'escompte EFF002 - Changement du statut',
    entityType: 'escompte',
    entityId: '2',
    userId: 'user_1',
    changes: {
      before: { statut: 'ACTIF' },
      after: { statut: 'SUSPENDU' }
    },
    metadata: {
      userAgent: 'Mozilla/5.0',
      ip: '127.0.0.1'
    }
  },
  {
    id: 'log_3',
    timestamp: '2025-01-23T10:30:00.000Z',
    action: 'CREATE',
    category: 'refinancement',
    severity: 'info',
    message: 'Création d\'un nouveau refinancement - Crédit Immobilier',
    entityType: 'refinancement',
    entityId: '1',
    userId: 'user_1',
    changes: {
      before: null,
      after: {
        libelle: 'Refinancement Crédit Immobilier',
        montantRefinance: 20000.00
      }
    },
    metadata: {
      userAgent: 'Mozilla/5.0',
      ip: '127.0.0.1'
    }
  },
  {
    id: 'log_4',
    timestamp: '2025-01-23T11:00:00.000Z',
    action: 'DELETE',
    category: 'escompte',
    severity: 'warning',
    message: 'Suppression de l\'escompte EFF003',
    entityType: 'escompte',
    entityId: '3',
    userId: 'user_1',
    changes: {
      before: {
        numeroEffet: 'EFF003',
        nomTireur: 'Commerce DEF',
        montant: 8000.00
      },
      after: null
    },
    metadata: {
      userAgent: 'Mozilla/5.0',
      ip: '127.0.0.1'
    }
  },
  {
    id: 'log_5',
    timestamp: '2025-01-23T11:15:00.000Z',
    action: 'LOGIN',
    category: 'auth',
    severity: 'info',
    message: 'Connexion utilisateur réussie',
    entityType: 'user',
    entityId: 'user_1',
    userId: 'user_1',
    changes: null,
    metadata: {
      userAgent: 'Mozilla/5.0',
      ip: '127.0.0.1',
      sessionId: 'sess_123'
    }
  },
  {
    id: 'log_6',
    timestamp: '2025-01-23T11:30:00.000Z',
    action: 'EXPORT',
    category: 'system',
    severity: 'info',
    message: 'Export des données escomptes au format Excel',
    entityType: 'export',
    entityId: 'export_1',
    userId: 'user_1',
    changes: null,
    metadata: {
      format: 'excel',
      recordCount: 3
    }
  }
];

let logsData = [...initialLogs];
app.get('/api/escomptes', (req, res) => {
  logger.info(`GET /api/escomptes - Query: ${JSON.stringify(req.query)}`);
  logger.logAction('info', 'Récupération de la liste des escomptes', {
    action: 'GET_ESCOMPTES',
    filters: req.query,
    totalRecords: escomptesData.length
  });
  
  // Apply very basic filtering if provided
  const { recherche, dateDebut, dateFin, montantMin, montantMax } = req.query;
  let data = [...escomptesData];

  if (recherche) {
    const q = String(recherche).toLowerCase();
    data = data.filter(e => e.libelle.toLowerCase().includes(q));
  }
  if (dateDebut) {
    data = data.filter(e => e.dateRemise >= String(dateDebut));
  }
  if (dateFin) {
    data = data.filter(e => e.dateRemise <= String(dateFin));
  }
  if (montantMin !== undefined) {
    const v = Number(montantMin);
    if (!Number.isNaN(v)) data = data.filter(e => e.montant >= v);
  }
  if (montantMax !== undefined) {
    const v = Number(montantMax);
    if (!Number.isNaN(v)) data = data.filter(e => e.montant <= v);
  }

  const response = {
    escomptes: data,
    total: data.length,
    page: 1,
    limit: 10,
    totalPages: 1
  };
  
  logger.logAction('info', 'Liste des escomptes retournée avec succès', {
    action: 'GET_ESCOMPTES_SUCCESS',
    resultCount: data.length,
    filtersApplied: Object.keys(req.query).length > 0
  });
  
  res.json(response);
});

app.get('/api/escomptes/:id', (req, res) => {
  const { id } = req.params;
  const e = escomptesData.find(x => x.id === id);
  if (!e) {
    logger.logAction('GET_ESCOMPTE_NOT_FOUND', 'escompte', { entityId: id, severity: 'warn' });
    return res.status(404).json({ message: 'Escompte non trouvé' });
  }
  logger.logAction('GET_ESCOMPTE', 'escompte', { entityId: id, severity: 'info' });
  res.json(e);
});

app.post('/api/escomptes', (req, res) => {
  try {
    const { dateRemise, libelle, montant } = req.body;
    const id = (escomptesData.length + 1).toString();
    const now = new Date().toISOString().split('T')[0];
    const e = {
      id,
      dateRemise: dateRemise || now,
      libelle: libelle || `Escompte ${id}`,
      montant: Number(montant) || 0,
      ordreSaisie: escomptesData.length + 1,
      dateCreation: now,
      dateModification: now
    };
    escomptesData.push(e);
    
    logger.logAction('CREATE_ESCOMPTE', 'escompte', {
      entityId: id,
      severity: 'info',
      changes: { before: null, after: e },
      message: `Création d'un nouvel escompte ${libelle || id}`
    });
    
    res.status(201).json(e);
  } catch (error) {
    logger.logError(error, { action: 'CREATE_ESCOMPTE', endpoint: '/api/escomptes' });
    res.status(500).json({ error: 'Erreur lors de la création de l\'escompte' });
  }
});

app.post('/api/undefined', (req, res) => {
  res.json({ message: 'Endpoint simulé' });
});

app.put('/api/escomptes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = escomptesData.findIndex(x => x.id === id);
    if (index === -1) {
      logger.logAction('UPDATE_ESCOMPTE_NOT_FOUND', 'escompte', { entityId: id, severity: 'warn' });
      return res.status(404).json({ message: 'Escompte non trouvé' });
    }
    
    const before = { ...escomptesData[index] };
    const now = new Date().toISOString().split('T')[0];
    escomptesData[index] = { ...escomptesData[index], ...req.body, dateModification: now };
    const after = escomptesData[index];
    
    logger.logAction('UPDATE_ESCOMPTE', 'escompte', {
      entityId: id,
      severity: 'info',
      changes: { before, after },
      message: `Modification de l'escompte ${after.libelle || id}`
    });
    
    res.json(escomptesData[index]);
  } catch (error) {
    logger.logError(error, { action: 'UPDATE_ESCOMPTE', endpoint: '/api/escomptes/:id', entityId: req.params.id });
    res.status(500).json({ error: 'Erreur lors de la modification de l\'escompte' });
  }
});

app.delete('/api/escomptes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = escomptesData.findIndex(x => x.id === id);
    if (index === -1) {
      logger.logAction('DELETE_ESCOMPTE_NOT_FOUND', 'escompte', { entityId: id, severity: 'warn' });
      return res.status(404).json({ message: 'Escompte non trouvé' });
    }
    
    const removed = escomptesData.splice(index, 1);
    const deletedEscompte = removed[0];
    
    logger.logAction('DELETE_ESCOMPTE', 'escompte', {
      entityId: id,
      severity: 'warning',
      changes: { before: deletedEscompte, after: null },
      message: `Suppression de l'escompte ${deletedEscompte.libelle || id}`
    });
    
    res.json(deletedEscompte);
  } catch (error) {
    logger.logError(error, { action: 'DELETE_ESCOMPTE', endpoint: '/api/escomptes/:id', entityId: req.params.id });
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'escompte' });
  }
});

app.post('/api/escomptes/recalculate', (req, res) => {
  // Dummy recalculation endpoint
  res.json({ success: true });
});

// Refinancements API endpoints
app.get('/api/refinancements', (req, res) => {
  res.json({
    refinancements: refinancementsData,
    total: refinancementsData.length,
    page: 1,
    limit: 10,
    totalPages: 1
  });
});

// Export refinancements endpoint (must be before :id route)
app.get('/api/refinancements/export', (req, res) => {
  try {
    const { format = 'xlsx' } = req.query;
    
    // Filter refinancements based on query parameters if needed
    let filteredData = [...refinancementsData];
    
    if (format === 'csv') {
      // Generate CSV
      const headers = ['ID', 'Libellé', 'Montant Refinancé', 'Taux Intérêt (%)', 'Durée (mois)', 'Date Refinancement', 'Encours Refinancé', 'Statut', 'Total Intérêts', 'Date Création'];
      const csvContent = [
        headers.join(','),
        ...filteredData.map(r => [
          r.id,
          r.libelle,
          r.montantRefinance,
          r.tauxInteret,
          r.dureeEnMois,
          r.dateRefinancement,
          r.encoursRefinance,
          r.statut,
          r.totalInterets,
          r.dateCreation
        ].join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="refinancements_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      // Generate Excel file
      const worksheet = XLSX.utils.json_to_sheet(filteredData.map(r => ({
        'ID': r.id,
        'Libellé': r.libelle,
        'Montant Refinancé': r.montantRefinance,
        'Taux Intérêt (%)': r.tauxInteret,
        'Durée (mois)': r.dureeEnMois,
        'Date Refinancement': r.dateRefinancement,
        'Encours Refinancé': r.encoursRefinance,
        'Statut': r.statut,
        'Total Intérêts': r.totalInterets,
        'Date Création': r.dateCreation
      })));
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Refinancements');
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="refinancements_${new Date().toISOString().split('T')[0]}.xlsx"`);
      res.send(buffer);
    }
  } catch (error) {
    console.error('Error exporting refinancements:', error);
    res.status(500).json({ message: 'Erreur lors de l\'export des refinancements' });
  }
});

app.get('/api/refinancements/:id', (req, res) => {
  try {
    const { id } = req.params;
    const refinancement = refinancementsData.find(r => r.id === id);
    
    if (!refinancement) {
      logger.logAction('warning', 'Tentative de récupération d\'un refinancement inexistant', {
        action: 'GET_REFINANCEMENT_NOT_FOUND',
        endpoint: '/api/refinancements/:id',
        refinancementId: id
      });
      return res.status(404).json({ message: 'Refinancement non trouvé' });
    }
    
    logger.logAction('info', 'Récupération d\'un refinancement', {
      action: 'GET_REFINANCEMENT_SUCCESS',
      endpoint: '/api/refinancements/:id',
      refinancementId: id,
      libelle: refinancement.libelle
    });
    
    res.json(refinancement);
  } catch (error) {
    logger.logError(error, 'Erreur lors de la récupération du refinancement', {
      action: 'GET_REFINANCEMENT_ERROR',
      endpoint: '/api/refinancements/:id',
      refinancementId: req.params.id
    });
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/refinancements', (req, res) => {
  try {
    const { libelle, montantRefinance, tauxInteret, dateRefinancement, dureeEnMois, encoursRefinance, fraisDossier, conditions, statut } = req.body;
    const id = (refinancementsData.length + 1).toString();
    const now = new Date().toISOString();
    const totalInterets = (Number(montantRefinance) || 0) * (Number(tauxInteret) || 0) / 100 * (Number(dureeEnMois) || 1) / 12;
    
    const refinancement = {
      id,
      libelle: libelle || `Refinancement ${Date.now()}`,
      montantRefinance: Number(montantRefinance) || 0,
      tauxInteret: Number(tauxInteret) || 0,
      dateRefinancement: dateRefinancement || now.split('T')[0],
      dureeEnMois: Number(dureeEnMois) || 12,
      encoursRefinance: Number(encoursRefinance) || 0,
      fraisDossier: Number(fraisDossier) || 0,
      conditions: conditions || '',
      statut: statut || 'ACTIF',
      totalInterets,
      ordreSaisie: refinancementsData.length + 1,
      dateCreation: now,
      dateModification: now
    };
    
    refinancementsData.push(refinancement);
    
    logger.logAction('info', 'Création d\'un nouveau refinancement', {
      action: 'CREATE_REFINANCEMENT_SUCCESS',
      endpoint: '/api/refinancements',
      refinancementId: id,
      libelle: refinancement.libelle,
      montantRefinance: refinancement.montantRefinance,
      statut: refinancement.statut
    });
    
    res.status(201).json(refinancement);
  } catch (error) {
    logger.logError(error, 'Erreur lors de la création du refinancement', {
      action: 'CREATE_REFINANCEMENT_ERROR',
      endpoint: '/api/refinancements',
      requestBody: req.body
    });
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.put('/api/refinancements/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = refinancementsData.findIndex(r => r.id === id);
    
    if (index === -1) {
      logger.logAction('warning', 'Tentative de modification d\'un refinancement inexistant', {
        action: 'UPDATE_REFINANCEMENT_NOT_FOUND',
        endpoint: '/api/refinancements/:id',
        refinancementId: id
      });
      return res.status(404).json({ message: 'Refinancement non trouvé' });
    }
    
    const originalRefinancement = { ...refinancementsData[index] };
    const now = new Date().toISOString();
    const updatedData = { ...req.body, dateModification: now };
    
    // Recalculate interests if montant, taux or duree changed
    if (updatedData.montantRefinance || updatedData.tauxInteret || updatedData.dureeEnMois) {
      const montant = updatedData.montantRefinance || refinancementsData[index].montantRefinance;
      const taux = updatedData.tauxInteret || refinancementsData[index].tauxInteret;
      const duree = updatedData.dureeEnMois || refinancementsData[index].dureeEnMois;
      updatedData.totalInterets = montant * taux / 100 * duree / 12;
    }
    
    refinancementsData[index] = { ...refinancementsData[index], ...updatedData };
    
    logger.logAction('info', 'Modification d\'un refinancement', {
      action: 'UPDATE_REFINANCEMENT_SUCCESS',
      endpoint: '/api/refinancements/:id',
      refinancementId: id,
      libelle: refinancementsData[index].libelle,
      changes: {
        before: originalRefinancement,
        after: refinancementsData[index]
      }
    });
    
    res.json(refinancementsData[index]);
  } catch (error) {
    logger.logError(error, 'Erreur lors de la modification du refinancement', {
      action: 'UPDATE_REFINANCEMENT_ERROR',
      endpoint: '/api/refinancements/:id',
      refinancementId: req.params.id,
      requestBody: req.body
    });
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.delete('/api/refinancements/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = refinancementsData.findIndex(r => r.id === id);
    
    if (index === -1) {
      logger.logAction('warning', 'Tentative de suppression d\'un refinancement inexistant', {
        action: 'DELETE_REFINANCEMENT_NOT_FOUND',
        endpoint: '/api/refinancements/:id',
        refinancementId: id
      });
      return res.status(404).json({ message: 'Refinancement non trouvé' });
    }
    
    const refinancementToDelete = { ...refinancementsData[index] };
    const removed = refinancementsData.splice(index, 1);
    
    logger.logAction('warning', 'Suppression d\'un refinancement', {
      action: 'DELETE_REFINANCEMENT_SUCCESS',
      endpoint: '/api/refinancements/:id',
      refinancementId: id,
      libelle: refinancementToDelete.libelle,
      montantRefinance: refinancementToDelete.montantRefinance,
      deletedData: refinancementToDelete
    });
    
    res.json(removed[0]);
  } catch (error) {
    logger.logError(error, 'Erreur lors de la suppression du refinancement', {
      action: 'DELETE_REFINANCEMENT_ERROR',
      endpoint: '/api/refinancements/:id',
      refinancementId: req.params.id
    });
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ===== LOGS API ENDPOINTS =====

// GET /api/logs - Récupérer les logs avec pagination et filtres
app.get('/api/logs', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search?.toString() || '';
    const category = req.query.category?.toString();
    const action = req.query.action?.toString();
    const severity = req.query.severity?.toString();
    const entityType = req.query.entityType?.toString();
    const dateStart = req.query.dateStart?.toString();
    const dateEnd = req.query.dateEnd?.toString();

    let filteredLogs = [...logsData];

    // Filtrer par recherche textuelle
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        (log.message || log.description || '').toLowerCase().includes(searchLower) ||
        log.entityType?.toLowerCase().includes(searchLower) ||
        log.entityId?.toLowerCase().includes(searchLower)
      );
    }

    // Filtrer par catégorie
    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    // Filtrer par action
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }

    // Filtrer par sévérité
    if (severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === severity);
    }

    // Filtrer par type d'entité
    if (entityType) {
      filteredLogs = filteredLogs.filter(log => log.entityType === entityType);
    }

    // Filtrer par plage de dates
    if (dateStart) {
      const startDate = new Date(dateStart);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
    }

    if (dateEnd) {
      const endDate = new Date(dateEnd);
      endDate.setHours(23, 59, 59, 999); // Fin de journée
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
    }

    // Trier par timestamp décroissant (plus récent en premier)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    res.json({
      logs: paginatedLogs,
      total: filteredLogs.length,
      page,
      limit,
      totalPages: Math.ceil(filteredLogs.length / limit)
    });
  } catch (error) {
    logger.logError(error, { action: 'GET_LOGS', endpoint: '/api/logs' });
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des logs' });
  }
});

// POST /api/logs - Créer une nouvelle entrée de log
app.post('/api/logs', (req, res) => {
  try {
    const logEntry = {
      id: req.body.id || `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: req.body.timestamp || new Date().toISOString(),
      action: req.body.action,
      category: req.body.category,
      severity: req.body.severity || 'info',
      message: req.body.message || req.body.description,
      description: req.body.description || req.body.message,
      entityType: req.body.entityType || null,
      entityId: req.body.entityId || null,
      userId: req.body.userId || null,
      changes: req.body.changes || null,
      metadata: req.body.metadata || {}
    };

    // Validation des champs requis
    if (!logEntry.action || !logEntry.category || (!logEntry.message && !logEntry.description)) {
      return res.status(400).json({ 
        error: 'Les champs action, category et message/description sont requis' 
      });
    }

    logsData.push(logEntry);

    // Limiter le nombre de logs en mémoire (garder les 10000 plus récents)
    if (logsData.length > 10000) {
      logsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      logsData = logsData.slice(0, 10000);
    }

    res.status(201).json(logEntry);
  } catch (error) {
    logger.logError(error, { action: 'CREATE_LOG', endpoint: '/api/logs' });
    res.status(500).json({ error: 'Erreur serveur lors de la création du log' });
  }
});

// DELETE /api/logs/:id - Supprimer une entrée de log
app.delete('/api/logs/:id', (req, res) => {
  try {
    const id = req.params.id;
    const index = logsData.findIndex(log => log.id === id);
    
    if (index !== -1) {
      logsData.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Log non trouvé' });
    }
  } catch (error) {
    logger.logError(error, { action: 'DELETE_LOG', endpoint: '/api/logs/:id', logId: req.params.id });
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du log' });
  }
});

// DELETE /api/logs - Supprimer tous les logs (avec confirmation)
app.delete('/api/logs', (req, res) => {
  try {
    const confirm = req.query.confirm?.toString();
    
    if (confirm !== 'true') {
      return res.status(400).json({ 
        error: 'Confirmation requise. Ajoutez ?confirm=true pour supprimer tous les logs' 
      });
    }

    const deletedCount = logsData.length;
    logsData = [];
    
    res.json({ 
      success: true, 
      message: `${deletedCount} logs supprimés` 
    });
  } catch (error) {
    logger.logError(error, { action: 'DELETE_ALL_LOGS', endpoint: '/api/logs' });
    res.status(500).json({ error: 'Erreur serveur lors de la suppression des logs' });
  }
});

// GET /api/logs/stats - Statistiques des logs
app.get('/api/logs/stats', (req, res) => {
  try {
    const stats = {
      total: logsData.length,
      byCategory: {},
      byAction: {},
      bySeverity: {},
      byEntityType: {},
      last24Hours: 0,
      lastWeek: 0
    };

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    logsData.forEach(log => {
      const logDate = new Date(log.timestamp);
      
      // Compter par catégorie
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      
      // Compter par action
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
      
      // Compter par sévérité
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
      
      // Compter par type d'entité
      if (log.entityType) {
        stats.byEntityType[log.entityType] = (stats.byEntityType[log.entityType] || 0) + 1;
      }
      
      // Compter les logs récents
      if (logDate >= last24Hours) {
        stats.last24Hours++;
      }
      if (logDate >= lastWeek) {
        stats.lastWeek++;
      }
    });

    res.json(stats);
  } catch (error) {
    logger.logError(error, { action: 'GET_LOG_STATS', endpoint: '/api/logs/stats' });
    res.status(500).json({ error: 'Erreur serveur lors du calcul des statistiques' });
  }
});

// Save complete application state
app.post('/api/save-state', (req, res) => {
  try {
    const { escomptes, refinancements, configuration, metadata } = req.body;
    
    // Validate required fields
    if (!escomptes || !refinancements || !configuration) {
      return res.status(400).json({ 
        message: 'Données manquantes. Les champs escomptes, refinancements et configuration sont requis.' 
      });
    }

    // Update application state
    if (escomptes && Array.isArray(escomptes)) {
      escomptesData = [...escomptes];
    }
    
    if (refinancements && Array.isArray(refinancements)) {
      refinancementsData = [...refinancements];
    }
    
    if (configuration && typeof configuration === 'object') {
      configurationData = { ...configurationData, ...configuration };
    }

    // Create save record with timestamp
    const saveRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      escomptesCount: escomptesData.length,
      refinancementsCount: refinancementsData.length,
      configuration: configurationData,
      metadata: metadata || {},
      totalEscomptes: escomptesData.reduce((sum, e) => sum + (e.montant || 0), 0),
      totalRefinancements: refinancementsData.reduce((sum, r) => sum + (r.montantRefinance || 0), 0)
    };

    console.log(`État de l'application sauvegardé à ${saveRecord.timestamp}:`);
    console.log(`- ${saveRecord.escomptesCount} escomptes (total: ${saveRecord.totalEscomptes}€)`);
    console.log(`- ${saveRecord.refinancementsCount} refinancements (total: ${saveRecord.totalRefinancements}€)`);
    console.log(`- Autorisation bancaire: ${configurationData.autorisationBancaire}€`);

    res.status(200).json({
      message: 'État de l\'application sauvegardé avec succès',
      saveRecord,
      summary: {
        escomptesCount: saveRecord.escomptesCount,
        refinancementsCount: saveRecord.refinancementsCount,
        totalEscomptes: saveRecord.totalEscomptes,
        totalRefinancements: saveRecord.totalRefinancements,
        autorisationBancaire: configurationData.autorisationBancaire
      }
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    res.status(500).json({ 
      message: 'Erreur interne du serveur lors de la sauvegarde',
      error: error.message 
    });
  }
});

// Get current application state
app.get('/api/current-state', (req, res) => {
  try {
    const currentState = {
      escomptes: escomptesData,
      refinancements: refinancementsData,
      configuration: configurationData,
      timestamp: new Date().toISOString(),
      summary: {
        escomptesCount: escomptesData.length,
        refinancementsCount: refinancementsData.length,
        totalEscomptes: escomptesData.reduce((sum, e) => sum + (e.montant || 0), 0),
        totalRefinancements: refinancementsData.reduce((sum, r) => sum + (r.montantRefinance || 0), 0),
        autorisationBancaire: configurationData.autorisationBancaire
      }
    };
    
    res.status(200).json(currentState);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'état:', error);
    res.status(500).json({ 
      message: 'Erreur interne du serveur lors de la récupération de l\'état',
      error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});