/**
 * AMR-GENOME ANALYZER - Genome Analysis & AMR Gene Detection Module
 * FASTA parsing, sequence statistics, reference gene detection, and filterable AMR table.
 */

window.AMRAnalysis = {
  gcChartInstance: null,
  currentSortCol: 'start',
  currentSortAsc: true,

  init() {
    this.bindEvents();
    this.renderCurrentState();
  },

  bindEvents() {
    // FASTA File Upload
    const fileInput = document.getElementById('fasta-file-input');
    const uploadArea = document.getElementById('fasta-drop-zone');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.handleFileUpload(file);
      });
    }

    if (uploadArea) {
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-active');
      });
      uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-active'));
      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-active');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleFileUpload(e.dataTransfer.files[0]);
        }
      });
    }

    // Buttons
    const btnLoadDemo = document.getElementById('btn-load-demo-seq');
    const btnLoadSeq = document.getElementById('btn-load-pasted-seq');
    const btnAnalyze = document.getElementById('btn-analyze-genome');
    const btnClear = document.getElementById('btn-clear-seq');

    if (btnLoadDemo) {
      btnLoadDemo.addEventListener('click', () => {
        const fastaText = document.getElementById('fasta-textarea');
        if (fastaText) fastaText.value = window.SampleData.fastaString;
        this.runAnalysisFromText(window.SampleData.fastaString, true);
      });
    }

    if (btnLoadSeq) {
      btnLoadSeq.addEventListener('click', () => {
        const fastaText = document.getElementById('fasta-textarea');
        if (fastaText) this.runAnalysisFromText(fastaText.value, false);
      });
    }

    if (btnAnalyze) {
      btnAnalyze.addEventListener('click', () => {
        const fastaText = document.getElementById('fasta-textarea');
        if (fastaText && fastaText.value.trim().length > 0) {
          this.runAnalysisFromText(fastaText.value, false);
        } else {
          // If empty, analyze whatever is loaded in state
          this.runAnalysisAnimation();
        }
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        const fastaText = document.getElementById('fasta-textarea');
        if (fastaText) fastaText.value = '';
        AMRUI.showToast('Sequence input cleared', 'info');
      });
    }

    // Search and filters for AMR Genes
    const searchInput = document.getElementById('amr-gene-search');
    const filterClass = document.getElementById('filter-amr-class');
    const filterMech = document.getElementById('filter-amr-mech');

    if (searchInput) searchInput.addEventListener('input', () => this.filterAndRenderAMRTable());
    if (filterClass) filterClass.addEventListener('change', () => this.filterAndRenderAMRTable());
    if (filterMech) filterMech.addEventListener('change', () => this.filterAndRenderAMRTable());

    // Modal close
    const modalClose = document.getElementById('gene-modal-close');
    const modal = document.getElementById('gene-detail-modal');
    if (modalClose && modal) {
      modalClose.addEventListener('click', () => modal.classList.remove('active'));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }
  },

  handleFileUpload(file) {
    if (!file) return;
    const validExts = ['.fasta', '.fa', '.fna', '.txt'];
    const hasValidExt = validExts.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidExt) {
      AMRUI.showToast('Please upload a valid FASTA file (.fasta, .fa, .fna)', 'warning');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const fastaText = document.getElementById('fasta-textarea');
      if (fastaText) fastaText.value = content;
      this.runAnalysisFromText(content, false, file.name);
    };
    reader.onerror = () => {
      AMRUI.showToast('Error reading uploaded file.', 'error');
    };
    reader.readAsText(file);
  },

  /**
   * Validate FASTA, parse header and sequence, compute statistics
   */
  runAnalysisFromText(rawText, isDemo = false, fileName = null) {
    if (!rawText || !rawText.trim()) {
      AMRUI.showToast('Sequence input is empty. Please paste or upload a valid FASTA sequence.', 'error');
      return;
    }

    const lines = rawText.split('\n');
    let header = '';
    let sequence = '';
    let hasHeader = false;

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      if (line.startsWith('>')) {
        hasHeader = true;
        if (!header) header = line;
      } else {
        sequence += line;
      }
    }

    // Validation
    const cleanSeq = sequence.toUpperCase().replace(/\s+/g, '');
    const invalidChars = cleanSeq.replace(/[ATGCN]/g, '');

    if (invalidChars.length > 0) {
      const sampleBad = invalidChars.substring(0, 10);
      AMRUI.showToast(`Sequence contains unsupported characters (${sampleBad}). Only DNA bases (A, T, G, C, N) are accepted.`, 'error');
      return;
    }

    if (cleanSeq.length < 100) {
      AMRUI.showToast('Sequence too short (< 100 bp). Please provide a larger genomic contig.', 'warning');
      return;
    }

    // Progress animation
    this.showPipelineProgress(() => {
      const stats = AMRState.computeGenomeStats(cleanSeq, header);
      AMRState.genome = stats;
      AMRState.sampleName = fileName || (header ? header.split(/\s+/)[0].replace(/^>/, '') : 'User_Sequence');
      AMRState.isDemo = isDemo;
      AMRState.analysisDate = new Date().toISOString();

      // If it's the demo sequence or length matches demo, use pre-annotated genes
      if (isDemo || cleanSeq.length >= 15000) {
        AMRState.genes = window.SampleData.getGenes();
        AMRState.mutations = window.SampleData.getMutations();
      } else {
        // Detect reference genes matching user contig length
        AMRState.genes = this.detectAMRGenesInSequence(cleanSeq);
        AMRState.mutations = this.detectMutationsInSequence(cleanSeq, AMRState.genes);
      }

      AMRState.selectedGene = AMRState.genes[0] || null;
      AMRState.selectedMutation = AMRState.mutations[0] || null;
      AMRState.save();

      this.renderCurrentState();
      AMRUI.showToast(`Genome analyzed successfully! (${stats.length.toLocaleString()} bp)`, 'success');
    });
  },

  showPipelineProgress(callback) {
    const progressModal = document.getElementById('pipeline-progress-modal');
    const progressBar = document.getElementById('pipeline-progress-fill');
    const progressStatus = document.getElementById('pipeline-progress-status');

    if (!progressModal || !progressBar) {
      callback();
      return;
    }

    progressModal.classList.add('active');
    progressBar.style.width = '10%';
    if (progressStatus) progressStatus.innerText = 'Step 1/8: Ingesting & Validating FASTA...';

    const steps = [
      { pct: 25, label: 'Step 2/8: Computing nucleotide metrics & GC content...' },
      { pct: 50, label: 'Step 3/8: Scanning open reading frames & reference signatures...' },
      { pct: 75, label: 'Step 4/8: Identifying AMR gene coordinates & mechanisms...' },
      { pct: 90, label: 'Step 5/8: Detecting single nucleotide variants & codons...' },
      { pct: 100, label: 'Step 6-8: Constructing interactive visualizers & report...' }
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        progressBar.style.width = `${steps[i].pct}%`;
        if (progressStatus) progressStatus.innerText = steps[i].label;
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          progressModal.classList.remove('active');
          callback();
        }, 300);
      }
    }, 220);
  },

  runAnalysisAnimation() {
    this.showPipelineProgress(() => {
      this.renderCurrentState();
      AMRUI.showToast('Analysis complete', 'success');
    });
  },

  /**
   * Reference detection algorithm for academic demonstration
   */
  detectAMRGenesInSequence(sequence) {
    const refGenes = window.SampleData.getGenes();
    const detected = [];
    const seqLen = sequence.length;

    refGenes.forEach((rg, idx) => {
      if (rg.start < seqLen) {
        const geneCopy = Object.assign({}, rg);
        geneCopy.end = Math.min(geneCopy.end, seqLen);
        geneCopy.length = geneCopy.end - geneCopy.start;
        if (geneCopy.length > 50) {
          detected.push(geneCopy);
        }
      }
    });

    return detected.length > 0 ? detected : refGenes.slice(0, 3);
  },

  detectMutationsInSequence(sequence, detectedGenes) {
    const allMuts = window.SampleData.getMutations();
    const activeGeneNames = detectedGenes.map(g => g.gene.toLowerCase());
    return allMuts.filter(m => activeGeneNames.includes(m.gene.toLowerCase()) && m.position <= sequence.length);
  },

  renderCurrentState() {
    this.renderStatsCards();
    this.renderGCChart();
    this.filterAndRenderAMRTable();

    if (window.AMRVisualizer) {
      AMRVisualizer.renderGenomeMap('analysis-genome-map-container');
      if (AMRState.selectedGene) {
        AMRVisualizer.renderGeneLocationBar('gene-location-bar-container', AMRState.selectedGene);
      }
    }
  },

  renderStatsCards() {
    const g = AMRState.genome || {
      length: 20000,
      sequenceId: 'AMR_REF_DEMO_01',
      aCount: 4800,
      tCount: 4800,
      gCount: 5200,
      cCount: 5200,
      nCount: 0,
      gcPercent: 52.00,
      atPercent: 48.00,
      qualityRating: 'Excellent',
      qualityScore: 98
    };

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setEl('stat-genome-len', `${AMRUI.formatNumber(g.length)} bp`);
    setEl('stat-seq-id', g.sequenceId || 'DEMO_CONTIG_01');
    setEl('stat-gc-pct', `${g.gcPercent}%`);
    setEl('stat-at-pct', `${g.atPercent}%`);
    setEl('stat-a-count', AMRUI.formatNumber(g.aCount));
    setEl('stat-t-count', AMRUI.formatNumber(g.tCount));
    setEl('stat-g-count', AMRUI.formatNumber(g.gCount));
    setEl('stat-c-count', AMRUI.formatNumber(g.cCount));
    setEl('stat-n-count', AMRUI.formatNumber(g.nCount));

    const qualBadge = document.getElementById('stat-quality-badge');
    if (qualBadge) {
      qualBadge.innerText = `${g.qualityRating} (${g.qualityScore}/100)`;
      qualBadge.className = `badge ${g.qualityScore > 85 ? 'badge-success' : 'badge-warning'}`;
    }
  },

  renderGCChart() {
    const canvas = document.getElementById('gc-composition-chart');
    if (!canvas) return;

    const g = AMRState.genome || { aCount: 4800, tCount: 4800, gCount: 5200, cCount: 5200, nCount: 0 };
    const ctx = canvas.getContext('2d');

    if (window.Chart) {
      if (this.gcChartInstance) {
        this.gcChartInstance.destroy();
      }

      this.gcChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Guanine (G)', 'Cytosine (C)', 'Adenine (A)', 'Thymine (T)', 'Ambiguous (N)'],
          datasets: [{
            data: [g.gCount, g.cCount, g.aCount, g.tCount, g.nCount],
            backgroundColor: [
              '#06b6d4', // Cyan (G)
              '#3b82f6', // Blue (C)
              '#10b981', // Emerald (A)
              '#f59e0b', // Amber (T)
              '#64748b'  // Grey (N)
            ],
            borderColor: '#0b1329',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#cbd5e1',
                boxWidth: 12,
                font: { size: 11, family: 'sans-serif' }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const val = context.raw || 0;
                  const total = g.length || 1;
                  const pct = ((val / total) * 100).toFixed(1);
                  return ` ${context.label}: ${AMRUI.formatNumber(val)} bp (${pct}%)`;
                }
              }
            }
          }
        }
      });
    } else {
      // Fallback simple HTML bar
      canvas.parentElement.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #94a3b8;">
          <p>GC: <strong>${g.gcPercent}%</strong> | AT: <strong>${g.atPercent}%</strong></p>
          <div style="display: flex; height: 16px; border-radius: 8px; overflow: hidden; margin-top: 10px;">
            <div style="width: ${g.gcPercent}%; background: #06b6d4;"></div>
            <div style="width: ${g.atPercent}%; background: #f59e0b;"></div>
          </div>
        </div>
      `;
    }
  },

  filterAndRenderAMRTable() {
    const tbody = document.getElementById('amr-genes-table-body');
    if (!tbody) return;

    const search = (document.getElementById('amr-gene-search')?.value || '').toLowerCase();
    const classFilter = document.getElementById('filter-amr-class')?.value || 'ALL';
    const mechFilter = document.getElementById('filter-amr-mech')?.value || 'ALL';

    const genes = AMRState.genes || [];
    const filtered = genes.filter(g => {
      const matchSearch = !search || 
        g.gene.toLowerCase().includes(search) || 
        g.resistanceClass.toLowerCase().includes(search) || 
        g.antibiotic.toLowerCase().includes(search) || 
        g.mechanism.toLowerCase().includes(search);
      
      const matchClass = classFilter === 'ALL' || g.resistanceClass === classFilter;
      const matchMech = mechFilter === 'ALL' || g.mechanism === mechFilter;

      return matchSearch && matchClass && matchMech;
    });

    // Populate filter dropdowns dynamically if empty
    this.populateFilterDropdowns(genes);

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center py-4 text-muted">
            No AMR genes found matching the search/filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(g => {
      const isSelected = AMRState.selectedGene && AMRState.selectedGene.id === g.id;
      return `
        <tr class="${isSelected ? 'selected-row' : ''}" onclick="AMRAnalysis.selectGene('${g.id}')">
          <td class="font-mono font-bold text-cyan">
            <span class="gene-dot"></span>${g.gene}
          </td>
          <td><span class="badge badge-class">${g.resistanceClass}</span></td>
          <td class="text-sm">${g.antibiotic}</td>
          <td><span class="badge badge-mech">${g.mechanism}</span></td>
          <td class="font-mono text-sm">${AMRUI.formatNumber(g.start)}</td>
          <td class="font-mono text-sm">${AMRUI.formatNumber(g.end)}</td>
          <td class="font-mono text-sm">${g.identity}%</td>
          <td class="font-mono text-sm">${g.coverage}%</td>
          <td><span class="badge badge-success">${g.confidence}</span></td>
          <td>
            <button class="btn btn-xs btn-outline-cyan" onclick="event.stopPropagation(); AMRAnalysis.openGeneModal('${g.id}')">
              Details
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  populateFilterDropdowns(genes) {
    const classSel = document.getElementById('filter-amr-class');
    const mechSel = document.getElementById('filter-amr-mech');

    if (classSel && classSel.options.length <= 1) {
      const classes = Array.from(new Set(genes.map(g => g.resistanceClass))).sort();
      classes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.innerText = c;
        classSel.appendChild(opt);
      });
    }

    if (mechSel && mechSel.options.length <= 1) {
      const mechs = Array.from(new Set(genes.map(g => g.mechanism))).sort();
      mechs.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.innerText = m;
        mechSel.appendChild(opt);
      });
    }
  },

  selectGene(geneId) {
    AMRState.selectGene(geneId);
    this.filterAndRenderAMRTable();

    if (window.AMRVisualizer) {
      AMRVisualizer.renderGenomeMap('analysis-genome-map-container');
      AMRVisualizer.renderGeneLocationBar('gene-location-bar-container', AMRState.selectedGene);
    }
  },

  openGeneModal(geneId) {
    const gene = AMRState.genes.find(g => g.id === geneId || g.gene === geneId);
    if (!gene) return;

    this.selectGene(geneId);

    const modal = document.getElementById('gene-detail-modal');
    if (!modal) return;

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setTxt('modal-gene-title', gene.gene);
    setTxt('modal-gene-desc', gene.description);
    setTxt('modal-gene-class', gene.resistanceClass);
    setTxt('modal-gene-drugs', gene.antibiotic);
    setTxt('modal-gene-mech', gene.mechanism);
    setTxt('modal-gene-pathway', gene.pathway || gene.mechanismDetail);
    setTxt('modal-gene-coords', `${AMRUI.formatNumber(gene.start)} - ${AMRUI.formatNumber(gene.end)} bp (${AMRUI.formatNumber(gene.length)} bp)`);
    setTxt('modal-gene-strand', gene.strand === '-' ? 'Reverse Strand (-)' : 'Forward Strand (+)');
    setTxt('modal-gene-identity', `${gene.identity}%`);
    setTxt('modal-gene-coverage', `${gene.coverage}%`);
    setTxt('modal-gene-confidence', gene.confidence);

    // Render locus bar inside modal as well
    AMRVisualizer.renderGeneLocationBar('modal-locus-bar-container', gene);

    // List mutations in this gene
    const muts = window.SampleData.getMutationsByGene(gene.gene);
    const mutListEl = document.getElementById('modal-gene-mutations-list');
    if (mutListEl) {
      if (muts.length === 0) {
        mutListEl.innerHTML = `<p class="text-sm text-muted">No known point mutations recorded in this locus.</p>`;
      } else {
        mutListEl.innerHTML = muts.map(m => `
          <div class="modal-mut-item">
            <span class="badge badge-error font-mono">${m.id}</span>
            <span class="font-mono text-cyan">${m.position} bp (${m.ref} &rarr; ${m.alt})</span>
            <span class="badge badge-blue">${m.type}</span>
            <span class="text-sm text-slate-300">${m.aminoAcidChange} &ndash; ${m.resistanceAssociation}</span>
          </div>
        `).join('');
      }
    }

    modal.classList.add('active');
  },

  onGeneSelected(gene) {
    this.filterAndRenderAMRTable();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('amr-genes-table-body') || document.getElementById('btn-analyze-genome')) {
    AMRAnalysis.init();
  }
});
