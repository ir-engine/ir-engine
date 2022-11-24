import ReactGA from 'react-ga4'

import config from '@xrengine/common/src/config'

export const initGA = () => {
  if (config.client.gaMeasurementId && config.client.gaMeasurementId.length > 0)
    ReactGA.initialize(config.client.gaMeasurementId)
}

export const logPageView = () => {
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname })
}
