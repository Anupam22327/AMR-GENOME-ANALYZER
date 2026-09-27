/**
 * AMR-GENOME ANALYZER - Sample Demonstration Dataset
 * Antimicrobial Resistance & Mutation Analysis Platform
 * 
 * DISCLAIMER: Demonstration dataset for educational and bioinformatics student project use.
 * Not for clinical diagnostic or treatment decision making.
 */

const SAMPLE_AMR_GENES = [
  {
    id: "AMR-GENE-001",
    gene: "blaCTX-M-15",
    name: "blaCTX-M-15",
    resistanceClass: "Beta-lactam",
    antibiotic: "Ceftriaxone, Cefotaxime, Ceftazidime, Aztreonam",
    mechanism: "Drug inactivation",
    mechanismDetail: "Extended-spectrum beta-lactamase (ESBL) Class A enzyme that hydrolyzes third-generation cephalosporins and monobactams.",
    start: 1200,
    end: 2075,
    length: 876,
    strand: "+",
    identity: 99.8,
    coverage: 100.0,
    confidence: "High",
    pdbId: "4BLM",
    description: "Extended-spectrum beta-lactamase conferring high-level resistance to third-generation cephalosporins and monobactams.",
    pathway: "Hydrolytic cleavage of cyclic beta-lactam amide bond -> Inactivated open acyl-enzyme complex -> Loss of antibacterial efficacy."
  },
  {
    id: "AMR-GENE-002",
    gene: "blaTEM-1",
    name: "blaTEM-1",
    resistanceClass: "Beta-lactam",
    antibiotic: "Ampicillin, Amoxicillin, Piperacillin",
    mechanism: "Drug inactivation",
    mechanismDetail: "Class A plasmid-mediated beta-lactamase enzyme that hydrolyzes penicillins and early cephalosporins.",
    start: 3100,
    end: 3960,
    length: 861,
    strand: "-",
    identity: 100.0,
    coverage: 100.0,
    confidence: "High",
    pdbId: "1BTL",
    description: "Narrow-spectrum beta-lactamase conferring resistance to aminopenicillins and carboxypenicillins.",
    pathway: "Penicillin acyl-enzyme intermediate hydrolysis -> Inactive penicilloic acid generation."
  },
  {
    id: "AMR-GENE-003",
    gene: "mecA",
    name: "mecA",
    resistanceClass: "Beta-lactam",
    antibiotic: "Methicillin, Oxacillin, Nafcillin, Cefoxitin",
    mechanism: "Target modification",
    mechanismDetail: "Encodes low-affinity penicillin-binding protein PBP2a, sustaining peptidoglycan crosslinking under high beta-lactam pressure.",
    start: 5000,
    end: 7006,
    length: 2007,
    strand: "+",
    identity: 99.5,
    coverage: 100.0,
    confidence: "High",
    pdbId: "1VQQ",
    description: "Methicillin resistance determinant encoding penicillin-binding protein 2a (PBP2a).",
    pathway: "Allosteric conformational resistance -> Low acylation efficiency by beta-lactams -> Continuous transpeptidation."
  },
  {
    id: "AMR-GENE-004",
    gene: "tetA",
    name: "tetA",
    resistanceClass: "Tetracycline",
    antibiotic: "Tetracycline, Doxycycline, Minocycline",
    mechanism: "Efflux pump",
    mechanismDetail: "Major Facilitator Superfamily (MFS) proton-antiporter active efflux pump that expels tetracycline from bacterial cytoplasm.",
    start: 7800,
    end: 8996,
    length: 1197,
    strand: "+",
    identity: 98.9,
    coverage: 100.0,
    confidence: "High",
    pdbId: "4L1A",
    description: "Inner-membrane antiporter protein conferring active extrusion of tetracycline antibiotics.",
    pathway: "Electrochemical proton gradient coupling -> Translocation of divalent cation-chelated tetracycline -> Sub-inhibitory intracellular concentration."
  },
  {
    id: "AMR-GENE-005",
    gene: "ermB",
    name: "ermB",
    resistanceClass: "Macrolide-Lincosamide-Streptogramin B",
    antibiotic: "Erythromycin, Azithromycin, Clindamycin",
    mechanism: "Target modification",
    mechanismDetail: "N(6)-adenine-specific methyltransferase that dimethylates A2058 of 23S rRNA in the 50S ribosomal subunit.",
    start: 9600,
    end: 10334,
    length: 735,
    strand: "-",
    identity: 99.1,
    coverage: 100.0,
    confidence: "High",
    pdbId: "1YUB",
    description: "Ribosomal RNA methyltransferase conferring macrolide, lincosamide, and streptogramin B resistance.",
    pathway: "S-adenosylmethionine (SAM)-dependent monomethylation/dimethylation of A2058 -> Steric hindrance of antibiotic binding pocket in nascent peptide exit tunnel."
  },
  {
    id: "AMR-GENE-006",
    gene: "sul1",
    name: "sul1",
    resistanceClass: "Sulfonamide",
    antibiotic: "Sulfamethoxazole, Sulfadiazine, Trimethoprim-Sulfamethoxazole",
    mechanism: "Target replacement",
    mechanismDetail: "Integron-associated sulfonamide-resistant dihydropteroate synthase (DHPS) that bypasses sulfonamide inhibition.",
    start: 11100,
    end: 11939,
    length: 840,
    strand: "+",
    identity: 99.6,
    coverage: 100.0,
    confidence: "High",
    pdbId: "3TZF",
    description: "Sulfonamide-resistant dihydropteroate synthase bypassing folic acid pathway inhibition.",
    pathway: "Altered PABA-binding pocket -> Preserved affinity for p-aminobenzoic acid with drastically reduced affinity for sulfonamides -> Continuous folate synthesis."
  },
  {
    id: "AMR-GENE-007",
    gene: "qnrS1",
    name: "qnrS1",
    resistanceClass: "Fluoroquinolone",
    antibiotic: "Ciprofloxacin, Levofloxacin, Norfloxacin",
    mechanism: "Target protection",
    mechanismDetail: "Pentapeptide repeat protein that physically binds DNA gyrase and topoisomerase IV, shielding them from quinolone inhibition.",
    start: 12500,
    end: 13153,
    length: 654,
    strand: "+",
    identity: 100.0,
    coverage: 100.0,
    confidence: "High",
    pdbId: "2W7Z",
    description: "Plasmid-mediated quinolone resistance protein providing low-level resistance and promoting higher-level mutational resistance.",
    pathway: "Direct interaction with GyrA/GyrB holoenzyme -> Reduced cleavage complex stabilization by quinolones -> Preservation of DNA replication fork progression."
  },
  {
    id: "AMR-GENE-008",
    gene: "vanA",
    name: "vanA",
    resistanceClass: "Glycopeptide",
    antibiotic: "Vancomycin, Teicoplanin",
    mechanism: "Target modification",
    mechanismDetail: "D-alanine--D-lactate ligase that synthesizes peptidoglycan precursors terminating in D-Ala-D-Lac instead of D-Ala-D-Ala.",
    start: 14000,
    end: 15031,
    length: 1032,
    strand: "+",
    identity: 99.4,
    coverage: 100.0,
    confidence: "High",
    pdbId: "1E4E",
    description: "Vancomycin-resistance operon enzyme modifying cell wall peptidoglycan target.",
    pathway: "Replacement of amide link with ester link -> Elimination of one critical hydrogen bond -> 1000-fold reduction in vancomycin binding affinity."
  },
  {
    id: "AMR-GENE-009",
    gene: "gyrA",
    name: "gyrA",
    resistanceClass: "Fluoroquinolone",
    antibiotic: "Ciprofloxacin, Ofloxacin, Moxifloxacin",
    mechanism: "Target modification",
    mechanismDetail: "Chromosomal DNA gyrase subunit A featuring QRDR mutations reducing quinolone binding affinity.",
    start: 16000,
    end: 18625,
    length: 2626,
    strand: "+",
    identity: 99.7,
    coverage: 100.0,
    confidence: "High",
    pdbId: "1AB4",
    description: "Type II DNA topoisomerase essential for DNA replication, containing key QRDR mutation hotspot.",
    pathway: "Mutation at Ser83/Asp87 -> Loss of non-covalent water-metal ion bridge anchor between quinolone and DNA gyrase -> High-level resistance."
  }
];

