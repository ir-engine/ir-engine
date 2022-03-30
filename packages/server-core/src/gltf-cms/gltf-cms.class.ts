import { ServiceMethods } from '@feathersjs/feathers/lib'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { Application } from '@xrengine/server-core/declarations'

import { useStorageProvider } from '../media/storageprovider/storageprovider'

const storageProvider = useStorageProvider()
/*
export class GLTF_CMS implements ServiceMethods<any> {
    app: Application
    docs: any

    constructor(app: Application) {
        this.app = app
    }

    async setup() {}

    async find(parms): Promise<{  }> {

    }
}*/
