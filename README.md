# AMR-GENOME ANALYZER
### Antimicrobial Resistance & Mutation Analysis Platform
**Bioinformatics • Genomics • AMR Analysis**

---

## 1. Project Overview

**AMR-GENOME ANALYZER** is a professional client-side bioinformatics web application designed for biotechnology and bioinformatics students, academic researchers, and educators. It demonstrates a complete, step-by-step genomic analysis pipeline for detecting antimicrobial resistance (AMR) genes, single nucleotide variants (SNVs), codon changes, amino acid substitutions, and structural impacts from bacterial whole-genome sequence data.

The application operates **100% client-side** using modern web standards (HTML5, CSS3, Vanilla ES6+ JavaScript), requiring **zero backend installations** (no Python, Node.js, Docker, or external server runtime required). It runs instantly by double-clicking `index.html` or launching with VS Code Live Server.

---

## 2. Core Features

- **End-to-End Bioinformatics Workflow**:
  - DNA/Genome Sequence Input (FASTA upload or text paste).
  - Sequence Quality & Basic Statistics (Length, A/T/G/C/N counts, GC% and AT% sliding metrics).
  - AMR Gene Detection across major antibiotic families with sequence coordinates, identity, coverage, and confidence levels.
  - Variant & Mutation Detection (SNPs, Missense, Synonymous, Nonsense, Frameshift, Indels).
  - Dynamic Exact Mutation Position Visualizer with nucleotide callout arrows and gene zoom.
  - Mechanistic Cascade Diagram: `Genome → Gene → Mutation → Protein Alteration → Phenotypic Resistance`.
  - Interactive 3D Protein / Mutation Visualizer (powered by 3Dmol.js with an offline Canvas fallback) highlighting active-site mutation residues.
  - Dynamic Surveillance Dashboard with Chart.js analytics and high-priority pathogen resistance alerts.
  - Comprehensive Printable Synthesis Report with dynamic clinical findings and multi-page print stylesheet.

---

## 3. Technology Stack

