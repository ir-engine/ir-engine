import {
  CREATED_PARTY,
  PATCHED_PARTY,
  LOADED_PARTY,
  REMOVED_PARTY,
  LEFT_PARTY,
  INVITED_PARTY_USER,
  REMOVED_PARTY_USER,
  CREATED_PARTY_USER,
  PATCHED_PARTY_USER
} from '../actions';
import { Party } from '@xr3ngine/common/interfaces/Party';
import { PartyUser } from '@xr3ngine/common/interfaces/PartyUser';
import { PartyResult } from '@xr3ngine/common/interfaces/PartyResult';
import { PartyUserResult } from '@xr3ngine/common/interfaces/PartyUserResult';

export interface LoadedPartyAction {
  type: string;
  party: Party;
}

export interface PatchedPartyAction {
  type: string;
  party: Party;
}

export interface CreatedPartyAction {
  type: string;
  party: Party;
}

export interface RemovedPartyAction {
  type: string;
  party: Party;
}

export interface CreatedPartyUserAction {
  type: string;
  partyUser: PartyUser;
}

export interface PatchedPartyUserAction {
  type: string;
  partyUser: PartyUser;
}

export interface RemovedPartyUserAction {
  type: string;
  partyUser: PartyUser;
}

export interface InvitedPartyUserAction {
  type: string;
}

export interface LeftPartyAction {
  type: string;
}

export type PartyAction =
    LoadedPartyAction
    | CreatedPartyAction
    | PatchedPartyAction
    | RemovedPartyAction
    | LeftPartyAction
    | CreatedPartyUserAction
    | PatchedPartyUserAction

export function loadedParty(partyResult: PartyResult): PartyAction {
  return {
    type: LOADED_PARTY,
    party: partyResult
  };
}

export function createdParty(party: Party): CreatedPartyAction {
  return {
    type: CREATED_PARTY,
    party: party
  };
}

export function patchedParty(party: Party): PatchedPartyAction {
  return {
    type: PATCHED_PARTY,
    party: party
  };
}

export function removedParty(party: Party): RemovedPartyAction {
  return {
    type: REMOVED_PARTY,
    party: party
  };
}

export function invitedPartyUser(): InvitedPartyUserAction {
  return {
    type: INVITED_PARTY_USER
  };
}

export function leftParty(): LeftPartyAction {
  return {
    type: LEFT_PARTY
  };
}

export interface LoadedSelfPartyUserAction {
  type: string;
  selfPartyUser: PartyUser;
  total: number;
}

export interface LoadedPartyUsersAction {
  type: string;
  partyUsers: PartyUser[];
  total: number;
  limit: number;
  skip: number;
}

export interface RemovedPartyUserAction {
  type: string;
}

export type PartyUserAction =
    LoadedPartyUsersAction
    | RemovedPartyUserAction
    | LoadedSelfPartyUserAction


export function createdPartyUser(partyUser: PartyUser): CreatedPartyUserAction {
  return {
    type: CREATED_PARTY_USER,
    partyUser: partyUser
  };
}

export function patchedPartyUser(partyUser: PartyUser): PatchedPartyUserAction {
  return {
    type: PATCHED_PARTY_USER,
    partyUser: partyUser
  };
}

export function removedPartyUser(partyUser: PartyUser): RemovedPartyUserAction {
  return {
    type: REMOVED_PARTY_USER,
    partyUser: partyUser
  };
}