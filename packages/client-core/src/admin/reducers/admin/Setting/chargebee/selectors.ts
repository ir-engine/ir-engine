import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('adminChargeBeeSetting')
}

export const selectAdminChargeBeeSettingState = createSelector(
  [selectState],
  (adminChargeBeeSetting) => adminChargeBeeSetting
)
