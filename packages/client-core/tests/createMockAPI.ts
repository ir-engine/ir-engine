import { API } from '../src/API'

type MockFeathers = {
  on: (type: string, cb: () => {}) => void
  off: (type: string, cb: () => {}) => void
  find: (type: string) => Promise<void>
  get: (type: string) => Promise<void>
  create: (type: string) => Promise<void>
  patch: (type: string) => Promise<void>
  update: (type: string) => Promise<void>
  remove: (type: string) => Promise<void>
}

type ServicesToMock = {
  [name: string]: MockFeathers
}

export const createMockAPI = (servicesToMock?: ServicesToMock) => {
  return {
    client: {
      service: (service: string) => {
        if (servicesToMock && servicesToMock[service]) {
          return servicesToMock[service]
        } else {
          return {
            on: (type, cb) => {},
            off: (type, cb) => {},
            find: (type) => {},
            get: (type) => {},
            create: (type) => {},
            patch: (type) => {},
            update: (type) => {},
            remove: (type) => {}
          }
        }
      }
    }
  } as unknown as API
}
