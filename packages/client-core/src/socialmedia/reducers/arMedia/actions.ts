/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
 import { func } from 'prop-types';
import {
    ARMEDIA_ADMIN_RETRIEVED,
    ARMEDIA_FETCHING,
    ARMEDIA_RETRIEVED,
    ADD_ARMEDIA,
    REMOVE_ARMEDIA
  } from '../actions';
  
  export interface ArMediaRetriveAction {
    type: string;
    list: any[];
  }
  export interface ArMediaOneAction {
    type: string;
    item: any;
  }
  
  export interface FetchingAction {
    type: string;
  }

  export interface FetchingArMediaItemAction {
    type: string;
    id:string;
  }
  
  export type ArMediaAction =
  ArMediaRetriveAction
  | FetchingAction
  | ArMediaOneAction
  | FetchingArMediaItemAction
  
  export function setAdminArMedia (list: any[]): ArMediaRetriveAction {
    return {
      type: ARMEDIA_ADMIN_RETRIEVED,
      list
    };
  }

  export function setArMedia (list: any[]): ArMediaRetriveAction {
    return {
      type: ARMEDIA_RETRIEVED,
      list
    };
  }  
  
  export function fetchingArMedia (): FetchingAction {
    return {
      type: ARMEDIA_FETCHING
    };
  }
  
  export function addAdminArMedia(item): ArMediaOneAction{
    return {
      type: ADD_ARMEDIA,
      item
    };
  }

  export function removeArMediaItem(id):FetchingArMediaItemAction{
    return {
      type: REMOVE_ARMEDIA,
      id
    };
  }