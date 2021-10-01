import { skewedNormalDistribution } from "./normalDistributionFuctions.js";

function getLetterGrades(score) {
  var map = [
      {max: 98, grade: "A+"},
      {max: 93, grade: "A"},
      {max: 90, grade: "A-"},
      {max: 88, grade: "B+"},
      {max: 83, grade: "B"},
      {max: 80, grade: "B-"},
      {max: 78, grade: "C+"},
      {max: 73, grade: "C"},
      {max: 70, grade: "C-"},
      {max: 68, grade: "D+"},
      {max: 63, grade: "D"},
      {max: 60, grade: "D-"}
  ];
  for(var loop = 0; loop < map.length; loop++) {
      var data = map[loop];
      if(score >= data.max) return data.grade;
  }
  return "F";
}

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
  PhysicalTraits: {
    Weight: { min: 100, max: 330, average: 175, postfix: "lbs" },
    Height: { min: 150, max: 230, average: 180, postfix: "cm" },
    Age: { min: 18, max: 29, average: 23, postfix: "yrs" }
  },
  Stats: {
    Strength: { min: 60, max: 90, average: 80 },
    Stamina: { min: 60, max: 90, average: 80 },
    Speed: { min: 60, max: 90, average: 80 },
    Steal: { min: 60, max: 90, average: 80 },
    Block: { min: 60, max: 90, average: 80 },
    OffensiveRebound: { min: 60, max: 90, average: 80 },
    DefensiveRebound: { min: 60, max: 90, average: 80 },
    Vertical: { min: 60, max: 90, average: 80 },
    Acceleration: { min: 60, max: 90, average: 80 },
    CloseShot: { min: 60, max: 90, average: 80 },
    DrivingLayup: { min: 60, max: 90, average: 80 },
    DrivingDunk: { min: 60, max: 90, average: 80 },
    StandingDunk: { min: 60, max: 90, average: 80 },
    PostControl: { min: 60, max: 90, average: 80 },
    MidRangeShot: { min: 60, max: 90, average: 80 },
    ThreePointShot: { min: 60, max: 90, average: 80 },
    FreeThrow: { min: 60, max: 90, average: 80 },
    BallHandling: { min: 60, max: 90, average: 80 },
    SpeedWithBall: { min: 60, max: 90, average: 80 },
    InteriorDefense: { min: 60, max: 90, average: 80 },
    PerimeterDefense: { min: 60, max: 90, average: 80 },
    SpeedWithBall: { min: 60, max: 90, average: 80 },
    BallHog: { min: 60, max: 90, average: 80 },
    Turnovers: { min: 60, max: 90, average: 80 },
    DefensiveIQ: { min: 60, max: 90, average: 80 },
    OffensiveIQ: { min: 60, max: 90, average: 80 },
    SeasonStamina: { min: 60, max: 90, average: 80 },
    ReleaseTime: { min: 60, max: 90, average: 80 },
    ContactShotPercentage: { min: 60, max: 90, average: 80 },
    HighlightPotential: { min: 60, max: 90, average: 80 }
  }
}

// Age / skill curve
// RatingPeakPotential: { min: 60, max: 90, average: 80 },
// RatingPeakLength: { min: 60, max: 90, average: 80 },

// for each attribute in GeneratorData, generate a random number between 0 and 1 and store in a corresponding attribute in a new object called GeneratorOutput
export default function generateBaller(alreadyCreatedBallers = []) {
  let baller = {};
  let hash = "";

  // Generate the visual traits for the 3D body
  for (let attribute in GeneratorData.VisualTraits) {
    baller[attribute] = getTableOutput(Math.random() * 100, GeneratorData.VisualTraits[attribute].Type, GeneratorData.VisualTraits[attribute].Rarity)
    hash += baller[attribute] + "|"
  }

  // Generate physical traits -- height, weight, age -- these will modify the final 3D body
  for (let attribute in GeneratorData.PhysicalTraits) {
    // Calculate value from normal distribution using min max and mean
    const attr = GeneratorData.PhysicalTraits[attribute];
    baller[attribute] = Math.round(skewedNormalDistribution({range: [attr.min, attr.max], mean: attr.average})) + " " + attr.postfix;
  }

  let statAverages = []

  // Generate stats for the game
  for (let attribute in GeneratorData.Stats) {
    const attr = GeneratorData.Stats[attribute];
    baller[attribute] = Math.round(skewedNormalDistribution({range: [attr.min, attr.max], mean: attr.average}));
    statAverages.push(baller[attribute]);
    baller[attribute] = baller[attribute] + " (" + getLetterGrades(baller[attribute]) + ")";
  }
  baller['StatsAverage'] = Math.round(statAverages.reduce((a, b) => a + b) / statAverages.length);

  baller['StatsAverage'] = baller['StatsAverage'] + " (" + getLetterGrades(baller['StatsAverage']) + ")";

  // baller.hash = hash;
  // baller.duplicate = alreadyCreatedBallers?.filter(baller => hash == baller.hash).length > 0;

  // alreadyCreatedBallers.push(baller);

  return baller;
}