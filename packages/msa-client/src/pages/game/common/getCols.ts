import type { Col } from "../ui/components/DataTable";

type ColTemp = Omit<Col, "title"> & {
  title?: string;
};

const gp = "G";

const sportSpecificCols = {
  "rating:fg": {
    desc: "Mid Range",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "2Pt",
  },
  "rating:tp": {
    desc: "Three Pointers",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "3Pt",
  },
  "rating:oiq": {
    desc: "Offensive IQ",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "oIQ",
  },
  "rating:dnk": {
    desc: "Dunks/Layups",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "Dnk",
  },
  "rating:drb": {
    desc: "Dribbling",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "Drb",
  },
  "rating:ins": {
    desc: "Inside Scoring",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "Ins",
  },
  "rating:jmp": {
    desc: "Jumping",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "Jmp",
  },
  "rating:ft": {
    desc: "Free Throws",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "FT",
  },
  "rating:pss": {
    desc: "Passing",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "Pss",
  },
  "rating:reb": {
    desc: "Rebounding",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "Reb",
  },
  "rating:diq": {
    desc: "Defensive IQ",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "dIQ",
  },
  "stat:2pp": {
    desc: "Two Point Percentage",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "2P%",
  },
  "stat:2p": {
    desc: "Two Pointers Made",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "2P",
  },
  "stat:2pa": {
    desc: "Two Pointers Attempted",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "2PA",
  },
  "stat:pm": {
    desc: "Plus/Minus",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "+/-",
  },
  "stat:tpp": {
    desc: "Three Point Percentage",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "3P%",
  },
  "stat:tp": {
    desc: "Three Pointers Made",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "3P",
  },
  "stat:tpa": {
    desc: "Three Pointers Attempted",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "3PA",
  },
  "stat:tpar": {
    desc: "Three Point Attempt Rate (3PA / FGA)",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "3PAr",
  },
  "stat:astp": {
    desc: "Percentage of teammate field goals a player assisted while on the floor",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "AST%",
  },
  "stat:ast": {
    desc: "Assists",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "AST",
  },
  "stat:ba": {
    desc: "Blocks Against",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "BA",
  },
  "stat:blk": {
    desc: "Blocks",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "Blk",
  },
  "stat:blkp": {
    desc: "Percentage of opponent two-pointers blocked",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "BLK%",
  },
  "stat:drb": {
    desc: "Defensive Rebounds",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "DRB",
  },
  "stat:drbp": {
    desc: "Percentage of available defensive rebounds grabbed",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "DRB%",
  },
  "stat:drtg": {
    desc: "Defensive Rating (points allowed per 100 possessions)",
    sortSequence: ["asc", "desc"],
    sortType: "number",
    title: "DRtg",
  },
  "stat:dws": {
    desc: "Defensive Win Shares",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "DWS",
  },
  "stat:ewa": {
    desc: "Estimated Wins Added",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "EWA",
  },
  "stat:efg": {
    desc: "Effective Field Goal Percentage",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "eFG%",
  },
  "stat:fgp": {
    desc: "Field Goal Percentage",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "FG%",
  },
  "stat:fg": {
    desc: "Field Goals Made",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "FG",
  },
  "stat:fga": {
    desc: "Field Goals Attempted",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "FGA",
  },
  "stat:ftp": {
    desc: "Free Throw Percentage",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "FT%",
  },
  "stat:ft": {
    desc: "Free Throws Made",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "FT",
  },
  "stat:fta": {
    desc: "Free Throws Attempted",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "FTA",
  },
  "stat:ftpFga": {
    desc: "Free Throws per Field Goal Attempted",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "FTr",
  },
  "stat:ftr": {
    desc: "Free Throw Attempt Rate (FTA / FGA)",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "FT/FGA",
  },
  "stat:gmsc": {
    desc: "Game Score",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "GmSc",
  },
  "stat:nrtg": {
    desc: "Net Rating (point differential per 100 possessions)",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "NRtg",
  },
  "stat:orb": {
    desc: "Offensive Rebounds",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "ORB",
  },
  "stat:orbp": {
    desc: "Percentage of available offensive rebounds grabbed",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "ORB%",
  },
  "stat:ortg": {
    desc: "Offensive Rating (points produced/scored per 100 possessions)",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "ORtg",
  },
  "stat:ows": {
    desc: "Offensive Win Shares",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "OWS",
  },
  "stat:pace": {
    desc: "Possessions Per Game",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "Pace",
  },
  "stat:per": {
    desc: "Player Efficiency Rating",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "PER",
  },
  "stat:pf": {
    desc: "Personal Fouls",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "PF",
  },
  "stat:pl": {
    desc: "Pythagorean Losses (expected losses based on points scored and allowed)",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "PL",
  },
  "stat:pts": {
    desc: "Points",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "PTS",
  },
  "stat:pw": {
    desc: "Pythagorean Wins (expected wins based on points scored and allowed)",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "PW",
  },
  "stat:stl": {
    desc: "Steals",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "STL",
  },
  "stat:stlp": {
    desc: "Percentage of opponent possessions ending in steals",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "STL%",
  },
  "stat:tovp": {
    desc: "Turnovers per 100 plays",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "TOV%",
  },
  "stat:trb": {
    desc: "Total Rebounds",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "TRB",
  },
  "stat:trbp": {
    desc: "Percentage of available rebounds grabbed",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "TRB%",
  },
  "stat:tsp": {
    desc: "True Shooting Percentage",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "TS%",
  },
  "stat:tov": {
    desc: "Turnovers",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "TOV",
  },
  "stat:usgp": {
    desc: "Percentage of team plays used",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "USG%",
  },
  "stat:ws": {
    desc: "Win Shares",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "WS",
  },
  "stat:wsPerPlayer": {
    desc: "Win Shares Per Player",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "WS/Player",
  },
  "stat:ws48": {
    desc: "Win Shares Per 48 Minutes",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "WS/48",
  },
  "stat:obpm": {
    desc: "Offensive Box Plus-Minus",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "OBPM",
  },
  "stat:dbpm": {
    desc: "Defensive Box Plus-Minus",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "DBPM",
  },
  "stat:bpm": {
    desc: "Box Plus-Minus",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "BPM",
  },
  "stat:vorp": {
    desc: "Value Over Replacement Player",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "VORP",
  },
  "stat:fgAtRim": {
    desc: "At Rim Made",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "M",
  },
  "stat:fgaAtRim": {
    desc: "At Rim Attempted",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "A",
  },
  "stat:fgpAtRim": {
    desc: "At Rim Percentage",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "%",
  },
  "stat:fgLowPost": {
    desc: "Low Post Made",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "M",
  },
  "stat:fgaLowPost": {
    desc: "Low Post Attempted",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "A",
  },
  "stat:fgpLowPost": {
    desc: "Low Post Percentage",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "%",
  },
  "stat:fgMidRange": {
    desc: "Mid Range Made",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "M",
  },
  "stat:fgaMidRange": {
    desc: "Mid Range Attempted",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "A",
  },
  "stat:fgpMidRange": {
    desc: "Mid Range Percentage",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "%",
  },
  "stat:dd": {
    desc: "Double Doubles",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "DD",
  },
  "stat:td": {
    desc: "Triple Doubles",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "TD",
  },
  "stat:qd": {
    desc: "Quadruple Doubles",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "QD",
  },
  "stat:fxf": {
    desc: "Five by Fives",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "5x5",
  },
};
const cols: {
  [key: string]: ColTemp;
} = {
  "": {
    sortSequence: ["desc", "asc"],
  },
  "#": {},
  "@": {
    desc: "Home or Away",
  },
  "#AS": {
    desc: "Number of All-Star Selections",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "%": {
    desc: "Percentage",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Active: {
    desc: "Number of Players Still Active",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "# Fathers": {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  HoF: {
    desc: "Number of Players in the Hall of Fame",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "# Brothers": {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "# Players": {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "# Seasons": {
    desc: "Number of Seasons",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "# Sons": {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "# Teams": {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "# Trades": {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  A: {
    desc: "Attempted",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Acquired: {
    desc: "How Player Was Acquired",
  },
  Actions: {},
  Age: {
    sortType: "number",
  },
  Amount: {
    sortSequence: ["desc", "asc"],
    sortType: "currency",
  },
  "Asking For": {
    sortSequence: ["desc", "asc"],
    sortType: "currency",
  },
  "Avg Attendance": {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  AvgAge: {
    desc: "Average age, weighted by minutes played",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "Age",
  },
  Born: {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "Cap Space": {
    sortSequence: ["desc", "asc"],
    sortType: "currency",
  },
  "Captain 1": {
    sortType: "name",
  },
  "Captain 2": {
    sortType: "name",
  },
  Cash: {
    sortSequence: ["desc", "asc"],
    sortType: "currency",
  },
  College: {},
  Conference: {},
  Contract: {
    sortSequence: ["desc", "asc"],
    sortType: "currency",
  },
  Count: {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Country: {},
  Created: {
    desc: "Created Date",
    searchType: "string",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Current: {
    desc: "Current Team Rating (With Injuries)",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "Current Contract": {
    desc: "Current Contract",
    sortSequence: ["desc", "asc"],
    sortType: "currency",
    title: "Current",
  },
  "Projected Contract": {
    desc: "Projected Contract",
    sortSequence: ["desc", "asc"],
    sortType: "currency",
    title: "Projected",
  },
  Details: {},
  Died: {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Diff: {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Difficulty: {
    sortSequence: ["desc", "asc"],
  },
  Division: {},
  Draft: {
    noSearch: true,
    sortSequence: [],
  },
  "Draft Picks": {
    sortSequence: [],
  },
  "Draft Year": {
    sortType: "number",
  },
  Drafted: {
    sortType: "number",
  },
  End: {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Exp: {
    desc: "Contract Expiration",
    sortSequence: ["asc", "desc"],
    sortType: "number",
  },
  Experience: {
    desc: "Number of Years in the League",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Finals: {
    desc: "Finals Appearances",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "Finals Won": {
    desc: "Finals Won",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "Finals Lost": {
    desc: "Finals Lost",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  From: {},
  GB: {
    desc: "Games Back",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Games: {
    desc: "Number of Games",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  GOAT: {
    desc: "GOAT Score",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Healthy: {
    desc: "Team Rating (When Healthy)",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Height: {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  HOF: {
    sortSequence: ["desc", "asc"],
  },
  Injury: {},
  L: {
    desc: "Losses",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  L10: {
    desc: "Last Ten Games",
    sortSequence: ["desc", "asc"],
    sortType: "lastTen",
  },
  Last: {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "Last Played": {
    desc: "Last Played Date",
    sortSequence: ["desc", "asc"],
    searchType: "string",
    sortType: "number",
  },
  "Last Season": {
    desc: "Last Season with Team",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "League Champion": {},
  League: {
    desc: "League Name",
  },
  Links: {
    noSearch: true,
    sortSequence: [],
  },
  M: {
    desc: "Made",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Mood: {
    width: "1px",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  MVP: {
    desc: "Most Valuable Player",
    sortType: "name",
  },
  Name: {
    sortType: "name",
  },
  Negotiate: {
    sortSequence: [],
  },
  Note: {},
  Opp: {
    desc: "Opponent",
  },
  Ovr: {
    desc: "Overall Rating",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "Ovr Drop": {
    desc: "Decrease in Overall Rating",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  PA: {
    desc: "Points Against",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: undefined,
  },
  PS: {
    desc: "Points Scored",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: undefined,
  },
  "PA/g": {
    desc: "Points Against Per Game",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: undefined,
  },
  "PS/g": {
    desc: "Points Scored Per Game",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: undefined,
  },
  Payroll: {
    sortSequence: ["desc", "asc"],
    sortType: "currency",
  },
  "Peak Ovr": {
    desc: "Peak Overall Rating",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Phase: {
    desc: "League Season and Phase",
    sortSequence: ["desc", "asc"],
  },
  Pick: {
    desc: "Draft Pick",
    sortType: "draftPick",
  },
  Pop: {
    desc: "Region Population",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Playoffs: {
    desc: "Playoff Appearances",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Pos: {
    desc: "Position",
  },
  Pot: {
    desc: "Potential Rating",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "Pot Drop": {
    desc: "Decrease in Potential Rating",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Prog: {
    desc: "Progression From Previous Season",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "Profit (YTD)": {
    sortSequence: ["desc", "asc"],
    sortType: "currency",
  },
  PTS: {
    desc: "Points",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "PTS%": {
    desc: "Points Divided By Maximum Points",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Received: {
    desc: "Assets Received in Trade",
  },
  Record: {
    desc: "Record",
    sortType: "record",
  },
  Relation: {},
  Result: {},
  Retired: {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "Revenue (YTD)": {
    sortSequence: ["desc", "asc"],
    sortType: "currency",
  },
  "Roster Spots": {
    desc: "Number of Open Roster Spots",
    sortSequence: ["desc", "asc"],
  },
  "Rounds Lost": {
    desc: "Playoff Rounds Lost",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "Rounds Won": {
    desc: "Playoff Rounds Won",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "Runner Up": {},
  Season: {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Seed: {
    desc: "Playoff Seed",
    sortType: "number",
  },
  Skills: {},
  Start: {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  T: {
    desc: "Ties",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  "Ticket Price": {
    sortSequence: ["desc", "asc"],
    sortType: "currency",
  },
  Trade: {
    desc: "Ties",
    noSearch: true,
  },
  OTL: {
    desc: "Overtime Losses",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Team: {},
  Titles: {
    desc: "Championships Won",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Type: {
    desc: "Type of game",
  },
  W: {
    desc: "Wins",
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  Weight: {
    sortSequence: ["desc", "asc"],
    sortType: "number",
  },
  X: {
    desc: "Exclude from counter offers",
    noSearch: true,
    sortSequence: [],
  },
  Year: {
    sortType: "number",
  },
  Summary: {},
  "rating:endu": {
    desc: "Endurance",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "End",
  },
  "rating:hgt": {
    desc: "Height",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "Hgt",
  },
  "rating:spd": {
    desc: "Speed",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "Spd",
  },
  "rating:stre": {
    desc: "Strength",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "Str",
  },
  "stat:gp": {
    desc: "Games Played",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: gp,
  },
  "stat:gpPerPlayer": {
    desc: "Games Played Per Player",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: `${gp}/Player`,
  },
  "stat:gs": {
    desc: "Games Started",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "GS",
  },
  "stat:jerseyNumber": {
    desc: "Jersey Number",
    sortSequence: ["asc", "desc"],
    sortType: "number",
    title: "#",
  },
  "stat:min": {
    desc: "Minutes",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "MP",
  },
  "stat:mov": {
    desc: "Average Margin of Victory",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "MOV",
  },
  "stat:diff": {
    desc: "Point Differential",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "Diff",
  },
  "stat:yearsWithTeam": {
    desc: "Years With Team",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "YWT",
  },
  "count:allDefense": {
    desc: "All-Defensive Team",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "ADT",
  },
  "count:allLeague": {
    desc: "All-League Team",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "ALT",
  },
  "count:allRookie": {
    desc: "All-Rookie Team",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "ART",
  },
  "count:allStar": {
    desc: "All-Star",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "AS",
  },
  "count:allStarMVP": {
    desc: "All-Star MVP",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "ASMVP",
  },
  "count:bestRecord": {
    desc: "Best Record",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "BR",
  },
  "count:bestRecordConf": {
    desc: "Best Conference Record",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "BRC",
  },
  "count:dpoy": {
    desc: "Defensive Player of the Year",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "DPOY",
  },
  "count:dfoy": {
    desc: "Defensive Forward of the Year",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "DFOY",
  },
  "count:goy": {
    desc: "Goalie of the Year",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "GOY",
  },
  "count:mip": {
    desc: "Most Improved Player",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "MIP",
  },
  "count:mvp": {
    desc: "Most Valuable Player",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "MVP",
  },
  "count:roy": {
    desc: "Rookie of the Year",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "ROY",
  },
  "count:smoy": {
    desc: "Sixth Man of the Year",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "SMOY",
  },
  "count:oroy": {
    desc: "Offensive Rookie of the Year",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "OROY",
  },
  "count:droy": {
    desc: "Defensive Rookie of the Year",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "DROY",
  },
  "award:dpoy": {
    desc: "Defensive Player of the Year",
    sortType: "name",
    title: "DPOY",
  },
  "award:dfoy": {
    desc: "Defensive Forward of the Year",
    sortType: "name",
    title: "DFOY",
  },
  "award:goy": {
    desc: "Goalie of the Year",
    sortType: "name",
    title: "GOY",
  },
  "award:finalsMvp": {
    desc: "Finals Most Valuable Player",
    sortType: "name",
    title: "Finals MVP",
  },
  "award:mip": {
    desc: "Most Improved Player",
    sortType: "name",
    title: "MIP",
  },
  "award:mvp": {
    desc: "Most Valuable Player",
    sortType: "name",
    title: "MVP",
  },
  "award:roy": {
    desc: "Rookie of the Year",
    sortType: "name",
    title: "ROY",
  },
  "award:smoy": {
    desc: "Sixth Man of the Year",
    sortType: "name",
    title: "SMOY",
  },
  "award:oroy": {
    desc: "Offensive Rookie of the Year",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "OROY",
  },
  "award:droy": {
    desc: "Defensive Rookie of the Year",
    sortSequence: ["desc", "asc"],
    sortType: "number",
    title: "DROY",
  },
  ...sportSpecificCols,
};

export default (
  titles: string[],
  overrides: Record<string, Partial<Col>> = {}
): Col[] => {
  return titles.map((title) => {
    if (!cols.hasOwnProperty(title)) {
      throw new Error(`Unknown column: "${title}"`);
    }

    return {
      ...cols[title],
      title: cols[title].title ?? title,
      ...overrides[title],
    };
  });
};
