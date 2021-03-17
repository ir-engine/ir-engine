import {
  CREATOR_RETRIEVED, 
  CREATOR_FETCH,
  CURRENT_CREATOR_RETRIEVED,
  CREATORS_RETRIEVED
} from '../actions';
import { Creator, CreatorShort } from '@xr3ngine/common/interfaces/Creator';

export interface CreatorRetrievedAction {
  type: string;
  creator: Creator;
}
export interface CreatorsRetrievedAction{
  type: string;
  creators: CreatorShort[];
}

export interface FetchingCreatorAction {
  type: string;
}


export type CreatorsAction =
CreatorRetrievedAction
  | FetchingCreatorAction
  | CreatorsRetrievedAction

export function creatorLoggedRetrieved(creator: Creator): CreatorRetrievedAction {
  return {
    type: CURRENT_CREATOR_RETRIEVED,
    creator
  };
}

export function creatorRetrieved (creator: Creator): CreatorRetrievedAction {
  return {
    type: CREATOR_RETRIEVED,
    creator
  };
}

export function fetchingCreator (): FetchingCreatorAction {
  return {
    type: CREATOR_FETCH
  };
}

export function creatorsRetrieved (creators: CreatorShort[]) : CreatorsRetrievedAction {
  return {
    type: CREATORS_RETRIEVED,
    creators
  };
}

