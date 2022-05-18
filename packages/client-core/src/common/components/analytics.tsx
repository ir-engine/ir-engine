// TODO: Add config var for analytics ID
import ReactGA from 'react-ga4'

export const initGA = () => {
  if (globalThis.process.env['VITE_GA_MEASUREMENT_ID'] && globalThis.process.env['VITE_GA_MEASUREMENT_ID'].length > 0)
    ReactGA.initialize(globalThis.process.env['VITE_GA_MEASUREMENT_ID'])
}

export const logPageView = () => {
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname })
}
