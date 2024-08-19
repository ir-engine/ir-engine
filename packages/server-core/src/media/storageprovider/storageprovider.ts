/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import config from '../../appconfig'
import IPFSStorage from './ipfs.storage'
import LocalStorage from './local.storage'
import S3Storage from './s3.storage'
import { StorageProviderInterface } from './storageprovider.interface'

const providers = {} as { [constructor: string]: StorageProviderInterface }

export const getStorageProvider = (provider = 'default') => providers[provider]

interface StorageProviderConstructor {
  new (): StorageProviderInterface
}

export const createStorageProvider = (constructor: StorageProviderConstructor) => {
  const storageProvider = new constructor()
  providers[constructor.name] = storageProvider
  return storageProvider
}

export const createIPFSStorageProvider = async () => {
  const IPFSProvider = new IPFSStorage()
  const podName = await IPFSProvider.getIPFSPod()

  if (!podName) {
    return console.log('Tried to initialize IPFS storage provider but could not communicate with the pod.')
  }

  await IPFSProvider.initialize(podName)

  providers['ipfs'] = IPFSProvider
  return IPFSProvider
}

export const createDefaultStorageProvider = () => {
  const StorageProvider =
    config.server.storageProvider !== 's3' && config.server.storageProvider !== 'ipfs' ? LocalStorage : S3Storage
  const provider = createStorageProvider(StorageProvider)
  providers['default'] = provider
  return provider
}
