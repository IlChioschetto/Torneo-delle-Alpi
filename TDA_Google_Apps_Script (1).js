// ================================================================
// IL TDA – Torneo delle Alpi · Forlì 2026
// Google Apps Script — Backend per form e dati
//
// ISTRUZIONI:
// 1. Vai su script.google.com → Nuovo progetto
// 2. Incolla tutto questo codice
// 3. Sostituisci l'email qui sotto con la tua
// 4. Clicca Distribuisci → App web → Chiunque → Copia URL
// 5. Incolla l'URL nell'admin (sezione Configurazione)
// ================================================================

const CONFIG = {
  emailNotifica: 'torneodellealpi@gmail.com',   // ← CAMBIA CON LA TUA EMAIL
  nomeFile: 'IL TDA 2026 – Database',
};

// ================================================================
// ENTRY POINT — riceve tutte le richieste POST dal sito
// ================================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const tipo = data.tipo;
    let risultato;

    if (tipo === 'Iscrizione' || tipo === 'Iscrizione Squadra') {
      risultato = gestisciIscrizione(data);
    } else if (tipo === 'Info' || tipo === 'Richiesta Info') {
      risultato = gestisciInfo(data);
    } else if (tipo === 'salva_partita') {
      risultato = salvaPartita(data);
    } else if (tipo === 'salva_classifica') {
      risultato = salvaClassifica(data);
    } else if (tipo === 'salva_calendario') {
      risultato = salvaCalendario(data);
    } else if (tipo === 'salva_pbp') {
      risultato = salvaPbp(data);
    } else if (tipo === 'salva_news') {
      risultato = salvaNews(data);
    } else if (tipo === 'salva_testi') {
      risultato = salvaTesti(data);
    } else {
      risultato = { ok: true, msg: 'Tipo non gestito: ' + tipo };
    }

    return ContentService
      .createTextOutput(JSON.stringify(risultato))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, errore: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Risponde anche a GET (per il test connessione dall'admin)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, msg: 'IL TDA – Script attivo!' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ================================================================
// ISCRIZIONE SQUADRA
// ================================================================
function gestisciIscrizione(data) {
  const sheet = getSheet('Iscrizioni');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Data', 'Squadra', 'Presidente', 'Email', 'Telefono', 'Note', 'Timestamp']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#FFD600');
  }

  sheet.appendRow([
    data.data || new Date().toLocaleString('it-IT'),
    data.squadra || '',
    data.presidente || '',
    data.email || '',
    data.telefono || '',
    data.note || '',
    new Date().toLocaleString('it-IT')
  ]);

  inviaEmail(
    '🆕 Nuova iscrizione TDA – ' + (data.squadra || 'Squadra sconosciuta'),
    'Nuova iscrizione ricevuta!\n\n' +
    'Squadra: ' + (data.squadra || '—') + '\n' +
    'Presidente: ' + (data.presidente || '—') + '\n' +
    'Email: ' + (data.email || '—') + '\n' +
    'Telefono: ' + (data.telefono || '—') + '\n' +
    'Note: ' + (data.note || '—') + '\n\n' +
    'Ricevuta il: ' + new Date().toLocaleString('it-IT')
  );

  return { ok: true, msg: 'Iscrizione salvata' };
}

// ================================================================
// RICHIESTA INFO
// ================================================================
function gestisciInfo(data) {
  const sheet = getSheet('Richieste Info');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Data', 'Nome', 'Email', 'Messaggio', 'Timestamp']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#FFD600');
  }

  sheet.appendRow([
    data.data || new Date().toLocaleString('it-IT'),
    data.nome || '',
    data.email || '',
    data.messaggio || '',
    new Date().toLocaleString('it-IT')
  ]);

  inviaEmail(
    '📩 Nuova richiesta info TDA – ' + (data.nome || 'Utente'),
    'Nuova richiesta info!\n\n' +
    'Nome: ' + (data.nome || '—') + '\n' +
    'Email: ' + (data.email || '—') + '\n' +
    'Messaggio: ' + (data.messaggio || '—') + '\n\n' +
    'Ricevuta il: ' + new Date().toLocaleString('it-IT')
  );

  return { ok: true, msg: 'Richiesta info salvata' };
}