const SAMPLE_MUTATIONS = [
  {
    id: "MUT-001",
    gene: "blaCTX-M-15",
    position: 1440,
    ref: "G",
    alt: "A",
    type: "Missense",
    category: "SNP",
    codonChange: "GAC -> AAC",
    aminoAcidChange: "Asp240Asn",
    effect: "Missense variant in active site omega loop; expands substrate profile towards ceftazidime",
    resistanceAssociation: "Known resistance-associated",
    evidence: "High",
    clinicalSignificance: "Demonstrated enhancement of third-generation cephalosporin minimum inhibitory concentrations (MIC)",
    geneRegion: "1200-2075 bp"
  },
  {
    id: "MUT-002",
    gene: "blaCTX-M-15",
    position: 1820,
    ref: "C",
    alt: "T",
    type: "Synonymous",
    category: "SNP",
    codonChange: "CGC -> CGT",
    aminoAcidChange: "Arg306Arg",
    effect: "Silent mutation; no change in translated amino acid sequence",
    resistanceAssociation: "Unknown significance",
    evidence: "Neutral",
    clinicalSignificance: "No observable effect on beta-lactamase enzyme activity or kinetic parameters",
    geneRegion: "1200-2075 bp"
  },
  {
    id: "MUT-003",
    gene: "mecA",
    position: 5820,
    ref: "G",
    alt: "A",
    type: "Missense",
    category: "SNP",
    codonChange: "GTC -> ATC",
    aminoAcidChange: "Val274Ile",
    effect: "Non-synonymous substitution in transpeptidase domain of PBP2a",
    resistanceAssociation: "Known resistance-associated",
    evidence: "High",
    clinicalSignificance: "Correlated with elevated oxacillin/methicillin MICs in clinical MRSA isolates",
    geneRegion: "5000-7006 bp"
  },
  {
    id: "MUT-004",
    gene: "mecA",
    position: 6315,
    ref: "C",
    alt: "T",
    type: "Missense",
    category: "SNP",
    codonChange: "CCA -> TCA",
    aminoAcidChange: "Pro439Ser",
    effect: "Structural loop substitution near beta-lactam binding pocket",
    resistanceAssociation: "Potentially associated",
    evidence: "Moderate",
    clinicalSignificance: "Reported in ceftaroline-resistant lineages with compensatory allosteric shifts",
    geneRegion: "5000-7006 bp"
  },
  {
    id: "MUT-005",
    gene: "tetA",
    position: 8245,
    ref: "A",
    alt: "G",
    type: "Missense",
    category: "SNP",
    codonChange: "AAA -> AGA",
    aminoAcidChange: "Lys149Arg",
    effect: "Transmembrane helix alpha-5 charge preservation mutant",
    resistanceAssociation: "Potentially associated",
    evidence: "Moderate",
    clinicalSignificance: "Maintains robust proton-motive force driven tetracycline efflux",
    geneRegion: "7800-8996 bp"
  },
  {
    id: "MUT-006",
    gene: "tetA",
    position: 8820,
    ref: "T",
    alt: "-",
    type: "Frameshift",
    category: "Deletion",
    codonChange: "TTC -> TC-",
    aminoAcidChange: "Phe340fs",
    effect: "Single-base deletion inducing downstream reading frame disruption",
    resistanceAssociation: "Potentially associated",
    evidence: "Moderate",
    clinicalSignificance: "May truncate C-terminal domain of the MFS transporter altering stability",
    geneRegion: "7800-8996 bp"
  },
  {
    id: "MUT-007",
    gene: "ermB",
    position: 10012,
    ref: "C",
    alt: "A",
    type: "Nonsense",
    category: "SNP",
    codonChange: "TCA -> TAA",
    aminoAcidChange: "Ser138Stop",
    effect: "Introduction of premature translation termination codon",
    resistanceAssociation: "Known resistance-associated",
    evidence: "High",
    clinicalSignificance: "Loss-of-function mutation leading to truncated non-functional methyltransferase polypeptide",
    geneRegion: "9600-10334 bp"
  },
  {
    id: "MUT-008",
    gene: "vanA",
    position: 14560,
    ref: "C",
    alt: "T",
    type: "Missense",
    category: "SNP",
    codonChange: "CCC -> TCC",
    aminoAcidChange: "Pro187Ser",
    effect: "Conserved ATP-binding loop alteration in D-Ala:D-Lac ligase",
    resistanceAssociation: "Known resistance-associated",
    evidence: "High",
    clinicalSignificance: "Confers high-level vancomycin and teicoplanin resistance phenotype (VanA operon)",
    geneRegion: "14000-15031 bp"
  },
  {
    id: "MUT-009",
    gene: "gyrA",
    position: 16248,
    ref: "C",
    alt: "T",
    type: "Missense",
    category: "SNP",
    codonChange: "TCG -> TTG",
    aminoAcidChange: "Ser83Leu",
    effect: "Canonical Quinolone Resistance-Determining Region (QRDR) point mutation",
    resistanceAssociation: "Known resistance-associated",
    evidence: "High",
    clinicalSignificance: "Abolishes hydrogen bonding between quinolone keto-acid group and water-metal ion bridge, conferring marked fluoroquinolone resistance",
    geneRegion: "16000-18625 bp"
  },
  {
    id: "MUT-010",
    gene: "gyrA",
    position: 16260,
    ref: "G",
    alt: "A",
    type: "Missense",
    category: "SNP",
    codonChange: "GAC -> AAC",
    aminoAcidChange: "Asp87Asn",
    effect: "Second critical QRDR residue substitution",
    resistanceAssociation: "Known resistance-associated",
    evidence: "High",
    clinicalSignificance: "Acts synergistically with Ser83Leu to generate clinical ciprofloxacin non-susceptibility",
    geneRegion: "16000-18625 bp"
  },
  {
    id: "MUT-011",
    gene: "gyrA",
    position: 17105,
    ref: "-",
    alt: "GCC",
    type: "Insertion",
    category: "Insertion",
    codonChange: "--- -> GCC",
    aminoAcidChange: "+Ala369",
    effect: "In-frame 3-bp triplet insertion encoding additional Alanine in variable surface loop",
    resistanceAssociation: "Demonstration mutation",
    evidence: "Neutral",
    clinicalSignificance: "Demonstration structural variant; does not disrupt active site tyrosine (Tyr122) or primary catalytic cleft",
    geneRegion: "16000-18625 bp"
  }
];

