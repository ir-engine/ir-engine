/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

import { TipsAndTricksShort, TipsAndTricks } from '@xrengine/common/src/interfaces/TipsAndTricks'

export const TIPSANDTRICKS_RETRIEVED = 'TIPSANDTRICKS_RETRIEVED'
export const TIPSANDTRICKS_FETCH = 'TIPSANDTRICKS_FETCH'
export const ADD_TIPSANDTRICKS = 'ADD_TIPSANDTRICKS'
export const REMOVE_TIPSANDTRICKS = 'REMOVE_TIPSANDTRICKS'
export const UPDATE_TIPSANDTRICKS = 'UPDATE_TIPSANDTRICKS'

export interface AllTipsAndTricksRetrievedAction {
  type: string
  tips_and_tricks: TipsAndTricksShort[]
}

export interface TipsAndTricksRetrievedAction {
  type: string
  tips_and_tricks: TipsAndTricks
}

export interface FetchingTipsAndTrickssAction {
  type: string
}

export interface oneTipsAndTricksAction {
  type: string
  tips_and_tricks: string
}

export type TipsAndTricksAction =
  | TipsAndTricksRetrievedAction
  | TipsAndTricksRetrievedAction
  | FetchingTipsAndTrickssAction
  | oneTipsAndTricksAction

export function tips_and_tricksRetrieved(tips_and_tricks: TipsAndTricks[]): AllTipsAndTricksRetrievedAction {
  // console.log('actions',tips_and_tricks)
  return {
    type: TIPSANDTRICKS_RETRIEVED,
    tips_and_tricks: tips_and_tricks
  }
}

export function fetchingTipsAndTricks(): FetchingTipsAndTrickssAction {
  return {
    type: TIPSANDTRICKS_FETCH
  }
}

export function deleteTipsAndTricks(tips_and_tricksId: string): oneTipsAndTricksAction {
  return {
    type: REMOVE_TIPSANDTRICKS,
    tips_and_tricks: tips_and_tricksId
  }
}

export function addTipsAndTricks(tips_and_tricks: TipsAndTricks): TipsAndTricksRetrievedAction {
  return {
    type: ADD_TIPSANDTRICKS,
    tips_and_tricks: tips_and_tricks
  }
}

export function updateTipsAndTricksInList(tips_and_tricks: TipsAndTricks): TipsAndTricksRetrievedAction {
  return {
    type: UPDATE_TIPSANDTRICKS,
    tips_and_tricks: tips_and_tricks
  }
}
