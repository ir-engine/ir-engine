/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

import { ReportsShort, Reports } from '@xrengine/common/src/interfaces/Reports'

// const reports = '';
// conts Reports = '';
// const REPORTS = '';

export const REPORTS_RETRIEVED = 'REPORTS_RETRIEVED'
export const REPORTS_FETCH = 'REPORTS_FETCH'
export const ADD_REPORTS = 'ADD_REPORTS'
export const REMOVE_REPORTS = 'REMOVE_REPORTS'
export const UPDATE_REPORTS = 'UPDATE_REPORTS'
export const ADD_REPORTS_FIRES = 'ADD_REPORTS_FIRES'
export const REMOVE_REPORTS_FIRES = 'REMOVE_REPORTS_FIRES'
export const ADD_REPORTS_BOOKMARK = 'ADD_REPORTS_BOOKMARK'
export const REMOVE_REPORTS_BOOKMARK = 'REMOVE_REPORTS_BOOKMARK'
export interface AllReportsRetrievedAction {
  type: string
  reports: ReportsShort[]
}

export interface ReportsRetrievedAction {
  type: string
  reports: Reports
}

export interface FetchingReportsAction {
  type: string
}

export interface oneReportsAction {
  type: string
  reports: string
}

export type ReportsAction = ReportsRetrievedAction | ReportsRetrievedAction | FetchingReportsAction | oneReportsAction

export function reportsRetrieved(reports: Reports[]): AllReportsRetrievedAction {
  // console.log('actions',reports)
  return {
    type: REPORTS_RETRIEVED,
    reports: reports
  }
}

export function fetchingReports(): FetchingReportsAction {
  return {
    type: REPORTS_FETCH
  }
}

export function deleteReports(reportsId: string): oneReportsAction {
  return {
    type: REMOVE_REPORTS,
    reports: reportsId
  }
}

export function addReports(reports: Reports): ReportsRetrievedAction {
  return {
    type: ADD_REPORTS,
    reports: reports
  }
}

export function updateReportsInList(reports: Reports): ReportsRetrievedAction {
  return {
    type: UPDATE_REPORTS,
    reports: reports
  }
}

export function addReportsFire(reports: string): oneReportsAction {
  return {
    type: ADD_REPORTS_FIRES,
    reports: reports
  }
}

export function removeReportsFire(reports: string): oneReportsAction {
  return {
    type: REMOVE_REPORTS_FIRES,
    reports: reports
  }
}

//The code is not in use START
export function addReportsBookmark(reports: string): oneReportsAction {
  return {
    type: ADD_REPORTS_BOOKMARK,
    reports: reports
  }
}
export function removeReportsBookmark(reports: string): oneReportsAction {
  return {
    type: REMOVE_REPORTS_BOOKMARK,
    reports
  }
}
//The code below is not in use END
