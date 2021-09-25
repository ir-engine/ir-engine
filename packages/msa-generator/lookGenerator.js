const rarityModifierFactor = .1;
const fixedRarityModifierFactor = .01;

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
  VisualTraits: {
    Gender: {
      Type: ["Male", "Female"],
      Rarity: [55, 45]
    },
    Body: {
      Type: ["Body1", "Body2", "Body3"],
      Rarity: [40, 35, 25]
    },
    Face: {
      Type: ["Face1", "Face2", "Face3"],
      Rarity: [40, 35, 25]
    },
    Nose: {
      Type: ["Nose1", "Nose2", "Nose3"],
      Rarity: [40, 35, 25]
    },
    Brow: {
      Type: ["Brow1", "Brow2", "Brow3"],
      Rarity: [40, 35, 25]
    },
    Chin: {
      Type: ["Chin1", "Chin2", "Chin3"],
      Rarity: [40, 35, 25]
    },
    Jewelry: {
      Type: ["None", "Earrings", "Nosering", "Eyebrowring"],
      Rarity: [90.5, 8, 1.25, .25]
    },
    Jewelry: {
      Type: ["None", "FacialHair1", "FacialHair2", "FacialHair3"],
      Rarity: [90.5, 8, 1.25, .25]
    },
    FacialHair: {
      Type: ["None", "FacialHair1", "FacialHair2", "FacialHair3"],
      Rarity: [90.5, 8, 1.25, .25]
    },
    HairStyle: {
      Type: ["Hair", "Hair2", "Hair3", "Hair4", "Hair5", "Hair6", "Hair7", "Hair8", "Hair9", "Hair10"],
      Rarity: [15, 14, 14, 13, 11, 11, 11, 6, 4, 1]
    },
    HairColor: {
      Type: ["Brown_Dark", "Brown_Light", "Black", "Blonde", "Light_Blonde", "Strawberry_Blonde", "Red", "Green", "Blue", "Silver", "White"],
      Rarity: [20, 25, 25, 10, 9.5, 3, 3, 2, 2, .4, .1]
    },
    SkinColor: {
      Type: ["#c58c85", "#ecbcb4", "#d1a3a4", "#a1665e", "#503335", "#592f2a", "#8d5524", "#c68642", "#e0ac69", "#f1c27d", "#ffdbac", "#eeeeee", "#bca0dc"],
      Rarity: [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, .9, .1]
    },
    SkinColor: {
      Type: ["Brown", "Light_Brown", "Blue", "Hazel", "Light_Blue", "Green", "Gray", "Violet", "White", "Black"],
      Rarity: [23, 21, 18, 15, 10, 10, 2.25, .5, .24, .01]
    },
    Shoes: {
      Type: ["Shoes_1", "Shoes_2", "Shoes_3", "Shoes_4", "Shoes_5"],
      Rarity: [48, 24, 12, 8, 4, 2]
    },
    Top: {
      Type: ["Top_1", "Top_2", "Top_3", "Top_4", "Top_5"],
      Rarity: [48, 24, 12, 8, 4, 2]
    },
    Bottom: {
      Type: ["Bottom_1", "Bottom_2", "Bottom_3", "Bottom_4", "Bottom_5"],
      Rarity: [48, 24, 12, 8, 4, 2]
    }
  },
  Weight: {
    Male: { min: 120, max: 330, average: 185 },
    Female: { min: 110, max: 240, average: 165 }
  },
  Height: {
    Male: { min: 1.6, max: 2.3, average: 2 },
    Female:  { min: 1.5, max: 2.2, average: 1.8 }
  },
  Age: { min: 17, max: 80, average: 24 }
}

// for each attribute in GeneratorData, generate a random number between 0 and 1 and store in a corresponding attribute in a new object called GeneratorOutput
export default function generateBaller(alreadyCreatedBallers = []) {
  let baller = {};
  let hash = "";
  for (let attribute in GeneratorData.VisualTraits) {
    baller[attribute] = getTableOutput(Math.random() * 100, GeneratorData.VisualTraits[attribute].Type, GeneratorData.VisualTraits[attribute].Rarity)
    hash += baller[attribute] + "|"
  }

  baller.hash = hash;
  baller.duplicate = alreadyCreatedBallers?.filter(baller => hash == baller.hash).length > 0;

  alreadyCreatedBallers.push(baller);

  return baller;
}

// randomly selection between 