// ================================================================
// RISULTATI PARTITE
// ================================================================
function salvaPartita(data) {
  const sheet = getSheet('Risultati Partite');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Data', 'Girone', 'Casa', 'Gol Casa', 'Gol Ospite', 'Ospite', 'Campo', 'Marcatori', 'MVP', 'Timestamp']);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#FFD600');
  }

  sheet.appendRow([
    data.data || '',
    data.girone || '',
    data.casa || '',
    data.gCasa !== undefined ? data.gCasa : '',
    data.gOsp !== undefined ? data.gOsp : '',
    data.ospite || '',
    data.campo || '',
    data.marcatori || '',
    data.mvp || '',
    new Date().toLocaleString('it-IT')
  ]);

  inviaEmail(
    '⚽ Risultato TDA: ' + (data.casa || '?') + ' ' + data.gCasa + '-' + data.gOsp + ' ' + (data.ospite || '?'),
    'Nuovo risultato inserito!\n\n' +
    (data.casa || '?') + ' ' + data.gCasa + ' - ' + data.gOsp + ' ' + (data.ospite || '?') + '\n' +
    'Girone: ' + (data.girone || '—') + '\n' +
    'Data: ' + (data.data || '—') + '\n' +
    'Campo: ' + (data.campo || '—') + '\n' +
    'Marcatori: ' + (data.marcatori || '—') + '\n' +
    'MVP: ' + (data.mvp || '—')
  );

  return { ok: true, msg: 'Partita salvata' };
}

// ================================================================
// CLASSIFICA
// ================================================================
function salvaClassifica(data) {
  const sheet = getSheet('Classifica Gironi');

  sheet.clearContents();
  sheet.appendRow(['Girone', 'Pos', 'Squadra', 'G', 'V', 'P', 'S', 'GF', 'GS', 'DR', 'Punti', 'Aggiornato']);
  sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#FFD600');

  const classifiche = data.classifica || {};
  ['A', 'B', 'C', 'D'].forEach(function(g) {
    const rows = classifiche[g] || [];
    rows.forEach(function(r, i) {
      const v = r.v || 0, p = r.p || 0;
      const gf = r.gf || 0, gs = r.gs || 0;
      sheet.appendRow([
        'Girone ' + g, i + 1, r.sq || '',
        r.g || 0, v, p, r.s || 0, gf, gs,
        gf - gs, v * 3 + p,
        new Date().toLocaleString('it-IT')
      ]);
    });
  });

  return { ok: true, msg: 'Classifica salvata' };
}

// ================================================================
// CALENDARIO
// ================================================================
function salvaCalendario(data) {
  const sheet = getSheet('Calendario');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Fase', 'Girone', 'Data', 'Ora', 'Squadra 1', 'Squadra 2', 'Campo', 'Timestamp']);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#FFD600');
  }

  sheet.appendRow([
    data.fase || '', data.girone || '', data.data || '',
    data.ora || '', data.sq1 || '', data.sq2 || '',
    data.campo || '', new Date().toLocaleString('it-IT')
  ]);

  return { ok: true, msg: 'Calendario aggiornato' };
}

// ================================================================
// PBP
// ================================================================
function salvaPbp(data) {
  const sheet = getSheet('Classifica PBP');

  sheet.clearContents();
  sheet.appendRow(['Posizione', 'Squadra', 'Presidente', 'Punti PBP', 'Aggiornato']);
  sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#FFD600');

  const pbp = data.pbp || [];
  pbp.forEach(function(r, i) {
    sheet.appendRow([i + 1, r.sq || '', r.pres || '', r.punti || 0, new Date().toLocaleString('it-IT')]);
  });

  return { ok: true, msg: 'PBP salvato' };
}

// ================================================================
// NEWS
// ================================================================
function salvaNews(data) {
  const sheet = getSheet('News');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Data', 'Categoria', 'Titolo', 'Descrizione', 'Testo', 'Timestamp']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#FFD600');
  }

  sheet.appendRow([
    data.data || '', data.cat || '', data.tit || '',
    data.desc || '', data.testo || '',
    new Date().toLocaleString('it-IT')
  ]);

  return { ok: true, msg: 'News salvata' };
}

// ================================================================
// TESTI & CONTATTI
// ================================================================
function salvaTesti(data) {
  const sheet = getSheet('Testi e Contatti');

  sheet.clearContents();
  sheet.appendRow(['Campo', 'Valore', 'Aggiornato']);
  sheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#FFD600');

  ['nomeEvento','edizione','data','luogo','descrizione','email','whatsapp','instagram','facebook','indirizzo'].forEach(function(campo) {
    sheet.appendRow([campo, data[campo] || '', new Date().toLocaleString('it-IT')]);
  });

  return { ok: true, msg: 'Testi salvati' };
}

// ================================================================
// UTILITY — Ottieni o crea foglio nel Google Sheet
// ================================================================
function getSheet(nome) {
  let ss;
  const files = DriveApp.getFilesByName(CONFIG.nomeFile);

  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(CONFIG.nomeFile);
  }

  let sheet = ss.getSheetByName(nome);
  if (!sheet) {
    sheet = ss.insertSheet(nome);
  }

  return sheet;
}

// ================================================================
// UTILITY — Invia email di notifica
// ================================================================
function inviaEmail(oggetto, corpo) {
  try {
    MailApp.sendEmail({
      to: CONFIG.emailNotifica,
      subject: oggetto,
      body: corpo + '\n\n---\nIL TDA – Torneo delle Alpi · Forlì 2026'
    });
  } catch (e) {
    Logger.log('Errore invio email: ' + e.toString());
  }
}
