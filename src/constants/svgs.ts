export const molecularSvgs: Record<string, string> = {
  atorvastatin: `
    <svg class="w-full h-full text-on-surface" viewBox="0 0 340 100">
      <polygon points="60,30 85,15 110,30 110,60 85,75 60,60" fill="none" stroke="#291714" stroke-width="2"></polygon>
      <polygon points="85,22 103,33 103,57 85,68 67,57 67,33" fill="none" stroke="#ea1d20" stroke-width="1" stroke-dasharray="2,2"></polygon>
      <line x1="110" y1="45" x2="145" y2="45" stroke="#291714" stroke-width="2.5"></line>
      <circle cx="145" cy="45" r="4" fill="#bb000f"></circle>
      <line x1="145" y1="45" x2="175" y2="25" stroke="#291714" stroke-width="2"></line>
      <line x1="175" y1="25" x2="205" y2="45" stroke="#291714" stroke-width="2"></line>
      <line x1="205" y1="45" x2="205" y2="70" stroke="#bb000f" stroke-width="2"></line>
      <text x="200" y="85" fill="#bb000f" font-family="JetBrains Mono" font-size="10" font-weight="bold">-OH</text>
      <line x1="205" y1="45" x2="235" y2="25" stroke="#291714" stroke-width="2"></line>
      <line x1="235" y1="25" x2="265" y2="45" stroke="#291714" stroke-width="2"></line>
      <line x1="265" y1="45" x2="265" y2="70" stroke="#bb000f" stroke-width="2"></line>
      <text x="260" y="85" fill="#bb000f" font-family="JetBrains Mono" font-size="10" font-weight="bold">-OH</text>
      <line x1="265" y1="45" x2="295" y2="30" stroke="#291714" stroke-width="2"></line>
      <text x="298" y="34" fill="#291714" font-family="JetBrains Mono" font-size="10" font-weight="bold">-COOH</text>
      <line x1="60" y1="45" x2="35" y2="45" stroke="#0079c4" stroke-width="2"></line>
      <text x="22" y="49" fill="#0079c4" font-family="JetBrains Mono" font-size="11" font-weight="bold">-F</text>
    </svg>
  `,
  metformin: `
    <svg class="w-full h-full text-on-surface" viewBox="0 0 340 100">
      <text x="30" y="55" fill="#291714" font-family="JetBrains Mono" font-size="13" font-weight="bold">(CH3)2N</text>
      <line x1="95" y1="50" x2="125" y2="50" stroke="#291714" stroke-width="2.5"></line>
      <text x="130" y="55" fill="#bb000f" font-family="JetBrains Mono" font-size="12" font-weight="bold">C(=NH)</text>
      <line x1="180" y1="50" x2="205" y2="50" stroke="#291714" stroke-width="2.5"></line>
      <text x="210" y="55" fill="#291714" font-family="JetBrains Mono" font-size="12" font-weight="bold">NH</text>
      <line x1="235" y1="50" x2="255" y2="50" stroke="#291714" stroke-width="2.5"></line>
      <text x="260" y="55" fill="#bb000f" font-family="JetBrains Mono" font-size="12" font-weight="bold">C(=NH)NH2</text>
      <text x="180" y="85" fill="#0079c4" font-family="JetBrains Mono" font-size="11" font-weight="bold">· HCl (Hidroklorür Tuzu)</text>
    </svg>
  `,
  amoxicillin: `
    <svg class="w-full h-full text-on-surface" viewBox="0 0 340 100">
      <!-- Benzene with OH -->
      <polygon points="35,45 50,30 75,30 90,45 75,60 50,60" fill="none" stroke="#291714" stroke-width="2"></polygon>
      <line x1="35" y1="45" x2="15" y2="45" stroke="#bb000f" stroke-width="2"></line>
      <text x="0" y="49" fill="#bb000f" font-family="JetBrains Mono" font-size="10" font-weight="bold">HO-</text>
      <!-- Alpha carbon with NH2 -->
      <line x1="90" y1="45" x2="120" y2="45" stroke="#291714" stroke-width="2"></line>
      <circle cx="120" cy="45" r="3" fill="#291714"></circle>
      <line x1="120" y1="45" x2="120" y2="25" stroke="#0079c4" stroke-width="2"></line>
      <text x="110" y="20" fill="#0079c4" font-family="JetBrains Mono" font-size="9" font-weight="bold">-NH2</text>
      <!-- Beta-lactam core -->
      <line x1="120" y1="45" x2="150" y2="45" stroke="#291714" stroke-width="2"></line>
      <rect x="150" y="32" width="28" height="28" fill="none" stroke="#bb000f" stroke-width="2.5"></rect>
      <!-- Thiazolidine ring -->
      <polygon points="178,32 208,25 218,46 205,60 178,60" fill="none" stroke="#291714" stroke-width="2"></polygon>
      <text x="210" y="42" fill="#d97706" font-family="JetBrains Mono" font-size="10" font-weight="bold">S</text>
      <!-- Carboxylic group -->
      <line x1="205" y1="60" x2="225" y2="75" stroke="#291714" stroke-width="2"></line>
      <text x="230" y="82" fill="#291714" font-family="JetBrains Mono" font-size="10" font-weight="bold">-COOH</text>
      <text x="145" y="85" fill="#bb000f" font-family="JetBrains Mono" font-size="9" font-weight="bold">Beta-Laktam Halkası</text>
    </svg>
  `,
  ibuprofen: `
    <svg class="w-full h-full text-on-surface" viewBox="0 0 340 100">
      <!-- Isobutyl tail -->
      <line x1="30" y1="30" x2="55" y2="45" stroke="#291714" stroke-width="2"></line>
      <line x1="30" y1="60" x2="55" y2="45" stroke="#291714" stroke-width="2"></line>
      <line x1="55" y1="45" x2="85" y2="45" stroke="#291714" stroke-width="2.5"></line>
      <!-- Benzene Ring -->
      <polygon points="85,45 105,25 135,25 155,45 135,65 105,65" fill="none" stroke="#291714" stroke-width="2"></polygon>
      <circle cx="120" cy="45" r="14" fill="none" stroke="#ea1d20" stroke-width="1.5" stroke-dasharray="3,3"></circle>
      <!-- Propionic acid arm -->
      <line x1="155" y1="45" x2="190" y2="45" stroke="#291714" stroke-width="2.5"></line>
      <line x1="190" y1="45" x2="190" y2="20" stroke="#291714" stroke-width="2"></line>
      <text x="180" y="15" fill="#291714" font-family="JetBrains Mono" font-size="10" font-weight="bold">-CH3</text>
      <line x1="190" y1="45" x2="225" y2="45" stroke="#291714" stroke-width="2"></line>
      <line x1="225" y1="45" x2="245" y2="30" stroke="#bb000f" stroke-width="2"></line>
      <text x="248" y="32" fill="#bb000f" font-family="JetBrains Mono" font-size="10" font-weight="bold">=O</text>
      <line x1="225" y1="45" x2="245" y2="60" stroke="#bb000f" stroke-width="2"></line>
      <text x="248" y="66" fill="#bb000f" font-family="JetBrains Mono" font-size="10" font-weight="bold">-OH</text>
    </svg>
  `,
  paracetamol: `
    <svg class="w-full h-full text-on-surface" viewBox="0 0 340 100">
      <text x="35" y="55" fill="#bb000f" font-family="JetBrains Mono" font-size="12" font-weight="bold">HO-</text>
      <line x1="62" y1="50" x2="85" y2="50" stroke="#291714" stroke-width="2"></line>
      <polygon points="85,50 105,30 135,30 155,50 135,70 105,70" fill="none" stroke="#291714" stroke-width="2"></polygon>
      <line x1="155" y1="50" x2="185" y2="50" stroke="#291714" stroke-width="2"></line>
      <text x="190" y="55" fill="#0079c4" font-family="JetBrains Mono" font-size="12" font-weight="bold">-NH-</text>
      <line x1="225" y1="50" x2="250" y2="50" stroke="#291714" stroke-width="2"></line>
      <line x1="250" y1="50" x2="250" y2="28" stroke="#bb000f" stroke-width="2"></line>
      <text x="245" y="22" fill="#bb000f" font-family="JetBrains Mono" font-size="10" font-weight="bold">=O</text>
      <line x1="250" y1="50" x2="280" y2="50" stroke="#291714" stroke-width="2"></line>
      <text x="285" y="55" fill="#291714" font-family="JetBrains Mono" font-size="12" font-weight="bold">-CH3</text>
    </svg>
  `,
  omeprazole: `
    <svg class="w-full h-full text-on-surface" viewBox="0 0 340 100">
      <polygon points="40,50 60,30 90,30 110,50 90,70 60,70" fill="none" stroke="#291714" stroke-width="2"></polygon>
      <line x1="110" y1="50" x2="135" y2="35" stroke="#291714" stroke-width="2"></line>
      <line x1="135" y1="35" x2="155" y2="50" stroke="#291714" stroke-width="2"></line>
      <line x1="155" y1="50" x2="135" y2="65" stroke="#291714" stroke-width="2"></line>
      <line x1="135" y1="65" x2="110" y2="50" stroke="#291714" stroke-width="2"></line>
      <line x1="155" y1="50" x2="185" y2="50" stroke="#d97706" stroke-width="2.5"></line>
      <text x="187" y="45" fill="#d97706" font-family="JetBrains Mono" font-size="11" font-weight="bold">S(=O)</text>
      <line x1="220" y1="50" x2="245" y2="50" stroke="#291714" stroke-width="2"></line>
      <polygon points="245,50 265,35 295,35 305,50 295,65 265,65" fill="none" stroke="#0079c4" stroke-width="2"></polygon>
      <text x="270" y="55" fill="#0079c4" font-family="JetBrains Mono" font-size="10" font-weight="bold">Piridin</text>
    </svg>
  `,
  sertraline: `
    <svg class="w-full h-full text-on-surface" viewBox="0 0 340 100">
      <polygon points="40,50 60,30 90,30 110,50 90,70 60,70" fill="none" stroke="#291714" stroke-width="2"></polygon>
      <polygon points="110,50 130,30 160,30 180,50 160,70 130,70" fill="none" stroke="#291714" stroke-width="2"></polygon>
      <line x1="180" y1="50" x2="215" y2="50" stroke="#0079c4" stroke-width="2.5"></line>
      <text x="220" y="55" fill="#0079c4" font-family="JetBrains Mono" font-size="11" font-weight="bold">-NHCH3</text>
      <line x1="160" y1="70" x2="160" y2="90" stroke="#291714" stroke-width="2"></line>
      <polygon points="160,90 180,90 190,105 180,120 160,120" fill="none" stroke="#291714" stroke-width="1.5"></polygon>
      <text x="210" y="95" fill="#ba1a1a" font-family="JetBrains Mono" font-size="10" font-weight="bold">3,4-Di-Cl</text>
    </svg>
  `,
  levothyroxine: `
    <svg class="w-full h-full text-on-surface" viewBox="0 0 340 100">
      <text x="20" y="55" fill="#bb000f" font-family="JetBrains Mono" font-size="11" font-weight="bold">HO-</text>
      <polygon points="50,50 70,30 95,30 115,50 95,70 70,70" fill="none" stroke="#291714" stroke-width="2"></polygon>
      <text x="68" y="25" fill="#d97706" font-family="JetBrains Mono" font-size="10" font-weight="bold">I</text>
      <text x="68" y="85" fill="#d97706" font-family="JetBrains Mono" font-size="10" font-weight="bold">I</text>
      <line x1="115" y1="50" x2="145" y2="50" stroke="#bb000f" stroke-width="2"></line>
      <text x="148" y="55" fill="#bb000f" font-family="JetBrains Mono" font-size="12" font-weight="bold">-O-</text>
      <line x1="168" y1="50" x2="190" y2="50" stroke="#291714" stroke-width="2"></line>
      <polygon points="190,50 210,30 235,30 255,50 235,70 210,70" fill="none" stroke="#291714" stroke-width="2"></polygon>
      <text x="212" y="25" fill="#d97706" font-family="JetBrains Mono" font-size="10" font-weight="bold">I</text>
      <text x="212" y="85" fill="#d97706" font-family="JetBrains Mono" font-size="10" font-weight="bold">I</text>
      <line x1="255" y1="50" x2="285" y2="50" stroke="#291714" stroke-width="2"></line>
      <text x="288" y="55" fill="#291714" font-family="JetBrains Mono" font-size="10" font-weight="bold">Alanin</text>
    </svg>
  `,
  aspirin: `
    <svg class="w-full h-full text-on-surface" viewBox="0 0 340 100">
      <polygon points="50,50 70,30 100,30 120,50 100,70 70,70" fill="none" stroke="#291714" stroke-width="2"></polygon>
      <line x1="100" y1="30" x2="115" y2="15" stroke="#bb000f" stroke-width="2"></line>
      <text x="120" y="15" fill="#bb000f" font-family="JetBrains Mono" font-size="10" font-weight="bold">-COOH</text>
      <line x1="120" y1="50" x2="145" y2="50" stroke="#291714" stroke-width="2"></line>
      <text x="150" y="55" fill="#0079c4" font-family="JetBrains Mono" font-size="11" font-weight="bold">-O-CO-CH3 (Asetil)</text>
    </svg>
  `,
  amlodipine: `
    <svg class="w-full h-full text-on-surface" viewBox="0 0 340 100">
      <polygon points="120,30 140,15 160,30 160,60 140,75 120,60" fill="none" stroke="#291714" stroke-width="2"></polygon>
      <text x="135" y="90" fill="#0079c4" font-family="JetBrains Mono" font-size="10" font-weight="bold">NH</text>
      <line x1="140" y1="15" x2="140" y2="0" stroke="#291714" stroke-width="2"></line>
      <!-- Chlorophenyl group -->
      <polygon points="140,0 160,-15 180,-15 200,0 180,15 160,15" fill="none" stroke="#291714" stroke-width="1.5"></polygon>
      <text x="175" y="-20" fill="#ba1a1a" font-family="JetBrains Mono" font-size="9" font-weight="bold">2-Cl</text>
      <!-- Ester side chains -->
      <text x="45" y="45" fill="#bb000f" font-family="JetBrains Mono" font-size="10" font-weight="bold">EtOOC-</text>
      <text x="170" y="45" fill="#bb000f" font-family="JetBrains Mono" font-size="10" font-weight="bold">-COOMe</text>
      <text x="100" y="100" fill="#291714" font-family="JetBrains Mono" font-size="10" font-weight="bold">1,4-Dihidropiridin Çekirdeği</text>
    </svg>
  `,
};
