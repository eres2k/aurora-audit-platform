function app() {
  return {
    user: null,
    loginName: '',
    consent: false,
    lang: 'de',
    chart: null,
    stations: [
      { id: 'DVI1', name: 'DVI1 – Wien' },
      { id: 'DVI2', name: 'DVI2 – Wien Liesing' },
      { id: 'DVI3', name: 'DVI3 – Wien Schemmerlstraße' },
      { id: 'DAP5', name: 'DAP5 – Klagenfurt' },
      { id: 'DAP8', name: 'DAP8 – Premstätten bei Graz' }
    ],
    currentStation: 'DVI1',
    checklist: [
      { q: 'ppe', res: '', note: '' },
      { q: 'equipment', res: '', note: '' },
      { q: 'hazards', res: '', note: '' },
      { q: 'ergonomics', res: '', note: '' }
    ],
    issues: [],
    assets: [],
    newAsset: { name: '' },
    translations: {
      de: {
        loginTitle: 'Anmeldung',
        consent: 'Ich stimme der Speicherung von Audits gemäss DSGVO zu.',
        station: 'Station wählen',
        newAudit: 'Neue Prüfung',
        pass: 'Bestanden',
        fail: 'Fehler',
        notes: 'Notizen',
        saveAudit: 'Audit speichern',
        openIssues: 'Offene Mängel',
        noIssues: 'Keine Mängel',
        assignedTo: 'Zugewiesen an',
        resolve: 'Erledigt',
        dashboard: 'Übersicht',
        assets: 'Arbeitsmittel',
        assetName: 'Name des Arbeitsmittels',
        add: 'Hinzufügen',
        dataMgmt: 'Datenspeicherung',
        export: 'Exportieren',
        delete: 'Daten löschen',
        ppe: 'PPE vorhanden und verwendet?',
        equipment: 'Arbeitsmittel sicher?',
        hazards: 'Gefährliche Stoffe bewertet?',
        ergonomics: 'Ergonomie gewährleistet?',
        saved: 'Gespeichert',
        confirmDelete: 'Alle Daten löschen?'
      },
      en: {
        loginTitle: 'Login',
        consent: 'I consent to storing audits according to GDPR.',
        station: 'Select station',
        newAudit: 'New Audit',
        pass: 'Pass',
        fail: 'Fail',
        notes: 'Notes',
        saveAudit: 'Save audit',
        openIssues: 'Open Issues',
        noIssues: 'No issues',
        assignedTo: 'Assigned to',
        resolve: 'Resolve',
        dashboard: 'Dashboard',
        assets: 'Assets',
        assetName: 'Asset name',
        add: 'Add',
        dataMgmt: 'Data management',
        export: 'Export',
        delete: 'Delete data',
        ppe: 'Is PPE available and used?',
        equipment: 'Is equipment safe?',
        hazards: 'Hazardous substances assessed?',
        ergonomics: 'Ergonomics ensured?',
        saved: 'Saved',
        confirmDelete: 'Delete all data?'
      }
    },
    t(key) {
      return this.translations[this.lang][key] || key;
    },
    toggleLang() {
      this.lang = this.lang === 'de' ? 'en' : 'de';
      document.documentElement.lang = this.lang;
      localStorage.setItem('lang', this.lang);
      this.renderChart();
    },
    init() {
      this.user = localStorage.getItem('user');
      this.lang = localStorage.getItem('lang') || 'de';
      document.documentElement.lang = this.lang;
      this.issues = JSON.parse(localStorage.getItem('issues') || '[]');
      this.assets = JSON.parse(localStorage.getItem('assets') || '[]');
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js');
      }
      this.renderChart();
    },
    login() {
      if (this.loginName && this.consent) {
        this.user = this.loginName;
        localStorage.setItem('user', this.user);
        this.renderChart();
      }
    },
    logout() {
      this.user = null;
      localStorage.removeItem('user');
    },
    saveAudit() {
      const audit = {
        station: this.currentStation,
        items: this.checklist.map(i => ({ q: i.q, res: i.res, note: i.note })),
        date: new Date().toISOString()
      };
      const audits = JSON.parse(localStorage.getItem('audits') || '[]');
      audits.push(audit);
      localStorage.setItem('audits', JSON.stringify(audits));
      audit.items.forEach(item => {
        if (item.res === 'fail') {
          this.issues.push({ station: audit.station, question: this.t(item.q), note: item.note, assignee: '' });
        }
      });
      localStorage.setItem('issues', JSON.stringify(this.issues));
      this.renderChart();
      alert(this.t('saved'));
    },
    resolveIssue(i) {
      this.issues.splice(i, 1);
      localStorage.setItem('issues', JSON.stringify(this.issues));
      this.renderChart();
    },
    addAsset() {
      if (this.newAsset.name) {
        this.assets.push({ name: this.newAsset.name });
        this.newAsset.name = '';
        localStorage.setItem('assets', JSON.stringify(this.assets));
      }
    },
    removeAsset(idx) {
      this.assets.splice(idx, 1);
      localStorage.setItem('assets', JSON.stringify(this.assets));
    },
    exportData() {
      const data = {
        audits: JSON.parse(localStorage.getItem('audits') || '[]'),
        issues: this.issues,
        assets: this.assets
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'audit-data.json';
      a.click();
      URL.revokeObjectURL(a.href);
    },
    clearData() {
      if (confirm(this.t('confirmDelete'))) {
        localStorage.clear();
        location.reload();
      }
    },
    renderChart() {
      const ctx = document.getElementById('summaryChart').getContext('2d');
      const audits = JSON.parse(localStorage.getItem('audits') || '[]');
      const labels = this.stations.map(s => s.id);
      const data = labels.map(id => {
        const stationAudits = audits.filter(a => a.station === id);
        if (!stationAudits.length) return 0;
        const total = stationAudits.length * this.checklist.length;
        const passed = stationAudits.reduce((acc, a) => acc + a.items.filter(i => i.res === 'pass').length, 0);
        return Math.round((passed / total) * 100);
      });
      if (this.chart) this.chart.destroy();
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: '% ' + this.t('pass'),
            data,
            backgroundColor: '#1D4ED8'
          }]
        },
        options: {
          scales: {
            y: { beginAtZero: true, max: 100 }
          }
        }
      });
    }
  };
}
