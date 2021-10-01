import { ADMIN_AWS_SETTING_FETCHED } from '../../../actions'

export interface AwsSettingFetchedAction {
  type: string
  list: any[]
}

export function awsSettingRetrieved(data: any): AwsSettingFetchedAction {
  return {
    type: ADMIN_AWS_SETTING_FETCHED,
    list: data
  }
}