// Pre-generated 20,000 bp fasta sequence for offline / zero-network load
const SAMPLE_DEMO_FASTA_HEADER = ">AMR_REF_DEMO_01 | Synthetic Multidrug Resistant Reference Genome Fragment | Length=20000bp | Organism=Klebsiella pneumoniae demonstration strain";

/**
 * Generate reproducible sequence string for the demo dataset
 */
function generateDemoSequence() {
  let seq = "";
  const pattern = "AGCTGACCAGTCAGCTGATCGATCGATCAGGCTAGCTAGCATCGATCGATCGATCGATCGATCGATCGATC";
  while (seq.length < 20000) {
    seq += pattern;
  }
  seq = seq.substring(0, 20000);
  
  // Specific base insertions at exact positions (0-indexed)
  const chars = seq.split("");
  chars[1440 - 1] = "G";
  chars[1820 - 1] = "C";
  chars[5820 - 1] = "G";
  chars[6315 - 1] = "C";
  chars[8245 - 1] = "A";
  chars[8820 - 1] = "T";
  chars[10012 - 1] = "C";
  chars[14560 - 1] = "C";
  chars[16248 - 1] = "C";
  chars[16260 - 1] = "G";
  return chars.join("");
}

const SAMPLE_DEMO_SEQUENCE = generateDemoSequence();

