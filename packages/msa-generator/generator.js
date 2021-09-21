const rarities = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
];

const VisualTraits = {
  Gender: {
    Type: [ "Male", "Female" ],
    Rarity: [ 55, 45 ]
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
    Type: [ "None", "FacialHair1", "FacialHair2", "FacialHair3"],
    Rarity: [90.5, 8, 1.25, .25]
  },
  FacialHair: {
    Type: [ "None", "FacialHair1", "FacialHair2", "FacialHair3"],
    Rarity: [90.5, 8, 1.25, .25]
  },
  Age: {
    Type: [18, 19, 20, 21, 22, 23, 24],
    Rarity: [5, 10, 15, 20, 25, 15, 10 ]
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
  Shirt: {
    Type: ["Shirt_1", "Shirt_2", "Shirt_3", "Shirt_4", "Shirt_5"],
    Rarity: [48, 24, 12, 8, 4, 2]
  },
  Pants: {
    Type: ["Pants_1", "Pants_2", "Pants_3", "Pants_4", "Pants_5"],
    Rarity: [48, 24, 12, 8, 4, 2]
  },
}

const NeckLength= { min: -1, max: 1, average: 0 }

const Shoes = ["Shoes_1", "Shoes_2", "Shoes_3", "Shoes_4", "Shoes_5"]
const ShoesRarity = [48, 24, 12, 8, 4, 2].map(n => n / 100)

const Shirt = ["Shirt_1", "Shirt_2", "Shirt_3", "Shirt_4", "Shirt_5"]
const ShirtRarity = [48, 24, 12, 8, 4, 2].map(n => n / 100)


const Weight = {
  Male: { min: 120, max: 330, average: 185 },
  Female:  { min: 110, max: 240, average: 165 }
}

const Height = {
  Male: { min: 1.6, max: 2.3, average: 2 },
  Female:  { min: 1.5, max: 2.2, average: 1.8 }
}


const getTableOutput = ((randomNumber, table, factors) => {
  let totalFactor = 0;
  for (let i = 0; i < factors.length; i++) {
    totalFactor += factors[i];
    if (randomNumber <= totalFactor) {
      return table[i];
    }
  }
  return table[table.length - 1];
});

export default function generateBaller({
  art,
  stats,
}, alreadyCreatedBallers = []) {

  const rarityModifierFactor = .1;
  const fixedRarityModifierFactor = .01;

  // Rarity modifier
  let rarityModifier = 0;
  let fixedRarityModifier = 0;
  let rarity = "";

  for (let i = 0; i < rarities.length; i++) {
    if (rarities[i] == stats.rarity) {
      rarityModifier = i * rarityModifierFactor;
      fixedRarityModifier = i * fixedRarityModifierFactor;
      rarity = stats.rarity;
      break;
    }
  }

  // Is light or dark?
  const gender = getTableOutput(stats.Strength + (stats.Stamina * rarityModifier), Gender, GenderRarity);

  // BodyType
  const bodyType = getTableOutput(stats.Stamina + (stats.Vertical * rarityModifier) + fixedRarityModifier, Body, BodyTypeRarity);

  // FaceShape
  const faceShape = getTableOutput(stats.Steal + (stats.Vertical * rarityModifier) + fixedRarityModifier, Face, FaceShapeRarity);

  // NoseShape
  const noseShape = getTableOutput(stats.Stamina + (stats.Acceleration * rarityModifier) + fixedRarityModifier, NoseShape, NoseShapeRarity);

  // BrowShape
  const browShape = getTableOutput(stats.Block + (stats.Acceleration * rarityModifier) + fixedRarityModifier, BrowShape, BrowShapeRarity);
  
  // ChinShape
  const chinShape = getTableOutput(stats.Speed + (stats.DrivingLayup * rarityModifier), ChinShape, ChinShapeRarity);

  // Jewelry
  const jewelry = getTableOutput(stats.DefensiveRebound + fixedRarityModifier, Jewelry, JewelryRarity);



  const facialHair = getTableOutput(stats.DefensiveRebound + fixedRarityModifier, FacialHair, FacialHairRarity)
  const age = getTableOutput(stats.DefensiveRebound + fixedRarityModifier, Age, AgeRarity)
  const weight = getNumericalTableOutput(stats.DefensiveRebound + fixedRarityModifier, Weight[gender])
  const height = getNumericalTableOutput(stats.DefensiveRebound + fixedRarityModifier, Height[gender])
  
  const Weight = {
    Male: { min: 120, max: 330, average: 185 },
    Female:  { min: 110, max: 240, average: 165 }
  }
  
  const Height = {
    Male: { min: 1.6, max: 2.3, average: 2 },
    Female:  { min: 1.5, max: 2.2, average: 1.8 }
  }
  
  const NeckLength= { min: -1, max: 1, average: 0 }
  
  const HairType =  ["Hair", "Hair2", "Hair3", "Hair4", "Hair5", "Hair6", "Hair7", "Hair8", "Hair9", "Hair10"]
  const HairTypeRarity = [15, 14, 14, 13, 11, 11, 11, 6, 4, 1].map(n => n / 100)
  
  const HairColor = ["Brown_Dark", "Brown_Light", "Black", "Blonde", "Light_Blonde", "Strawberry_Blonde", "Red", "Green", "Blue", "Silver", "White"]
  const HairColorRarity = [20, 25, 25, 10, 9.5, 3, 3, 2, 2, .4, .1].map(n => n / 100)
  
  const SkinColor = ["#c58c85", "#ecbcb4", "#d1a3a4", "#a1665e", "#503335", "#592f2a", "#8d5524", "#c68642", "#e0ac69", "#f1c27d", "#ffdbac", "#eeeeee", "#bca0dc"]
  const SkinColorRarity = [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, .9, .1].map(n => n / 100)
  
  const EyeColor = ["Brown", "Light_Brown", "Blue", "Hazel", "Light_Blue", "Green", "Gray", "Violet", "White", "Black"]
  const EyeColorRarity = [23, 21, 18, 15, 10, 10, 2.25, .5, .24, .01].map(n => n / 100)
  
  const Shoes = ["Shoes_1", "Shoes_2", "Shoes_3", "Shoes_4", "Shoes_5"]
  const ShoesRarity = [48, 24, 12, 8, 4, 2].map(n => n / 100)
  
  const Shirt = ["Shirt_1", "Shirt_2", "Shirt_3", "Shirt_4", "Shirt_5"]
  const ShirtRarity = [48, 24, 12, 8, 4, 2].map(n => n / 100)






  let hash = rarity + " | " + gender + " | " + bodyType + " | " + faceShape + " | " +  noseShape + " | " +  browShape + " | " +  jewelry + " | " + chinShape;
  const alreadyExists = alreadyCreatedBallers.filter(baller => hash == baller.hash).length > 0;

  const baller = {
    rarity,
    gender: gender,
    bodyType: bodyType,
    faceShape: faceShape,
    noseShape: noseShape,
    browShape: browShape,
    jewelry: jewelry,
    chinShape: chinShape,
    duplicate: alreadyExists,
    hash: hash
  }

  alreadyCreatedBallers.push(baller);

  return baller;
}
