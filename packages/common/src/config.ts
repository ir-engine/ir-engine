export function validateEmail(email: string): boolean {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
  return /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone)
}

export class Config {
  static publicRuntimeConfig = {
    title: 'The Overlay',
    dev: false,
    loginDisabled: false,
    logo: './logo.svg',
    gameserverHost: 'localhost',
    gameserverPort: '3031',
    apiServer: 'https://localhost:3030',
    appServer: 'https://localhost:3000',
    gameserver: 'https://localhost:3031',
    mediatorServer: 'https://authn.io',
    wasmUrl: 'https://localhost:3000/recast/recast.wasm',
    readyPlayerMeUrl: 'https://xre.readyplayer.me',
    gameserverDomain: '',
    lobbyLocationName: 'lobby',
    siteTitle: 'The Overlay',
    gaMeasurementId: '',
    siteDescription: 'Connected Worlds for Everyone',
    feathersStoreKey: 'TheOverlay-Auth-Store',
    localStorageKey: 'theoverlay-client-store-key-v1',
    // TODO: find a better place for API keys
    MAPBOX_API_KEY: 'pk.eyJ1IjoicHNjYWxlMDEiLCJhIjoiY2pkcWI5NzVhMDJvdTJxbzlrcDRoOTVhayJ9.fCWGc7YYwB0bz9Dc8AloNA',
    rootRedirect: false,
    auth: {
      enableSmsMagicLink: true,
      enableEmailMagicLink: true,
      enableUserPassword: true,
      enableGithubSocial: true,
      enableFacebookSocial: true,
      enableGoogleSocial: true,
      enableLinkedInSocial: true,
      enableTwitterSocial: true
    },
    alert: {
      timeout: 10000
    },
    offlineMode: false,
    staticPages: {
      termsOfService: ''
    },
    disableRenderer: false
  }
}

export const setRuntime = (runtime: any): void => {
  const newConfig = typeof runtime === 'string' ? JSON.parse(runtime) : runtime
  Config.publicRuntimeConfig = Object.assign({}, Config.publicRuntimeConfig, newConfig)
}