- **Markup & Semantics**: HTML5 (Accessible, semantic elements, ARIA attributes).
- **Styling & UI Design**: CSS3 (CSS Custom Properties, Glassmorphism, Dark Navy scientific theme, Responsive Flexbox & CSS Grid).
- **Programming Language**: Vanilla JavaScript (ES6+ Modules, Object-Oriented State Management, Event-Driven Architecture).
- **Data Visualization**:
  - [Chart.js](https://www.chartjs.org/) (Doughnut, Bar, Polar Area, and Pie charts).
  - [3Dmol.js](https://3dmol.csb.pitt.edu/) (WebGL molecular visualization for macromolecular tertiary structures) + Custom 2D/3D Canvas fallback simulator.
- **Storage**: Browser LocalStorage & SessionStorage synchronization for persistent session state.

---

## 4. Project Folder Structure

```
AMR-GENOME-ANALYZER/
│
├── index.html                   # Landing page with workflow pipeline and feature cards
├── dashboard.html               # Real-time surveillance dashboard with KPI metrics & charts
├── analysis.html                # FASTA input, AMR gene detection, and mutation workbench
├── results.html                 # Comprehensive report generation and print/PDF export
│
├── css/
│   ├── style.css                # Global design system, glass cards, buttons, badges, tables
│   ├── dashboard.css            # Dashboard layout, locus bars, mutation tracks, 3D viewport
│   └── responsive.css           # Breakpoints for mobile, tablet, laptop, and desktop
│
├── js/
│   ├── app.js                   # Application state manager (AMRState) & UI notification system
│   ├── dashboard.js             # Dashboard controller & Chart.js instances
│   ├── analysis.js              # FASTA parser, nucleotide statistics & AMR table filters
│   ├── mutation.js              # Mutation analysis engine & exact position pointer bindings
│   ├── visualization.js         # Interactive SVG genome tracks, cascade flows & 3Dmol viewer
│   └── sampleData.js            # Curated reference genes, verified mutations & fallback data
│
├── data/
│   ├── sample_genome.fasta      # Verified 20,000 bp synthetic MDR reference sequence
│   ├── sample_amr_genes.json    # Reference AMR determinants with genomic bounds
│   └── sample_mutations.json    # Verified point mutations with codon & amino acid changes
│
├── assets/
│   └── images/                  # Application graphic assets
│
└── README.md                    # Comprehensive scientific documentation
```

---

## 5. How to Run the Application

### Option A: Direct Browser Launch (Simplest)
1. Download or navigate to the `AMR-GENOME-ANALYZER` folder.
2. Double-click `index.html` to open it in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.
3. The platform will immediately initialize using embedded demonstration data with zero server prerequisites.

### Option B: VS Code Live Server
1. Open the `AMR-GENOME-ANALYZER` directory in Visual Studio Code.
2. Install the **Live Server** extension (Ritwick Dey) if not already installed.
3. Right-click `index.html` and select **"Open with Live Server"**.
4. The application will serve at `http://127.0.0.1:5500/index.html`.

---

## 6. How to Use FASTA Input & Analysis

1. Navigate to the **Genome Analysis** page (`analysis.html`).
2. Supply a sequence using either:
   - **Upload**: Drag-and-drop a `.fasta`, `.fa`, `.fna`, or `.txt` file into the upload zone.
   - **Paste**: Paste a raw FASTA sequence into the text area.
   - **Demo Button**: Click `[LOAD DEMO FASTA]` to populate the validated 20,000 bp multidrug-resistant sequence.
3. Click `[ANALYZE GENOME]`.
4. The system validates that all non-header lines contain strictly DNA nucleotide characters (`A`, `T`, `G`, `C`, `N`) and strips whitespace and carriage returns.
5. The 8-step pipeline executes, updating GC content, base frequency, AMR gene positions, and single nucleotide variants.

---

## 7. How AMR Demonstration Detection & Mutation Mapping Work

### A. Demonstration AMR Detection
- The platform scans open reading frames against an annotated reference database of major AMR genes:
  - **Beta-lactamases**: `blaCTX-M-15` (ESBL), `blaTEM-1`
  - **Target Alterations**: `mecA` (PBP2a), `gyrA` (DNA Gyrase QRDR), `ermB` (23S rRNA methyltransferase), `vanA` (D-Ala-D-Lac ligase)
  - **Efflux Transporters**: `tetA` (MFS proton antiporter)
  - **Target Protection**: `qnrS1` (Pentapeptide repeat topoisomerase protection)
  - **Target Bypass**: `sul1` (Sulfa-resistant DHPS)
- Each detected gene is plotted with its exact forward (`+`) or reverse (`-`) strand coordinates, sequence identity percentage, and coverage.

### B. Dynamic Mutation Position Visualizer
- When a mutation is selected in the Mutation Analysis table:
  1. The **Macro Genome Context** pinpoints where the target gene sits within the total genome contig.
  2. The **Zoomed Gene Region Track** computes the exact relative position inside the coding sequence (e.g. position `1440 bp` inside `blaCTX-M-15` or `16248 bp` inside `gyrA`).
  3. A dynamic indicator needle (`▲ / ▼`) slides to the exact nucleotide coordinate.
  4. The **Micro-Alignment Grid** displays the reference base (`Ref`), mutant base (`Alt`), codon substitution (e.g. `TCG → TTG`), and translated protein variant (e.g. `Ser83Leu`).
  5. The **Mechanistic Cascade** traces the biological trajectory:
     $$\text{DNA Locus} \longrightarrow \text{Target Gene} \longrightarrow \text{Nucleotide Mutation} \longrightarrow \text{Amino Acid Change} \longrightarrow \text{Resistance Phenotype}$$

### C. 3D Molecular / Protein Visualizer
- Loads macromolecular PDB coordinates into a WebGL viewport via **3Dmol.js**.
- Highlights active site mutation residues (e.g. Residue 240 in blaCTX-M-15 or Residue 83 in GyrA) in contrasting colors.
- Features controls for Auto-Rotation, Zoom, Camera Reset, and representation switching (Cartoon Ribbon, Molecular Surface, Space-Filling Spheres).
- If offline or WebGL is unavailable, a built-in interactive Canvas 3D ribbon simulator activates automatically.

---

## 8. Example Workflow Walkthrough

1. **Landing Page (`index.html`)**: Click `[START ANALYSIS]` or `[LOAD DEMO DATA]`.
2. **Dashboard (`dashboard.html`)**: Inspect high-level metrics (Total Genes, AMR Genes Detected, Resistance Classes, Mutations).
3. **Genome Analysis (`analysis.html`)**:
   - Inspect GC content and nucleotide frequency chart.
   - Click `[Details]` on `blaCTX-M-15` to open the gene detail modal with biochemical hydrolysis mechanism and locus coordinates.
4. **Mutation Analysis (`analysis.html#mutation-section`)**:
   - Click Mutation `MUT-009` (`gyrA` Ser83Leu).
   - Observe the needle position update to `16,248 bp`.
   - Review the QRDR fluoroquinolone binding disruption cascade.
   - Inspect the 3D model highlighting the mutation residue.
5. **Final Report (`results.html`)**:
   - Review dynamically generated Important Findings.
   - Click `[🖨️ Download / Print Report]` to print or save a clean PDF.

---

## 9. Academic & Scientific Disclaimer

> [!IMPORTANT]
> **This application is an educational bioinformatics demonstration.** Results generated using demonstration or reference datasets must **NOT** be interpreted as clinical diagnosis, medical guidance, or validated antimicrobial susceptibility testing (AST).

> [!NOTE]
> Validated AMR surveillance pipelines normally require curated reference databases (e.g., NCBI AMRFinderPlus, CARD, ResFinder, ARG-ANNOT) and established alignment software (such as BLAST+, Diamond, Bowtie2, or HMMER).

---

## 10. Future Improvements & Production Extensions

For a future production-grade deployment, the following extensions can be integrated:

1. **NCBI AMRFinderPlus & CARD (Comprehensive Antibiotic Resistance Database) API Integration**: Live REST API lookups for newly characterized alleles and ARO (Antibiotic Resistance Ontology) numbers.
2. **WebAssembly BLAST+ / Diamond Pipeline**: Embedding compiled WebAssembly (Wasm) BLAST algorithms directly inside the browser for client-side local alignment against massive multi-gigabyte databases.
3. **VCF & BAM Variant Calling Support**: Direct upload and parsing of Variant Call Format (`.vcf`) and binary alignment (`.bam`) files generated by Illumina, Oxford Nanopore, or PacBio sequencers.
4. **Machine Learning Resistance Phenotype Prediction**: Client-side TensorFlow.js or ONNX models trained on matched genotype-MIC (Minimum Inhibitory Concentration) datasets.
5. **RCSB PDB Live Structure Fetching**: Direct integration with RCSB PDB and AlphaFold Protein Structure Database APIs.
6. **Full-Spectrum Annotation Pipeline**: Integration of GFF3 annotation parsing and Prokka/Bakta open reading frame calling.
7. **Cloud Persistence & Collaborative Profiles**: User authentication, project workspace saving, and multi-sample cohort comparative epidemiology.

---

## 11. License & Academic Attribution

Created for bioinformatics education and academic demonstration. Open for academic adaptation, student coursework, and scientific teaching workshops.
#   A M R - G E N O M E - A N A L Y Z E R  
 