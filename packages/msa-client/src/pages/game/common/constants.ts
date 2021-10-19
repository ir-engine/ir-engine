import * as constantsBasketball from "./constants.basketball";

import type { CompositeWeights, Phase, DraftType, MoodTrait } from "./types";

const ACCOUNT_API_URL =
  process.env.NODE_ENV === "development"
    ? "http://account.basketball-gm.test"
    : "https://account.basketball-gm.com";

const DIFFICULTY = {
  Easy: -0.25,
  Normal: 0,
  Hard: 0.25,
  Insane: 1,
};

const DRAFT_BY_TEAM_OVR = false;

const MAX_SUPPORTED_LEAGUE_VERSION = 46;

const NO_LOTTERY_DRAFT_TYPES: DraftType[] = [
  "freeAgents",
  "noLottery",
  "noLotteryReverse",
  "random",
];

const PHASE: {
  EXPANSION_DRAFT: Phase;
  FANTASY_DRAFT: Phase;
  PRESEASON: Phase;
  REGULAR_SEASON: Phase;
  AFTER_TRADE_DEADLINE: Phase;
  PLAYOFFS: Phase;
  DRAFT_LOTTERY: Phase;
  DRAFT: Phase;
  AFTER_DRAFT: Phase;
  RESIGN_PLAYERS: Phase;
  FREE_AGENCY: Phase;
} = {
  EXPANSION_DRAFT: -2,
  FANTASY_DRAFT: -1,
  PRESEASON: 0,
  REGULAR_SEASON: 1,
  AFTER_TRADE_DEADLINE: 2,
  PLAYOFFS: 3,
  DRAFT_LOTTERY: 4,
  DRAFT: 5,
  AFTER_DRAFT: 6,
  RESIGN_PLAYERS: 7,
  FREE_AGENCY: 8,
};

const PLAYER = {
  FREE_AGENT: -1,
  UNDRAFTED: -2,
  RETIRED: -3,

  // Store current draft class here during fantasy draft
  UNDRAFTED_FANTASY_TEMP: -6,

  // Used for realStats when a team has been contracted
  DOES_NOT_EXIST: -7,

  // THESE ARE OBSOLETE!
  UNDRAFTED_2: -4, // Next year's draft class
  UNDRAFTED_3: -5, // Next next year's draft class
};

const PHASE_TEXT = {
  "-2": "expansion draft",
  "-1": "fantasy draft",
  "0": "preseason",
  "1": "regular season",
  "2": "regular season",
  "3": "playoffs",
  "4": "before draft",
  "5": "draft",
  "6": "after draft",
  "7": "re-sign players",
  "8": "free agency",
};

const STRIPE_PUBLISHABLE_KEY =
  process.env.NODE_ENV === "development"
    ? "pk_test_Qbz0froGmHLp0dPCwHoYFY08"
    : "pk_live_Dmo7Vs6uSaoYHrFngr4lM0sa";

const COMPOSITE_WEIGHTS = constantsBasketball.COMPOSITE_WEIGHTS;

const PLAYER_GAME_STATS = constantsBasketball.PLAYER_GAME_STATS;

const PLAYER_SUMMARY = constantsBasketball.PLAYER_SUMMARY;

const PLAYER_STATS_TABLES = constantsBasketball.PLAYER_STATS_TABLES;

const RATINGS = constantsBasketball.RATINGS;

const POSITION_COUNTS: {
  [key: string]: number;
} = constantsBasketball.POSITION_COUNTS;

const POSITIONS = constantsBasketball.POSITIONS;

const TEAM_STATS_TABLES: {
  [key: string]: {
    name: string;
    stats: string[];
    superCols?: any[];
  };
} = constantsBasketball.TEAM_STATS_TABLES;

const TIME_BETWEEN_GAMES: string = "week";

const MOOD_TRAITS: Record<MoodTrait, string> = {
  F: "Fame",
  L: "Loyalty",
  $: "Money",
  W: "Winning",
};

const SIMPLE_AWARDS = constantsBasketball.SIMPLE_AWARDS;

const AWARD_NAMES = constantsBasketball.AWARD_NAMES;

const DEFAULT_CONFS = constantsBasketball.DEFAULT_CONFS;

