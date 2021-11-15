import path from 'path'
import S3Provider from '../../src/media/storageprovider/s3.storage'
import appRootPath from 'app-root-path'
import fs from 'fs'
import { closeTestFileServer, createTestFileServer } from '../../src/createFileServer'
import config from '../../src/appconfig'

export const providerBeforeTest = (provider): Promise<any> => {
  if (provider.constructor.name === 'LocalStorage') return localStorageBeforeTest(provider)
  if (provider.constructor.name === 'S3Provider') return s3StorageBeforeTest(provider)
}

export const providerAfterTest = (provider): Promise<any> => {
  if (provider.constructor.name === 'LocalStorage') return localStorageAfterTest(provider)
  if (provider.constructor.name === 'S3Provider') return s3StorageAfterTest(provider)
}

const localStorageBeforeTest = (provider): Promise<any> => {
  return new Promise<void>((resolve) => {
    createTestFileServer()
    const testFolderName = 'TestFolder'
    const folderKeyTemp = path.join(testFolderName, 'temp')
    const folderKeyTemp2 = path.join(testFolderName, 'temp2')

    const dir = path.join(appRootPath.path, `packages/server/upload`, testFolderName)
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true })
    fs.mkdirSync(path.join(appRootPath.path, `packages/server/upload`, folderKeyTemp), { recursive: true })
    fs.mkdirSync(path.join(appRootPath.path, `packages/server/upload`, folderKeyTemp2), { recursive: true })
    resolve()
  })
}
const localStorageAfterTest = (provider): Promise<any> => {
  const testFolderName = 'TestFolder'
  return new Promise<void>((resolve) => {
    closeTestFileServer()
    const dir = path.join(appRootPath.path, `packages/server/upload`, testFolderName)
    fs.rmSync(dir, { recursive: true })
    resolve()
  })
}

const deleteS3Bucket = (provider: S3Provider): Promise<any> => {
  return new Promise((resolve) => {
    provider.provider
      .listObjectsV2({ Bucket: provider.bucket })
      .promise()
      .then((res) => {
        const promises = []
        res.Contents.forEach((element) => {
          promises.push(provider.provider.deleteObject({ Bucket: provider.bucket, Key: element.Key }).promise())
        })

        Promise.all(promises).then(() => {
          provider.provider
            .deleteBucket({
              Bucket: provider.bucket
            })
            .promise()
            .then(resolve)
        })
      })
  })
}
const s3StorageBeforeTest = async (provider: S3Provider): Promise<any> => {
  provider.bucket = 'xrengine-test-bucket'
  let bucketExists
  try {
    bucketExists = await provider.provider.headBucket({ Bucket: provider.bucket }).promise()
  } catch (err) {
    if (err.code !== 'NotFound') throw err
  }
  if (bucketExists != null) await deleteS3Bucket(provider)
  return provider.provider.createBucket({ Bucket: provider.bucket, ACL: 'public-read' }).promise()
}
const s3StorageAfterTest = (provider: S3Provider): Promise<any> => deleteS3Bucket(provider)
