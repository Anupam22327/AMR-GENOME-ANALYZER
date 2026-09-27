/**
 * AMR-GENOME ANALYZER - Core Application Engine & State Manager
 * Shared application utilities, local storage synchronization, UI helpers.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'AMR_ANALYZER_STATE_V1';

  // State Singleton
  window.AMRState = {
    // Current Active Genome
    genome: null,
    // Active AMR genes detected
    genes: [],
    // Active mutations detected
    mutations: [],
    // Current active selection
    selectedGene: null,
    selectedMutation: null,
    // Analysis metadata
    analysisDate: null,
    sampleName: 'AMR_REF_DEMO_01',
    isDemo: true,

    // Initialize state from Storage or Default Sample Data
    init() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          this.genome = parsed.genome;
          this.genes = parsed.genes || [];
          this.mutations = parsed.mutations || [];
          this.selectedGene = parsed.selectedGene || (this.genes.length > 0 ? this.genes[0] : null);
          this.selectedMutation = parsed.selectedMutation || (this.mutations.length > 0 ? this.mutations[0] : null);
          this.analysisDate = parsed.analysisDate || new Date().toISOString();
          this.sampleName = parsed.sampleName || 'Sample_01';
          this.isDemo = parsed.isDemo !== undefined ? parsed.isDemo : true;
          return;
        } catch (e) {
          console.warn('Could not parse stored AMR state, resetting to demo.', e);
        }
      }
      this.loadDemo();
    },

    save() {
      try {
        const payload = {
          genome: this.genome,
          genes: this.genes,
          mutations: this.mutations,
          selectedGene: this.selectedGene,
          selectedMutation: this.selectedMutation,
          analysisDate: this.analysisDate || new Date().toISOString(),
          sampleName: this.sampleName,
          isDemo: this.isDemo
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn('LocalStorage save failed (possible quota limit)', err);
      }
    },

    loadDemo(redirect = false) {
      if (!window.SampleData) {
        console.error('SampleData module not loaded yet.');
        return;
      }
      const seq = window.SampleData.sequence;
      const header = window.SampleData.header;
      const stats = this.computeGenomeStats(seq, header);

      this.genome = stats;
      this.genes = window.SampleData.getGenes();
      this.mutations = window.SampleData.getMutations();
      this.selectedGene = this.genes[0];
      this.selectedMutation = this.mutations[0];
      this.analysisDate = new Date().toISOString();
      this.sampleName = 'AMR_REF_DEMO_01 (Klebsiella MDR Demo)';
      this.isDemo = true;
      this.save();

      AMRUI.showToast('Demo dataset loaded successfully!', 'success');

      if (redirect) {
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 300);
      }
    },

    computeGenomeStats(rawSequence, rawHeader) {
      const cleanSeq = (rawSequence || '').toUpperCase().replace(/[^ATGCN]/g, '');
      const len = cleanSeq.length || 0;

      let aCount = 0, tCount = 0, gCount = 0, cCount = 0, nCount = 0;
      for (let i = 0; i < len; i++) {
        const char = cleanSeq[i];
        if (char === 'A') aCount++;
        else if (char === 'T') tCount++;
        else if (char === 'G') gCount++;
        else if (char === 'C') cCount++;
        else if (char === 'N') nCount++;
      }

      const gcCount = gCount + cCount;
      const atCount = aCount + tCount;
      const gcPercent = len > 0 ? ((gcCount / len) * 100).toFixed(2) : 0;
      const atPercent = len > 0 ? ((atCount / len) * 100).toFixed(2) : 0;
      const nPercent = len > 0 ? ((nCount / len) * 100).toFixed(2) : 0;

      // Extract Sequence ID from FASTA header (e.g., ">blaCTX-M..." or ">NZ_CP01...")
      let seqId = 'Unknown_Seq';
      if (rawHeader) {
        const firstLine = rawHeader.split('\n')[0].replace(/^>/, '').trim();
        seqId = firstLine.split(/\s+/)[0] || 'Unknown_Seq';
      }

      // Quality indicator rating (Academic basic QC)
      let qualityRating = 'Excellent';
      let qualityScore = 98;
      if (nPercent > 5) {
        qualityRating = 'Low (High Ambiguous N Content)';
        qualityScore = Math.max(30, Math.round(98 - nPercent * 3));
      } else if (nPercent > 1) {
        qualityRating = 'Moderate (Ambiguous Bases Present)';
        qualityScore = Math.max(70, Math.round(98 - nPercent * 5));
      } else if (len < 500) {
        qualityRating = 'Short Fragment (<500 bp)';
        qualityScore = 75;
      }

      return {
        header: rawHeader || `>${seqId} Sequence`,
        sequence: cleanSeq,
        length: len,
        aCount,
        tCount,
        gCount,
        cCount,
        nCount,
        gcPercent: parseFloat(gcPercent),
        atPercent: parseFloat(atPercent),
        nPercent: parseFloat(nPercent),
        sequenceId: seqId,
        contigs: 1,
        qualityRating,
        qualityScore
      };
    },

    selectGene(geneIdOrObj) {
      if (typeof geneIdOrObj === 'string') {
        const found = this.genes.find(g => g.id === geneIdOrObj || g.gene === geneIdOrObj);
        if (found) this.selectedGene = found;
      } else if (geneIdOrObj) {
        this.selectedGene = geneIdOrObj;
      }
      this.save();
    },

    selectMutation(mutationIdOrObj) {
      if (typeof mutationIdOrObj === 'string') {
        const found = this.mutations.find(m => m.id === mutationIdOrObj);
        if (found) this.selectedMutation = found;
      } else if (mutationIdOrObj) {
        this.selectedMutation = mutationIdOrObj;
      }
      this.save();
    }
  };

  // UI Helper module
  window.AMRUI = {
    showToast(message, type = 'info', duration = 3500) {
      let toastContainer = document.getElementById('amr-toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'amr-toast-container';
        toastContainer.className = 'amr-toast-container';
        document.body.appendChild(toastContainer);
      }

      const toast = document.createElement('div');
      toast.className = `amr-toast amr-toast-${type}`;
      
      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };

      toast.innerHTML = `
        <span class="amr-toast-icon">${icons[type] || 'ℹ'}</span>
        <span class="amr-toast-msg">${message}</span>
        <button class="amr-toast-close">&times;</button>
      `;

      toast.querySelector('.amr-toast-close').addEventListener('click', () => {
        toast.remove();
      });

      toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('amr-toast-fade');
        setTimeout(() => toast.remove(), 400);
      }, duration);
    },

    setupNav() {
      // Toggle sidebar on mobile
      const toggleBtn = document.getElementById('sidebar-toggle-btn');
      const sidebar = document.getElementById('amr-sidebar');
      if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
          sidebar.classList.toggle('open');
        });
      }

      // Close sidebar when clicking outside on mobile
      document.addEventListener('click', (e) => {
        if (sidebar && sidebar.classList.contains('open')) {
          if (!sidebar.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
            sidebar.classList.remove('open');
          }
        }
      });

      // Highlight active nav link
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    },

    formatNumber(num) {
      return (num || 0).toLocaleString();
    },

    formatBp(bp) {
      if (bp >= 1000000) return (bp / 1000000).toFixed(2) + ' Mbp';
      if (bp >= 1000) return (bp / 1000).toFixed(1) + ' kbp';
      return bp + ' bp';
    },

    printReport() {
      window.print();
    }
  };

  // Initialize state immediately
  document.addEventListener('DOMContentLoaded', () => {
    AMRState.init();
    AMRUI.setupNav();

    // Bind demo load buttons universally if present
    const demoButtons = document.querySelectorAll('.btn-load-demo');
    demoButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        AMRState.loadDemo(true);
      });
    });
  });

})();
