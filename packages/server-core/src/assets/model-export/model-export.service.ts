import appRootPath from 'app-root-path'

import { Application } from '../../../declarations'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'model-export': any
  }
}
/*
export default (app: Application) => {
    app.use('model-export', {
        export: 
    })
}*/
