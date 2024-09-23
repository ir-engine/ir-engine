import { HyperFlux, HyperStore } from '@ir-engine/hyperflux'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {}
    }
  },
  interpolation: { escapeValue: false }
})

HyperFlux.store = <HyperStore>{
  stateMap: {}
}
