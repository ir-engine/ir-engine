import { helpers as commonHelpers } from "../../common";
import { local } from "./local";

const leagueUrl = (components: (number | string | undefined)[]): string => {
  const lid = local.getState().lid;

  if (typeof lid !== "number") {
    return "/";
  }

  return commonHelpers.leagueUrlFactory(lid, components);
};

const plusMinus = (arg: number, d: number): string => {
  if (Number.isNaN(arg)) {
    return "";
  }

  return (arg > 0 ? "+" : "") + arg.toFixed(d);
};

const roundOverrides: Record<
  string,
  | "none"
  | "oneDecimalPlace"
  | "twoDecimalPlaces"
  | "roundWinp"
  | "plusMinus"
  | "plusMinusNoDecimalPlace"
  | "noDecimalPlace"
  | "minutes"
  | undefined
> = {
  gp: "noDecimalPlace",
  gs: "noDecimalPlace",
  min: "oneDecimalPlace",
  yearsWithTeam: "noDecimalPlace",
  gmsc: "oneDecimalPlace",
  fgp: "oneDecimalPlace",
  tpp: "oneDecimalPlace",
  "2pp": "oneDecimalPlace",
  efg: "oneDecimalPlace",
  ftp: "oneDecimalPlace",
  ws48: "roundWinp",
  pm: "plusMinus",
  ftpFga: "roundWinp",
  tpar: "roundWinp",
  ftr: "roundWinp",
  bpm: "oneDecimalPlace",
  obpm: "oneDecimalPlace",
  dbpm: "oneDecimalPlace",
  vorp: "oneDecimalPlace",
  fgMax: "noDecimalPlace",
  fgaMax: "noDecimalPlace",
  tpMax: "noDecimalPlace",
  tpaMax: "noDecimalPlace",
  "2pMax": "noDecimalPlace",
  "2paMax": "noDecimalPlace",
  ftMax: "noDecimalPlace",
  ftaMax: "noDecimalPlace",
  orbMax: "noDecimalPlace",
  drbMax: "noDecimalPlace",
  trbMax: "noDecimalPlace",
  astMax: "noDecimalPlace",
  tovMax: "noDecimalPlace",
  stlMax: "noDecimalPlace",
  blkMax: "noDecimalPlace",
  baMax: "noDecimalPlace",
  pfMax: "noDecimalPlace",
  ptsMax: "noDecimalPlace",
  pmMax: "plusMinusNoDecimalPlace",
  dd: "noDecimalPlace",
  td: "noDecimalPlace",
  qd: "noDecimalPlace",
  fxf: "noDecimalPlace",
  oppDd: "noDecimalPlace",
  oppTd: "noDecimalPlace",
  oppQd: "noDecimalPlace",
  oppFxf: "noDecimalPlace",
};

const roundStat = (
  value: number | string,
  stat: string,
  totals: boolean = false
): string => {
  try {
    if (typeof value === "string") {
      return value;
    }

    // Number of decimals for many stats
    const d = totals ? 0 : 1;

    if (Number.isNaN(value)) {
      value = 0;
    }

    if (roundOverrides[stat] === "minutes") {
      if (value > 100) {
        return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
      }

      if (value === 0) {
        return "--:--";
      }

      const remainder = value % 1;
      let seconds = Math.round(remainder * 60);
      let minutes = Math.floor(value);
      while (seconds >= 60) {
        minutes += 1;
        seconds -= 60;
      }
      return `${minutes}:${seconds >= 10 ? seconds : `0${seconds}`}`;
    }

    if (roundOverrides[stat] === "oneDecimalPlace") {
      if (value === 100) {
        return "100";
      }

      return value.toLocaleString("en-US", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
      });
    }

    if (roundOverrides[stat] === "twoDecimalPlaces") {
      return value.toLocaleString("en-US", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      });
    }

    if (roundOverrides[stat] === "roundWinp") {
      return commonHelpers.roundWinp(value);
    }

    if (roundOverrides[stat] === "plusMinus") {
      return plusMinus(value, d);
    }

    if (roundOverrides[stat] === "plusMinusNoDecimalPlace") {
      return plusMinus(value, 0);
    }

    if (roundOverrides[stat] === "noDecimalPlace") {
      return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
    }

    return value.toLocaleString("en-US", {
      maximumFractionDigits: d,
      minimumFractionDigits: d,
    });
  } catch (err) {
    return "";
  }
};

const yearRanges = (arrInput: number[]): string[] => {
  if (arrInput.length <= 1) {
    return arrInput.map(String);
  }

  const arr = [...arrInput];
  arr.sort((a, b) => a - b);

  const runArr: string[] = [];
  const tempArr = [[arr[0]]];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] - arr[i - 1] > 1) {
      tempArr.push([]);
    }

    tempArr.at(-1).push(arr[i]);
  }

  for (let i = 0; i < tempArr.length; i++) {
    // runs of up to 2 consecutive years are displayed individually
    if (tempArr[i].length <= 2) {
      runArr.push(String(tempArr[i][0]));

      if (tempArr[i].length === 2) {
        runArr.push(String(tempArr[i][1]));
      }
    } else {
      // runs of 3 or more are displayed as a range
      runArr.push(`${tempArr[i][0]}-${tempArr[i].at(-1)}`);
    }
  }

  return runArr;
};

const helpers = {
  ...commonHelpers,
  leagueUrl,
  plusMinus,
  roundStat,
  yearRanges,
};

export default helpers;
