import React from 'react'

/**
 * initializing defaultSettings with empty context.
 *
 * @author Robert Long
 * @type {Object}
 */
export const defaultSettings = {}

/**
 * SettingsContext creating react context.
 *
 * @author Robert Long
 */
const SettingsContext = React.createContext({
  settings: defaultSettings,
  updateSetting: () => {}
})

/**
 * SettingsContextProvider provides component context value.
 *
 * @author Robert Long
 */
export const SettingsContextProvider = SettingsContext.Provider

/**
 * withSettings setting component context value.
 *
 * @author Robert Long
 */
export function withSettings(Component) {
  return function SettingsContextComponent(props) {
    return <SettingsContext.Consumer>{(ctx) => <Component {...props} {...ctx} />}</SettingsContext.Consumer>
  }
}
