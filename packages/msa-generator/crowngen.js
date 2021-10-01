import { skewedNormalDistribution } from "./normalDistributionFuctions.js";

const getTableOutput = (randomNumber, table, factors) => {
  let totalFactor = 0;
  for (let i = 0; i < factors.length; i++) {
    totalFactor += factors[i];
    if (randomNumber <= totalFactor) {
      return table[i];
    }
  }
  return table[table.length - 1];
};

const GeneratorData = {
    SmallGem: {
      Type: ["Citrine", "Amethyst", "Amber", "Pearl", "Moonstone", "Opal", "Ruby", "Sapphire", "Emerald", "Diamond"],
      Rarity: [18, 17, 16, 15, 14, 6, 5.5, 4.5, 3, 1]
    },
    BigGem: {
      Type: ["MarioGreenTunnel", "Custom", "PaintBrushTip", "StarSun", "TyedyeMarble", "GlowingGreenOrb", "GalaxyMarble", "Flame", "Molecule", "GhostFlame"],
      Rarity: [18, 17, 16, 15, 14, 6, 5.5, 4.5, 3, 1]
    },
    BaseLayer: {
      Type: ["Bronze", "Silver", "Gold", "Iridescent", "Ice", "Lava", "Trippy", "CircuitBoard", "Galaxy", "Diamond" ],
      Rarity: [25, 20, 15, 7, 7, 7, 5, 5, 5, 1]
    },
    LowerRim: {
      Type: ["RedVelvet", "PatternedMetal", "ColorfulGems", "RoseVine", "OliveBranch", "ClearGlass", "CandyCane", "ObsidianMarble", "NeonGlow", "Diamond" ],
      Rarity: [25, 20, 15, 7, 7, 7, 5, 5, 5, 1]
    }
}

// Age / skill curve
// RatingPeakPotential: { min: 60, max: 90, average: 80 },
// RatingPeakLength: { min: 60, max: 90, average: 80 },

// for each attribute in GeneratorData, generate a random number between 0 and 1 and store in a corresponding attribute in a new object called GeneratorOutput
export default function generateCrown(alreadyCreatedBallers = []) {
  let baller = {};
  let hash = "";

  // Generate the visual traits for the 3D body
  for (let attribute in GeneratorData) {
    baller[attribute] = getTableOutput(Math.random() * 100, GeneratorData[attribute].Type, GeneratorData[attribute].Rarity)
    hash += baller[attribute] + "|"
  }

  return baller;
}