const DEFAULT_DIVS = constantsBasketball.DEFAULT_DIVS;

const DEFAULT_STADIUM_CAPACITY = constantsBasketball.DEFAULT_STADIUM_CAPACITY;

const COURT = "court";

const EMAIL_ADDRESS = "jeremy@bbgm.com";

const GAME_ACRONYM = "BBGM";

const GAME_NAME = "Basketball GM";

const SUBREDDIT_NAME = "BasketballGM";

const TWITTER_HANDLE = "basketball_gm";

const FACEBOOK_USERNAME = "basketball.general.manager";

const SPORT_HAS_REAL_PLAYERS = true;

const SPORT_HAS_LEGENDS = true;

const WEBSITE_PLAY = "play.basketball-gm.com";

const WEBSITE_ROOT = "basketball-gm.com";

// For subscribers who have not renewed yet, give them a 3 day grace period before showing ads again, because sometimes it takes a little extra tim for the payment to process
const GRACE_PERIOD = 60 * 60 * 24 * 3;

const TIEBREAKERS = {
  commonOpponentsRecord: "Common opponents record",
  confRecordIfSame: "Conference record (same conf)",
  divRecordIfSame: "Division record (same div)",
  divWinner: "Division winner",
  headToHeadRecord: "Head-to-head record",
  marginOfVictory: "Margin of victory",
  strengthOfVictory: "Strength of victory",
  strengthOfSchedule: "Strength of schedule",
  coinFlip: "Coin flip",
};

// Used in all sports if "pts" are explicitly requested and there is no formula set
const DEFAULT_POINTS_FORMULA = "2*W+OTL+T";

const AD_DIVS = {
  mobile: "basketball-gm_mobile_leaderboard",
  leaderboard: "basketball-gm_leaderboard_atf",
  rectangle1: "basketball-gm_mrec_btf_1",
  rectangle2: "basketball-gm_mrec_btf_2",
  rail: "basketball-gm_right_rail",
};

const DEFAULT_JERSEY = "jersey3";

const JERSEYS = {
  jersey: "Plain",
  jersey2: "Bordered",
  jersey4: "Bordered 2",
  jersey3: "Solid horizontal",
  jersey5: "Pinstripes",
};

// Target: 90% in playThroughInjuriesFactor
const DEFAULT_PLAY_THROUGH_INJURIES = [0, 4];

const DAILY_SCHEDULE = `${
  TIME_BETWEEN_GAMES === "week" ? "Weekly" : "Daily"
} Schedule`;

export {
  AD_DIVS,
  AWARD_NAMES,
  COURT,
  DAILY_SCHEDULE,
  DEFAULT_CONFS,
  DEFAULT_DIVS,
  DEFAULT_JERSEY,
  DEFAULT_PLAY_THROUGH_INJURIES,
  DEFAULT_POINTS_FORMULA,
  DEFAULT_STADIUM_CAPACITY,
  ACCOUNT_API_URL,
  DIFFICULTY,
  DRAFT_BY_TEAM_OVR,
  EMAIL_ADDRESS,
  FACEBOOK_USERNAME,
  GAME_ACRONYM,
  GAME_NAME,
  GRACE_PERIOD,
  JERSEYS,
  MAX_SUPPORTED_LEAGUE_VERSION,
  MOOD_TRAITS,
  NO_LOTTERY_DRAFT_TYPES,
  PHASE,
  PLAYER,
  PHASE_TEXT,
  SPORT_HAS_LEGENDS,
  SPORT_HAS_REAL_PLAYERS,
  STRIPE_PUBLISHABLE_KEY,
  COMPOSITE_WEIGHTS,
  PLAYER_GAME_STATS,
  PLAYER_SUMMARY,
  PLAYER_STATS_TABLES,
  RATINGS,
  SIMPLE_AWARDS,
  POSITION_COUNTS,
  POSITIONS,
  SUBREDDIT_NAME,
  TEAM_STATS_TABLES,
  TIEBREAKERS,
  TIME_BETWEEN_GAMES,
  TWITTER_HANDLE,
  WEBSITE_PLAY,
  WEBSITE_ROOT,
};