/**
 * Minimal embedded PDB coordinates representing an alpha-helix beta-sheet catalytic domain
 * for offline molecular visualization when external network or 3Dmol CDN is limited.
 */
const EMBEDDED_PDB_MOCK = `HEADER    AMR CATALYTIC DOMAIN DEMONSTRATION      26-SEP-26   1AMR              
COMPND    MOL_ID: 1; MOLECULE: BETA-LACTAMASE RESISTANCE FRAGMENT; CHAIN: A;
ATOM      1  N   ASP A   1      11.104  13.207  10.000  1.00 20.00           N
ATOM      2  CA  ASP A   1      12.000  14.200  10.500  1.00 20.00           C
ATOM      3  C   ASP A   1      13.400  13.800  10.200  1.00 20.00           C
ATOM      4  O   ASP A   1      13.800  12.700  10.500  1.00 20.00           O
ATOM      5  N   VAL A   2      14.200  14.700   9.600  1.00 20.00           N
ATOM      6  CA  VAL A   2      15.600  14.500   9.300  1.00 20.00           C
ATOM      7  C   VAL A   2      16.400  15.700   9.800  1.00 20.00           C
ATOM      8  O   VAL A   2      16.000  16.800   9.600  1.00 20.00           O
ATOM      9  N   SER A   3      17.500  15.400  10.500  1.00 20.00           N
ATOM     10  CA  SER A   3      18.400  16.400  11.000  1.00 20.00           C
ATOM     11  C   SER A   3      19.200  17.000   9.900  1.00 20.00           C
ATOM     12  O   SER A   3      19.000  18.100   9.500  1.00 20.00           O
ATOM     13  N   LYS A   4      20.200  16.300   9.400  1.00 20.00           N
ATOM     14  CA  LYS A   4      21.100  16.800   8.400  1.00 20.00           C
ATOM     15  C   LYS A   4      21.900  17.900   9.000  1.00 20.00           C
ATOM     16  O   LYS A   4      22.200  18.900   8.300  1.00 20.00           O
ATOM     17  N   ILE A   5      22.300  17.700  10.200  1.00 20.00           N
ATOM     18  CA  ILE A   5      23.100  18.600  10.900  1.00 20.00           C
ATOM     19  C   ILE A   5      24.400  18.000  11.400  1.00 20.00           C
ATOM     20  O   ILE A   5      24.600  16.800  11.500  1.00 20.00           O
ATOM     21  N   LEU A   6      25.300  18.900  11.800  1.00 20.00           N
ATOM     22  CA  LEU A   6      26.600  18.500  12.300  1.00 20.00           C
ATOM     23  C   LEU A   6      27.500  19.700  12.600  1.00 20.00           C
ATOM     24  O   LEU A   6      27.100  20.800  12.400  1.00 20.00           O
ATOM     25  N   GLY A   7      28.700  19.400  13.100  1.00 20.00           N
ATOM     26  CA  GLY A   7      29.700  20.400  13.400  1.00 20.00           C
ATOM     27  C   GLY A   7      30.500  20.100  14.600  1.00 20.00           C
ATOM     28  O   GLY A   7      30.800  18.900  14.900  1.00 20.00           O
ATOM     29  N   THR A   8      30.900  21.200  15.300  1.00 20.00           N
ATOM     30  CA  THR A   8      31.700  21.100  16.500  1.00 20.00           C
ATOM     31  C   THR A   8      33.000  20.400  16.100  1.00 20.00           C
ATOM     32  O   THR A   8      33.200  19.200  16.300  1.00 20.00           O
TER      33      THR A   8                                                      
END`;

// Export for usage in window or modular JS
window.SampleData = {
  genes: SAMPLE_AMR_GENES,
  mutations: SAMPLE_MUTATIONS,
  header: SAMPLE_DEMO_FASTA_HEADER,
  sequence: SAMPLE_DEMO_SEQUENCE,
  fastaString: `${SAMPLE_DEMO_FASTA_HEADER}\n${SAMPLE_DEMO_SEQUENCE.match(/.{1,80}/g).join("\n")}`,
  mockPdb: EMBEDDED_PDB_MOCK,
  
  getGenes() {
    return JSON.parse(JSON.stringify(SAMPLE_AMR_GENES));
  },
  
  getMutations() {
    return JSON.parse(JSON.stringify(SAMPLE_MUTATIONS));
  },
  
  getGeneById(id) {
    return SAMPLE_AMR_GENES.find(g => g.id === id || g.gene === id);
  },
  
  getMutationById(id) {
    return SAMPLE_MUTATIONS.find(m => m.id === id);
  },
  
  getMutationsByGene(geneName) {
    return SAMPLE_MUTATIONS.filter(m => m.gene.toLowerCase() === geneName.toLowerCase());
  }
};
