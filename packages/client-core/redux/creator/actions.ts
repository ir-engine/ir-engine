import {
  CREATOR_RETRIEVED, 
  CREATOR_FETCH,
  CURRENT_CREATOR_RETRIEVED,
} from '../actions';
import { Creator } from '@xr3ngine/common/interfaces/Creator';

export interface CreatorRetrievedAction {
  type: string;
  creator: Creator;
}

export interface FetchingCreatorAction {
  type: string;
}


export type CreatorsAction =
CreatorRetrievedAction
  | FetchingCreatorAction

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
