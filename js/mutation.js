/**
 * AMR-GENOME ANALYZER - Mutation Analysis Engine
 * Mutation table, filtering, exact position visualization, resistance classification, and 3D molecular interface.
 */

window.AMRMutation = {
  currentSortCol: 'position',
  currentSortAsc: true,

  init() {
    this.bindEvents();
    this.renderCurrentState();
  },

  bindEvents() {
    const searchInput = document.getElementById('mutation-search-input');
    const filterType = document.getElementById('filter-mut-type');
    const filterAssoc = document.getElementById('filter-mut-assoc');
    const filterGene = document.getElementById('filter-mut-gene');

    if (searchInput) searchInput.addEventListener('input', () => this.filterAndRenderMutationTable());
    if (filterType) filterType.addEventListener('change', () => this.filterAndRenderMutationTable());
    if (filterAssoc) filterAssoc.addEventListener('change', () => this.filterAndRenderMutationTable());
    if (filterGene) filterGene.addEventListener('change', () => this.filterAndRenderMutationTable());
  },

  renderCurrentState() {
    this.populateFilterDropdowns();
    this.filterAndRenderMutationTable();

    const selectedMut = AMRState.selectedMutation || AMRState.mutations[0];
    if (selectedMut) {
      this.selectMutation(selectedMut.id, false);
    }
  },

  populateFilterDropdowns() {
    const muts = AMRState.mutations || [];
    const filterGene = document.getElementById('filter-mut-gene');
    const filterType = document.getElementById('filter-mut-type');
    const filterAssoc = document.getElementById('filter-mut-assoc');

    if (filterGene && filterGene.options.length <= 1) {
      const genes = Array.from(new Set(muts.map(m => m.gene))).sort();
      genes.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g;
        opt.innerText = g;
        filterGene.appendChild(opt);
      });
    }

    if (filterType && filterType.options.length <= 1) {
      const types = Array.from(new Set(muts.map(m => m.type))).sort();
      types.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.innerText = t;
        filterType.appendChild(opt);
      });
    }

    if (filterAssoc && filterAssoc.options.length <= 1) {
      const assocs = Array.from(new Set(muts.map(m => m.resistanceAssociation))).sort();
      assocs.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a;
        opt.innerText = a;
        filterAssoc.appendChild(opt);
      });
    }
  },

  filterAndRenderMutationTable() {
    const tbody = document.getElementById('mutation-table-body');
    if (!tbody) return;

    const search = (document.getElementById('mutation-search-input')?.value || '').toLowerCase();
    const typeFilter = document.getElementById('filter-mut-type')?.value || 'ALL';
    const assocFilter = document.getElementById('filter-mut-assoc')?.value || 'ALL';
    const geneFilter = document.getElementById('filter-mut-gene')?.value || 'ALL';

    const muts = AMRState.mutations || [];
    const filtered = muts.filter(m => {
      const matchSearch = !search ||
        m.id.toLowerCase().includes(search) ||
        m.gene.toLowerCase().includes(search) ||
        m.aminoAcidChange.toLowerCase().includes(search) ||
        m.effect.toLowerCase().includes(search) ||
        m.position.toString().includes(search);

      const matchType = typeFilter === 'ALL' || m.type === typeFilter;
      const matchAssoc = assocFilter === 'ALL' || m.resistanceAssociation === assocFilter;
      const matchGene = geneFilter === 'ALL' || m.gene === geneFilter;

      return matchSearch && matchType && matchAssoc && matchGene;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center py-4 text-muted">
            No mutations matching the current filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(m => {
      const isSelected = AMRState.selectedMutation && AMRState.selectedMutation.id === m.id;
      
      // Badge classes
      let assocBadgeClass = 'badge-secondary';
      if (m.resistanceAssociation.includes('Known')) assocBadgeClass = 'badge-error';
      else if (m.resistanceAssociation.includes('Potentially')) assocBadgeClass = 'badge-warning';
      else if (m.resistanceAssociation.includes('Demonstration')) assocBadgeClass = 'badge-info';

      return `
        <tr class="${isSelected ? 'selected-row' : ''}" onclick="AMRMutation.selectMutation('${m.id}')">
          <td class="font-mono font-bold text-cyan">${m.id}</td>
          <td class="font-mono text-cyan-light font-semibold">${m.gene}</td>
          <td class="font-mono text-white">${AMRUI.formatNumber(m.position)}</td>
          <td class="font-mono text-cyan">${m.ref}</td>
          <td class="font-mono text-red font-bold">${m.alt}</td>
          <td class="font-mono text-sm">${m.codonChange}</td>
          <td class="font-mono font-semibold text-amber">${m.aminoAcidChange}</td>
          <td><span class="badge badge-type badge-type-${m.type.toLowerCase()}">${m.type}</span></td>
          <td><span class="badge ${assocBadgeClass}">${m.resistanceAssociation}</span></td>
        </tr>
      `;
    }).join('');
  },

  selectMutation(mutationId, triggerScroll = true) {
    AMRState.selectMutation(mutationId);
    this.filterAndRenderMutationTable();

    const m = AMRState.selectedMutation;
    if (!m) return;

    // Update Detail Card
    this.renderDetailCard(m);

    // Update Visualizations
    if (window.AMRVisualizer) {
      AMRVisualizer.renderExactMutationPosition('exact-mutation-track-container', m);
      AMRVisualizer.renderGeneMutationRelationship('gene-mutation-cascade-container', m);

      // Re-init or update 3D viewer for the gene's protein structure
      const geneObj = AMRState.genes.find(g => g.gene.toLowerCase() === m.gene.toLowerCase());
      const pdbId = geneObj ? geneObj.pdbId : '4BLM';
      // Extract numeric residue index from amino acid string e.g. Asp240Asn -> 240
      const resMatch = m.aminoAcidChange.match(/\d+/);
      const resNum = resMatch ? parseInt(resMatch[0], 10) : 5;

      AMRVisualizer.init3DViewer('protein-3d-viewer', pdbId, resNum);
    }
  },

  renderDetailCard(m) {
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setTxt('card-mut-id', m.id);
    setTxt('card-mut-gene', m.gene);
    setTxt('card-mut-pos', `${AMRUI.formatNumber(m.position)} bp`);
    setTxt('card-mut-nucleotide', `${m.ref} \u2192 ${m.alt}`);
    setTxt('card-mut-codon', m.codonChange);
    setTxt('card-mut-aa', m.aminoAcidChange);
    setTxt('card-mut-type', m.type);
    setTxt('card-mut-assoc', m.resistanceAssociation);
    setTxt('card-mut-evidence', `${m.evidence} Confidence`);
    setTxt('card-mut-effect', m.effect);
    setTxt('card-mut-clinical', m.clinicalSignificance || 'Clinical correlate pending further phenotypic testing.');

    const assocBadge = document.getElementById('card-mut-assoc-badge');
    if (assocBadge) {
      assocBadge.innerText = m.resistanceAssociation;
      let cls = 'badge badge-secondary';
      if (m.resistanceAssociation.includes('Known')) cls = 'badge badge-error';
      else if (m.resistanceAssociation.includes('Potentially')) cls = 'badge badge-warning';
      else if (m.resistanceAssociation.includes('Demonstration')) cls = 'badge badge-info';
      assocBadge.className = cls;
    }
  },

  onMutationSelected(mutation) {
    this.selectMutation(mutation.id, false);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('mutation-table-body') || document.getElementById('exact-mutation-track-container')) {
    AMRMutation.init();
  }
});
