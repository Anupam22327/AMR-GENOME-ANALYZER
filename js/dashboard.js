/**
 * AMR-GENOME ANALYZER - Dashboard Controller
 * Dynamic KPI stats, Chart.js instances, Genome Map overview, and critical AMR alerts.
 */

window.AMRDashboard = {
  charts: {
    resistanceClass: null,
    geneMechanism: null,
    mutationType: null,
    gcContent: null
  },

  init() {
    this.updateKPIs();
    this.renderCharts();
    this.renderCriticalAlerts();
    this.renderGenomeOverview();

    // Re-render when window resizes
    window.addEventListener('resize', () => {
      if (window.AMRVisualizer) {
        AMRVisualizer.renderGenomeMap('dashboard-genome-map-container');
      }
    });
  },

  updateKPIs() {
    const genes = AMRState.genes || [];
    const mutations = AMRState.mutations || [];
    const genome = AMRState.genome || { length: 20000, gcPercent: 52 };

    const uniqueClasses = new Set(genes.map(g => g.resistanceClass));
    const knownResMuts = mutations.filter(m => m.resistanceAssociation.includes('Known'));

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    // Calculate total predicted ORFs (for 20 kbp demo, approx ~18 coding regions)
    const estimatedTotalGenes = Math.max(genes.length + 9, Math.round(genome.length / 1000));

    setTxt('kpi-total-genes', AMRUI.formatNumber(estimatedTotalGenes));
    setTxt('kpi-amr-genes', AMRUI.formatNumber(genes.length));
    setTxt('kpi-mutations', AMRUI.formatNumber(mutations.length));
    setTxt('kpi-resistance-classes', AMRUI.formatNumber(uniqueClasses.size));
    setTxt('kpi-known-muts', AMRUI.formatNumber(knownResMuts.length));
    setTxt('kpi-gc-content', `${genome.gcPercent}%`);
    setTxt('kpi-genome-len', AMRUI.formatBp(genome.length));

    // Update status badge
    const statusDot = document.getElementById('dashboard-status-indicator');
    if (statusDot) {
      statusDot.innerHTML = `<span class="status-pulse-dot"></span> Analysis Active (${genes.length} Genes)`;
    }
  },

  renderCharts() {
    const genes = AMRState.genes || [];
    const mutations = AMRState.mutations || [];
    const genome = AMRState.genome || { gcPercent: 52, atPercent: 48 };

    // 1. Resistance Class Distribution
    this.renderClassChart(genes);

    // 2. AMR Mechanism Distribution
    this.renderMechanismChart(genes);

    // 3. Mutation Type Distribution
    this.renderMutationChart(mutations);

    // 4. GC / AT Ratio Chart
    this.renderGCChart(genome);
  },

  renderClassChart(genes) {
    const canvas = document.getElementById('chart-resistance-classes');
    if (!canvas || !window.Chart) return;

    const classCounts = {};
    genes.forEach(g => {
      classCounts[g.resistanceClass] = (classCounts[g.resistanceClass] || 0) + 1;
    });

    const labels = Object.keys(classCounts);
    const data = Object.values(classCounts);

    if (this.charts.resistanceClass) this.charts.resistanceClass.destroy();

    this.charts.resistanceClass = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#06b6d4', // Cyan
            '#3b82f6', // Blue
            '#8b5cf6', // Violet
            '#ec4899', // Pink
            '#10b981', // Emerald
            '#f59e0b'  // Amber
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
            position: 'right',
            labels: { color: '#cbd5e1', boxWidth: 12, font: { size: 11 } }
          }
        }
      }
    });
  },

  renderMechanismChart(genes) {
    const canvas = document.getElementById('chart-amr-mechanisms');
    if (!canvas || !window.Chart) return;

    const mechCounts = {};
    genes.forEach(g => {
      mechCounts[g.mechanism] = (mechCounts[g.mechanism] || 0) + 1;
    });

    const labels = Object.keys(mechCounts);
    const data = Object.values(mechCounts);

    if (this.charts.geneMechanism) this.charts.geneMechanism.destroy();

    this.charts.geneMechanism = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Gene Count',
          data: data,
          backgroundColor: '#0ea5e9',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#94a3b8', stepSize: 1 },
            grid: { color: 'rgba(255,255,255,0.06)' }
          },
          x: {
            ticks: { color: '#94a3b8', font: { size: 10 } },
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  },

  renderMutationChart(mutations) {
    const canvas = document.getElementById('chart-mutation-types');
    if (!canvas || !window.Chart) return;

    const typeCounts = {};
    mutations.forEach(m => {
      typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
    });

    const labels = Object.keys(typeCounts);
    const data = Object.values(typeCounts);

    if (this.charts.mutationType) this.charts.mutationType.destroy();

    this.charts.mutationType = new Chart(canvas.getContext('2d'), {
      type: 'polarArea',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(6, 182, 212, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(139, 92, 246, 0.7)'
          ],
          borderColor: '#0b1329',
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            ticks: { display: false },
            grid: { color: 'rgba(255,255,255,0.08)' }
          }
        },
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#cbd5e1', boxWidth: 10, font: { size: 10 } }
          }
        }
      }
    });
  },

  renderGCChart(genome) {
    const canvas = document.getElementById('chart-gc-overview');
    if (!canvas || !window.Chart) return;

    if (this.charts.gcContent) this.charts.gcContent.destroy();

    this.charts.gcContent = new Chart(canvas.getContext('2d'), {
      type: 'pie',
      data: {
        labels: ['GC Bases', 'AT Bases'],
        datasets: [{
          data: [genome.gcPercent, genome.atPercent],
          backgroundColor: ['#06b6d4', '#f59e0b'],
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
            labels: { color: '#cbd5e1', boxWidth: 12, font: { size: 11 } }
          }
        }
      }
    });
  },

  renderGenomeOverview() {
    if (window.AMRVisualizer) {
      AMRVisualizer.renderGenomeMap('dashboard-genome-map-container');
    }
  },

  renderCriticalAlerts() {
    const container = document.getElementById('dashboard-critical-alerts');
    if (!container) return;

    const genes = AMRState.genes || [];
    const highPriorityGenes = genes.slice(0, 5);

    container.innerHTML = highPriorityGenes.map(g => `
      <div class="alert-row-item">
        <div class="alert-gene-lead">
          <span class="pulse-indicator"></span>
          <strong class="font-mono text-cyan">${g.gene}</strong>
          <span class="badge badge-class text-xs">${g.resistanceClass}</span>
        </div>
        <div class="alert-details text-xs text-slate-300">
          <span>Drugs: <strong class="text-white">${g.antibiotic}</strong></span>
          <span class="text-muted font-mono">(${AMRUI.formatNumber(g.start)} - ${AMRUI.formatNumber(g.end)} bp)</span>
        </div>
        <div class="alert-action">
          <a href="analysis.html" class="btn btn-xs btn-outline-cyan" onclick="AMRState.selectGene('${g.id}')">
            Analyze
          </a>
        </div>
      </div>
    `).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('kpi-total-genes') || document.getElementById('chart-resistance-classes')) {
    AMRDashboard.init();
  }
});
