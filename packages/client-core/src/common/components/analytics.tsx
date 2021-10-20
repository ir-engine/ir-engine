// TODO: Add config var for analytics ID
import ReactGA from 'react-ga4'
import { Config } from '@xrengine/common/src/config'

export const initGA = () => {
  if (Config.publicRuntimeConfig.gaMeasurementId && Config.publicRuntimeConfig.gaMeasurementId.length > 0)
    ReactGA.initialize(Config.publicRuntimeConfig.gaMeasurementId)
}

export const logPageView = () => {
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname })
}
