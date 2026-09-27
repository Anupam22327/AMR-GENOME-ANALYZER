/**
 * AMR-GENOME ANALYZER - Visualization Engine
 * Interactive Genome Map, Dynamic Mutation Track, Gene Cascade, and 3D Molecular Viewer.
 */

window.AMRVisualizer = {
  viewer3D: null,
  is3DmolAvailable: false,
  autoRotateInterval: null,
  isRotating: false,

  /**
   * Render the main Genome Map with all genes plotted along the contig
   */
  renderGenomeMap(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const genome = AMRState.genome || { length: 20000 };
    const genes = AMRState.genes || [];
    const selectedGene = AMRState.selectedGene || genes[0];
    const mutations = AMRState.mutations || [];

    const totalLength = Math.max(genome.length || 20000, 1000);
    const width = container.clientWidth || 900;
    const height = 120;
    const padding = 40;
    const trackY = 65;
    const usableWidth = width - padding * 2;

    let svg = `<svg viewBox="0 0 ${width} ${height}" class="genome-svg" width="100%" height="${height}">
      <defs>
        <linearGradient id="backboneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="50%" stop-color="#334155" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
        <linearGradient id="selectedGeneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#06b6d4" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Genome Coordinate Ticks & Ruler -->
      <line x1="${padding}" y1="${trackY}" x2="${width - padding}" y2="${trackY}" stroke="#475569" stroke-width="4" stroke-linecap="round" />
      <text x="${padding}" y="${trackY + 28}" fill="#94a3b8" font-size="11" font-family="monospace">1 bp</text>
      <text x="${width / 2}" y="${trackY + 28}" fill="#64748b" font-size="11" text-anchor="middle" font-family="monospace">${AMRUI.formatBp(Math.round(totalLength / 2))}</text>
      <text x="${width - padding}" y="${trackY + 28}" fill="#94a3b8" font-size="11" text-anchor="end" font-family="monospace">${AMRUI.formatBp(totalLength)}</text>
    `;

    // Draw ticks
    const tickInterval = totalLength / 10;
    for (let i = 0; i <= 10; i++) {
      const bp = i * tickInterval;
      const x = padding + (bp / totalLength) * usableWidth;
      svg += `<line x1="${x}" y1="${trackY - 6}" x2="${x}" y2="${trackY + 6}" stroke="#64748b" stroke-width="1.5" />`;
    }

    // Render Genes as interactive glyphs
    genes.forEach(g => {
      const startX = padding + (g.start / totalLength) * usableWidth;
      const endX = padding + (g.end / totalLength) * usableWidth;
      const geneWidth = Math.max(endX - startX, 12);
      const isSelected = selectedGene && (selectedGene.id === g.id || selectedGene.gene === g.gene);

      const fillColor = isSelected ? 'url(#selectedGeneGrad)' : '#0ea5e9';
      const strokeColor = isSelected ? '#38bdf8' : '#0369a1';
      const filterAttr = isSelected ? 'filter="url(#glow)"' : '';
      const heightBox = 22;
      const boxY = trackY - heightBox / 2;

      // Class-specific color
      let classColor = '#3b82f6';
      if (g.resistanceClass.includes('Beta-lactam')) classColor = '#06b6d4';
      else if (g.resistanceClass.includes('Fluoroquinolone')) classColor = '#f59e0b';
      else if (g.resistanceClass.includes('Glycopeptide')) classColor = '#ec4899';
      else if (g.resistanceClass.includes('Tetracycline')) classColor = '#10b981';
      else if (g.resistanceClass.includes('Macrolide')) classColor = '#8b5cf6';

      svg += `
        <g class="genome-gene-glyph ${isSelected ? 'selected' : ''}" 
           data-gene-id="${g.id}" 
           style="cursor: pointer;"
           onclick="window.selectGeneFromVisualizer('${g.id}')">
          <rect x="${startX}" y="${boxY}" width="${geneWidth}" height="${heightBox}" rx="4" 
                fill="${isSelected ? '#38bdf8' : classColor}" 
                stroke="${isSelected ? '#ffffff' : '#0f172a'}" 
                stroke-width="${isSelected ? 2.5 : 1}" 
                ${filterAttr} />
          <text x="${startX + geneWidth / 2}" y="${boxY - 8}" fill="${isSelected ? '#38bdf8' : '#e2e8f0'}" 
                font-size="${isSelected ? 12 : 10}" font-weight="${isSelected ? 'bold' : 'normal'}" 
                text-anchor="middle" font-family="sans-serif">${g.gene}</text>
        </g>
      `;
    });

    // Render Mutation markers on the track
    mutations.forEach(m => {
      const mutX = padding + (m.position / totalLength) * usableWidth;
      const isSelectedMut = AMRState.selectedMutation && AMRState.selectedMutation.id === m.id;
      const color = isSelectedMut ? '#ef4444' : '#f97316';
      svg += `
        <g class="mutation-pin" style="cursor:pointer;" onclick="window.selectMutationFromVisualizer('${m.id}')">
          <circle cx="${mutX}" cy="${trackY}" r="${isSelectedMut ? 5 : 3.5}" fill="${color}" stroke="#ffffff" stroke-width="1.5" />
          <line x1="${mutX}" y1="${trackY - 14}" x2="${mutX}" y2="${trackY - 2}" stroke="${color}" stroke-width="1.5" />
        </g>
      `;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
  },

  /**
   * Render dynamic Genome-Location single gene diagram:
   * 0 bp ──────────────────────────────── [ AMR GENE ] ──────────────────────────────── Genome length
   */
  renderGeneLocationBar(containerId, gene) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!gene) {
      container.innerHTML = `<div class="empty-state">Select a gene to view its precise genomic locus.</div>`;
      return;
    }

    const genome = AMRState.genome || { length: 20000 };
    const totalLength = Math.max(genome.length || 20000, gene.end + 500);

    const startPct = ((gene.start / totalLength) * 100).toFixed(2);
    const widthPct = Math.max((((gene.end - gene.start) / totalLength) * 100), 2.5).toFixed(2);

    container.innerHTML = `
      <div class="locus-bar-wrapper">
        <div class="locus-info-header">
          <span class="locus-title"><strong>${gene.gene}</strong> (${gene.resistanceClass})</span>
          <span class="locus-coords font-mono">Position: <strong>${AMRUI.formatNumber(gene.start)} bp</strong> &ndash; <strong>${AMRUI.formatNumber(gene.end)} bp</strong> (Length: ${AMRUI.formatNumber(gene.length)} bp)</span>
        </div>

        <div class="locus-track-container">
          <div class="locus-track-line"></div>
          <div class="locus-gene-block" style="left: ${startPct}%; width: ${widthPct}%;">
            <span class="gene-strand-badge">${gene.strand || '+'}</span>
            <span class="gene-block-name">${gene.gene}</span>
          </div>
          <div class="locus-pointer start-ptr" style="left: ${startPct}%;">
            <div class="pointer-arrow">▲</div>
            <div class="pointer-label font-mono">${gene.start} bp</div>
          </div>
          <div class="locus-pointer end-ptr" style="left: calc(${startPct}% + ${widthPct}%);">
            <div class="pointer-arrow">▲</div>
            <div class="pointer-label font-mono">${gene.end} bp</div>
          </div>
        </div>

        <div class="locus-ruler-labels">
          <span>0 bp</span>
          <span class="text-muted">Strand: ${gene.strand === '-' ? 'Reverse (-)' : 'Forward (+)'}</span>
          <span>${AMRUI.formatBp(totalLength)}</span>
        </div>
      </div>
    `;
  },

  /**
   * Render dynamic Exact Mutation Position Visualizer:
   * Displays the Gene locus with an exact nucleotide position indicator arrow
   */
  renderExactMutationPosition(containerId, mutation) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!mutation) {
      container.innerHTML = `<div class="empty-state">Select a mutation to view its exact position.</div>`;
      return;
    }

    const gene = AMRState.genes.find(g => g.gene.toLowerCase() === mutation.gene.toLowerCase()) || {
      gene: mutation.gene,
      start: mutation.position - 500,
      end: mutation.position + 500,
      length: 1000
    };

    const geneStart = gene.start;
    const geneEnd = gene.end;
    const geneSpan = Math.max(geneEnd - geneStart, 100);
    const mutPos = mutation.position;
    
    // Relative percentage inside the gene
    const relativePos = Math.max(0, Math.min(100, ((mutPos - geneStart) / geneSpan) * 100)).toFixed(2);

    container.innerHTML = `
      <div class="exact-mutation-card">
        <div class="exact-mut-header">
          <div class="mut-badge-title">
            <span class="badge badge-error font-mono">${mutation.id}</span>
            <span class="mut-gene-highlight">${mutation.gene}</span>
            <span class="badge badge-cyan font-mono">${mutation.aminoAcidChange || mutation.effect}</span>
          </div>
          <div class="mut-pos-tag font-mono">
            Exact Position: <strong>${AMRUI.formatNumber(mutPos)} bp</strong>
          </div>
        </div>

        <!-- Macro Genome Context -->
        <div class="macro-track-view">
          <div class="macro-track-title">Genome Locus Overview</div>
          <div class="macro-track-bar">
            <div class="macro-gene-region" style="left: ${((geneStart / 20000) * 100).toFixed(1)}%; width: ${((geneSpan / 20000) * 100).toFixed(1)}%;">
              <span class="macro-marker" style="left: ${relativePos}%;"></span>
            </div>
          </div>
          <div class="macro-labels font-mono">
            <span>0 bp</span>
            <span>${gene.gene} (${geneStart} - ${geneEnd} bp)</span>
            <span>20,000 bp</span>
          </div>
        </div>

        <!-- Zoomed Gene Region Track -->
        <div class="zoomed-gene-track">
          <div class="zoomed-track-title">Gene Region Zoom (${gene.gene})</div>
          
          <div class="gene-locus-bar-box">
            <div class="gene-bar-body">
              <span class="gene-bar-text">${gene.gene} Coding Sequence (${gene.length} bp)</span>
              
              <!-- Pointer at exact mutation position -->
              <div class="dynamic-mutation-arrow" style="left: ${relativePos}%;">
                <div class="mut-callout font-mono">
                  <span class="mut-nucleotide-change">${mutation.ref} &rarr; ${mutation.alt}</span>
                  <span class="mut-callout-pos">${mutPos} bp</span>
                </div>
                <div class="arrow-point">&#9660;</div>
                <div class="vertical-locus-line"></div>
              </div>
            </div>

            <!-- Start / End Coordinate Pins -->
            <div class="gene-edge-pin edge-left font-mono">
              <span class="pin-tick">|</span>
              <span class="pin-coord">${geneStart} bp</span>
            </div>
            <div class="gene-edge-pin edge-right font-mono">
              <span class="pin-tick">|</span>
              <span class="pin-coord">${geneEnd} bp</span>
            </div>
          </div>
        </div>

        <!-- Nucleotide & Codon Micro-Alignment Display -->
        <div class="micro-alignment-grid">
          <div class="align-box">
            <span class="align-lbl">Reference Base</span>
            <span class="align-val text-cyan font-mono">${mutation.ref}</span>
          </div>
          <div class="align-arrow-symbol">&rarr;</div>
          <div class="align-box">
            <span class="align-lbl">Mutant Base</span>
            <span class="align-val text-red font-mono">${mutation.alt}</span>
          </div>
          <div class="align-box">
            <span class="align-lbl">Codon Change</span>
            <span class="align-val font-mono">${mutation.codonChange || 'N/A'}</span>
          </div>
          <div class="align-box">
            <span class="align-lbl">Protein Substitution</span>
            <span class="align-val text-amber font-mono">${mutation.aminoAcidChange || 'N/A'}</span>
          </div>
          <div class="align-box">
            <span class="align-lbl">Mutation Class</span>
            <span class="align-val badge badge-blue">${mutation.type}</span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render Gene + Mutation Relationship Cascade:
   * Genome -> Gene -> Mutation -> Protein Change -> Resistance Association
   */
  renderGeneMutationRelationship(containerId, mutation) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!mutation) {
      container.innerHTML = `<div class="empty-state">Select a mutation to trace the resistance cascade.</div>`;
      return;
    }

    const gene = AMRState.genes.find(g => g.gene.toLowerCase() === mutation.gene.toLowerCase()) || {
      gene: mutation.gene,
      resistanceClass: 'Multidrug Resistance',
      mechanism: 'Drug Resistance'
    };

    container.innerHTML = `
      <div class="cascade-flow-card">
        <h4 class="cascade-title">
          <span class="icon">🔬</span> Mechanistic Mutation Impact Cascade
        </h4>
        
        <div class="cascade-steps">
          <!-- Step 1: Genome -->
          <div class="cascade-step">
            <div class="step-num">1</div>
            <div class="step-content">
              <div class="step-label">Genomic DNA</div>
              <div class="step-val font-mono">Locus ${mutation.position} bp</div>
              <div class="step-desc">Chromosomal/plasmid DNA contig</div>
            </div>
          </div>

          <div class="cascade-arrow">&darr;</div>

          <!-- Step 2: Target Gene -->
          <div class="cascade-step active-gene">
            <div class="step-num">2</div>
            <div class="step-content">
              <div class="step-label">Target Gene</div>
              <div class="step-val font-mono text-cyan">${mutation.gene}</div>
              <div class="step-desc">${gene.resistanceClass} (${gene.start} - ${gene.end} bp)</div>
            </div>
          </div>

          <div class="cascade-arrow">&darr;</div>

          <!-- Step 3: Mutation -->
          <div class="cascade-step active-mutation">
            <div class="step-num">3</div>
            <div class="step-content">
              <div class="step-label">Nucleotide Variant</div>
              <div class="step-val font-mono text-red">${mutation.ref} &rarr; ${mutation.alt} (${mutation.codonChange})</div>
              <div class="step-desc">Type: ${mutation.type} (${mutation.category})</div>
            </div>
          </div>

          <div class="cascade-arrow">&darr;</div>

          <!-- Step 4: Protein Change -->
          <div class="cascade-step active-protein">
            <div class="step-num">4</div>
            <div class="step-content">
              <div class="step-label">Translational Alteration</div>
              <div class="step-val font-mono text-amber">${mutation.aminoAcidChange}</div>
              <div class="step-desc">${mutation.effect}</div>
            </div>
          </div>

          <div class="cascade-arrow">&darr;</div>

          <!-- Step 5: Potential Resistance Association -->
          <div class="cascade-step active-resistance">
            <div class="step-num">5</div>
            <div class="step-content">
              <div class="step-label">Resistance Interpretation</div>
              <div class="step-val font-mono text-cyan">${mutation.resistanceAssociation}</div>
              <div class="step-desc">${mutation.clinicalSignificance || gene.mechanismDetail}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Initialize 3Dmol viewer or Fallback 3D Canvas Visualizer
   */
  init3DViewer(containerId, pdbId = '4BLM', mutationResidue = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    // Check if $3Dmol exists in global window
    if (window.$3Dmol) {
      try {
        this.render3DmolViewer(container, pdbId, mutationResidue);
        this.is3DmolAvailable = true;
        return;
      } catch (e) {
        console.warn('3Dmol.js initialization threw error, falling back to 3D Canvas simulator', e);
      }
    }

    // Fallback to high-quality interactive Canvas 3D Ribbon simulator
    this.renderFallback3DViewer(container, pdbId, mutationResidue);
  },

  render3DmolViewer(container, pdbId, mutationResidue) {
    container.style.position = 'relative';
    const viewerDiv = document.createElement('div');
    viewerDiv.style.width = '100%';
    viewerDiv.style.height = '100%';
    viewerDiv.style.position = 'relative';
    container.appendChild(viewerDiv);

    const config = { backgroundColor: '#070d18' };
    const viewer = $3Dmol.createViewer(viewerDiv, config);
    this.viewer3D = viewer;

    // Use embedded mock PDB string or fetch real PDB if available
    const pdbData = window.SampleData.mockPdb;
    viewer.addModel(pdbData, 'pdb');
    viewer.setStyle({}, { cartoon: { color: 'spectrum' } });

    // Highlight mutation residue if provided
    if (mutationResidue) {
      viewer.addStyle({ resi: mutationResidue }, { stick: { color: '#ef4444', radius: 0.3 } });
    }

    viewer.zoomTo();
    viewer.render();

    this.setupViewerControls(viewer);
  },

  renderFallback3DViewer(container, pdbId, mutationResidue) {
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth || 500;
    canvas.height = container.clientHeight || 340;
    canvas.className = 'fallback-3d-canvas';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let angleY = 0;
    let angleX = 0.4;
    let zoom = 1.0;
    let isDragging = false;
    let lastX = 0, lastY = 0;

    // Generate alpha-helix / beta-sheet 3D coordinates points
    const points = [];
    const numResidues = 40;
    for (let i = 0; i < numResidues; i++) {
      const t = (i / numResidues) * Math.PI * 4;
      const x = Math.sin(t) * 70;
      const y = (i - numResidues / 2) * 8;
      const z = Math.cos(t) * 70;
      points.push({
        x, y, z,
        resi: i + 1,
        isMutated: i === 18 // simulated mutation site
      });
    }

    function draw() {
      ctx.fillStyle = '#070d18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Rotate points
      const transformed = points.map(p => {
        // Y rotation
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;

        // X rotation
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        const perspective = 400 / (400 + z2);
        return {
          px: cx + x1 * perspective * zoom,
          py: cy + y2 * perspective * zoom,
          depth: z2,
          isMutated: p.isMutated,
          resi: p.resi
        };
      });

      // Sort by depth
      transformed.sort((a, b) => b.depth - a.depth);

      // Draw ribbon backbone
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3 * zoom;
      ctx.lineJoin = 'round';
      for (let i = 0; i < points.length; i++) {
        const pt = transformed.find(p => p.resi === i + 1);
        if (pt) {
          if (i === 0) ctx.moveTo(pt.px, pt.py);
          else ctx.lineTo(pt.px, pt.py);
        }
      }
      ctx.stroke();

      // Draw amino acid residue beads
      transformed.forEach(pt => {
        ctx.beginPath();
        const r = pt.isMutated ? 7 * zoom : 4 * zoom;
        ctx.arc(pt.px, pt.py, Math.max(r, 2), 0, Math.PI * 2);
        if (pt.isMutated) {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = '#38bdf8';
          ctx.shadowBlur = 0;
        }
        ctx.fill();

        if (pt.isMutated) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('MUT SITE (Active Pocket)', pt.px + 10, pt.py - 10);
        }
      });
      ctx.shadowBlur = 0;
    }

    // Interaction listeners
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    window.addEventListener('mouseup', () => isDragging = false);

    canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      angleY += dx * 0.015;
      angleX += dy * 0.015;
      lastX = e.clientX;
      lastY = e.clientY;
      draw();
    });

    // Auto rotate
    let animId;
    function autoLoop() {
      if (!isDragging) {
        angleY += 0.008;
        draw();
      }
      animId = requestAnimationFrame(autoLoop);
    }
    autoLoop();

    // Attach zoom controls
    window.fallback3D = {
      zoomIn: () => { zoom = Math.min(2.5, zoom + 0.2); draw(); },
      zoomOut: () => { zoom = Math.max(0.5, zoom - 0.2); draw(); },
      reset: () => { angleY = 0; angleX = 0.4; zoom = 1.0; draw(); }
    };

    draw();
  },

  setupViewerControls(viewer) {
    // 3Dmol button bindings if loaded
    const resetBtn = document.getElementById('btn-3d-reset');
    const zoomInBtn = document.getElementById('btn-3d-zoomin');
    const zoomOutBtn = document.getElementById('btn-3d-zoomout');
    const rotateBtn = document.getElementById('btn-3d-rotate');
    const styleSelect = document.getElementById('select-3d-style');

    if (resetBtn) {
      resetBtn.onclick = () => {
        if (viewer) { viewer.zoomTo(); viewer.render(); }
        else if (window.fallback3D) window.fallback3D.reset();
      };
    }
    if (zoomInBtn) {
      zoomInBtn.onclick = () => {
        if (viewer) { viewer.zoom(1.2); viewer.render(); }
        else if (window.fallback3D) window.fallback3D.zoomIn();
      };
    }
    if (zoomOutBtn) {
      zoomOutBtn.onclick = () => {
        if (viewer) { viewer.zoom(0.8); viewer.render(); }
        else if (window.fallback3D) window.fallback3D.zoomOut();
      };
    }
    if (rotateBtn) {
      rotateBtn.onclick = () => {
        this.toggleAutoRotate(viewer);
      };
    }
    if (styleSelect) {
      styleSelect.onchange = (e) => {
        const val = e.target.value;
        if (!viewer) return;
        if (val === 'surface') {
          viewer.removeAllSurfaces();
          viewer.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.8, color: 'cyan' });
        } else if (val === 'sphere') {
          viewer.removeAllSurfaces();
          viewer.setStyle({}, { sphere: { scale: 0.3 } });
        } else {
          viewer.removeAllSurfaces();
          viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
        }
        viewer.render();
      };
    }
  },

  toggleAutoRotate(viewer) {
    if (this.isRotating) {
      clearInterval(this.autoRotateInterval);
      this.isRotating = false;
    } else {
      this.isRotating = true;
      this.autoRotateInterval = setInterval(() => {
        if (viewer) {
          viewer.rotate(1.5, { x: 0, y: 1, z: 0 });
          viewer.render();
        }
      }, 30);
    }
  }
};

// Global helper for SVG click interactions
window.selectGeneFromVisualizer = function (geneId) {
  AMRState.selectGene(geneId);
  if (window.AMRAnalysis && window.AMRAnalysis.onGeneSelected) {
    window.AMRAnalysis.onGeneSelected(AMRState.selectedGene);
  }
  AMRVisualizer.renderGeneLocationBar('gene-location-bar-container', AMRState.selectedGene);
};

window.selectMutationFromVisualizer = function (mutationId) {
  AMRState.selectMutation(mutationId);
  if (window.AMRMutation && window.AMRMutation.onMutationSelected) {
    window.AMRMutation.onMutationSelected(AMRState.selectedMutation);
  }
  AMRVisualizer.renderExactMutationPosition('exact-mutation-track-container', AMRState.selectedMutation);
  AMRVisualizer.renderGeneMutationRelationship('gene-mutation-cascade-container', AMRState.selectedMutation);
};
