import fs from 'fs-blob-store'
import { StorageProviderInterface } from './storageprovider.interface'

export class LocalStorage implements StorageProviderInterface {
  path = './upload'

  getProvider = (): StorageProviderInterface => this
  getStorage = (): any => fs(this.path)

  deleteResources(keys: string[]): Promise<any> {
    const blobs = this.getStorage()

    return Promise.all(
      keys.map((key) => {
        return new Promise((resolve) => {
          blobs.exists(key, (err, exists) => {
            if (err) {
              console.error(err)
              resolve(false)
              return
            }

            if (exists)
              blobs.remove(key, (err) => {
                if (err) {
                  console.error(err)
                  resolve(false)
                  return
                }

                resolve(true)
              })

            resolve(true)
          })
        })
      })
    )
  }
}
export default LocalStorage
