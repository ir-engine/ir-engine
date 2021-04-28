/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

import { TipsAndTricksShort, TipsAndTricks } from '@xr3ngine/common/src/interfaces/TipsAndTricks';


export const TIPSANDTRICKS_RETRIEVED = 'TIPSANDTRICKS_RETRIEVED';
export const TIPSANDTRICKS_FETCH = 'TIPSANDTRICKS_FETCH';
export const TIPSANDTRICKS_FEATURED_RETRIEVED = 'TIPSANDTRICKS_FEATURED_RETRIEVED';
export const ADD_TIPSANDTRICKS_VIEW = 'ADD_TIPSANDTRICKS_VIEW';
export const ADD_TIPSANDTRICKS = 'ADD_TIPSANDTRICKS';
export const TIPSANDTRICKS_CREATOR_RETRIEVED = 'TIPSANDTRICKS_CREATOR_RETRIEVED';
export const TIPSANDTRICKS_BOOKMARK_RETRIEVED = 'TIPSANDTRICKS_BOOKMARK_RETRIEVED';
export const TIPSANDTRICKS_MY_FEATURED_RETRIEVED = 'TIPSANDTRICKS_MY_FEATURED_RETRIEVED';
export const ADD_TIPSANDTRICKS_FEATURED = 'ADD_TIPSANDTRICKS_FEATURED';
export const REMOVE_TIPSANDTRICKS = 'REMOVE_TIPSANDTRICKS';
export const TIPSANDTRICKS_AS_ADMIN_RETRIEVED = 'TIPSANDTRICKS_AS_ADMIN_RETRIEVED';
export const UPDATE_TIPSANDTRICKS = 'UPDATE_TIPSANDTRICKS';


export interface TipsAndTricksRetrievedAction {
  type: string;
  tips_and_tricks: TipsAndTricksShort[];
}

// export interface TipsAndTricksRetrievedAction {
//   type: string;
//   tips_and_tricks: TipsAndTricks;
// }
//!!!!!!

export interface FetchingTipsAndTrickssAction {
  type: string;
}

export interface oneTipsAndTricksAction {
  type: string;
  tips_and_tricks: string;
}

export type TipsAndTricksAction =
    TipsAndTricksRetrievedAction
  | TipsAndTricksRetrievedAction
  | FetchingTipsAndTrickssAction
  | oneTipsAndTricksAction

export function tips_and_tricksRetrieved (tips_and_tricks: TipsAndTricks[]): TipsAndTricksRetrievedAction {
  return {
    type: TIPSANDTRICKS_RETRIEVED,
    tips_and_tricks: tips_and_tricks
  };
}

// export function tips_and_tricksFeaturedRetrieved (tips_and_tricks: TipsAndTricksShort[]): TipsAndTricksRetrievedAction {
//   return {
//     type: TIPSANDTRICKS_FEATURED_RETRIEVED,
//     tips_and_tricks: tips_and_tricks
//   };
// }

export function tips_and_tricksCreatorRetrieved(tips_and_tricks: TipsAndTricksShort[]): TipsAndTricksRetrievedAction {
  return {
    type: TIPSANDTRICKS_CREATOR_RETRIEVED,
    tips_and_tricks: tips_and_tricks
  };
}

export function tips_and_tricksBookmarkRetrieved(tips_and_tricks: TipsAndTricksShort[]): TipsAndTricksRetrievedAction {
  return {
    type: TIPSANDTRICKS_BOOKMARK_RETRIEVED,
    tips_and_tricks: tips_and_tricks
  };
}

export function tips_and_tricksMyFeaturedRetrieved(tips_and_tricks: TipsAndTricksShort[]): TipsAndTricksRetrievedAction {
  return {
    type: TIPSANDTRICKS_MY_FEATURED_RETRIEVED,
    tips_and_tricks: tips_and_tricks
  };
}


export function fetchingTipsAndTricks (): FetchingTipsAndTrickssAction {
  return {
    type: TIPSANDTRICKS_FETCH
  };
}

export function removeTipsAndTricks() {
  return {

  }
}


// export function tips_and_tricksAsFeatured(tips_and_tricksId:string) : oneTipsAndTricksAction{
//   return {
//     type: ADD_TIPSANDTRICKS_FEATURED,
//     tips_and_tricksId: tips_and_tricksId
//   };
// }

// export function tips_and_tricksNotFeatured(tips_and_tricksId:string) : oneTipsAndTricksAction{
//   return {
//     type: REMOVE_TIPSANDTRICKS_FEATURED,
//     tips_and_tricksId: tips_and_tricksId
//   };
// }



// export function addTipsAndTricks(tips_and_tricks:TipsAndTricks): TipsAndTricksRetrievedAction{
//   return {
//     type: ADD_TIPSANDTRICKS,
//     tips_and_tricks: tips_and_tricks
//   };
// }
//!!!!!!



// export function tips_and_tricksAdminRetrieved(tips_and_tricks: any[]): TipsAndTricksRetrievedAction {
//   return {
//     type: TIPSANDTRICKS_AS_ADMIN_RETRIEVED,
//     tips_and_tricks: tips_and_tricks
//   };
// }





// export function updateTipsAndTricksInList(tips_and_tricks: TipsAndTricks): TipsAndTricksRetrievedAction{
//   return {
//     type: UPDATE_TIPSANDTRICKS,
//     tips_and_tricks
//   };
// }
//!!!!!!