import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { StartTestFileServer } from '../../src/createFileServer'
import S3Provider from '../../src/media/storageprovider/s3.storage'

export const providerBeforeTest = (provider, testFolderName: string, folderKeyTemp: string, folderKeyTemp2: string) => {
  if (provider.constructor.name === 'LocalStorage')
    return localStorageBeforeTest(testFolderName, folderKeyTemp, folderKeyTemp2)
  if (provider.constructor.name === 'S3Provider') return s3StorageBeforeTest(provider)
}

export const providerAfterTest = (provider, testFolderName: string) => {
  if (provider.constructor.name === 'LocalStorage') return localStorageAfterTest(provider, testFolderName)
  if (provider.constructor.name === 'S3Provider') return s3StorageAfterTest(provider, testFolderName)
}

const localStorageBeforeTest = (
  testFolderName: string,
  folderKeyTemp: string,
  folderKeyTemp2: string
): Promise<any> => {
  return new Promise<void>((resolve) => {
    StartTestFileServer()

    const dir = path.join(appRootPath.path, `packages/server/upload`, testFolderName)
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true })
    fs.mkdirSync(path.join(appRootPath.path, `packages/server/upload`, folderKeyTemp), { recursive: true })
    fs.mkdirSync(path.join(appRootPath.path, `packages/server/upload`, folderKeyTemp2), { recursive: true })
    resolve()
  })
}
const localStorageAfterTest = (provider, testFolderName): Promise<any> => {
  return new Promise<void>((resolve) => {
    const dir = path.join(appRootPath.path, `packages/server/upload`, testFolderName)
    fs.rmSync(dir, { recursive: true })
    resolve()
  })
}

const clearS3TestFolder = (provider: S3Provider, testFolderName: string): Promise<any> => {
  return new Promise((resolve) => {
    provider.provider
      .listObjectsV2({ Bucket: provider.bucket, Prefix: testFolderName })
      .promise()
      .then((res) => {
        const promises: any[] = []
        res.Contents!.forEach((element) => {
          promises.push(provider.provider.deleteObject({ Bucket: provider.bucket!, Key: element.Key! }).promise())
        })

        Promise.all(promises).then(resolve)
      })
  })
}
const s3StorageBeforeTest = async (provider: S3Provider): Promise<any> => {
  provider.bucket = process.env.STORAGE_S3_TEST_RESOURCE_BUCKET!

  let bucketExists
  try {
    bucketExists = await provider.provider.headBucket({ Bucket: provider.bucket }).promise()
  } catch (err) {
    if (err.code !== 'NotFound') throw err
  }
  if (bucketExists == null)
    await provider.provider.createBucket({ Bucket: provider.bucket, ACL: 'public-read' }).promise()
  return
}
const s3StorageAfterTest = (provider: S3Provider, testFolderName): Promise<any> =>
  clearS3TestFolder(provider, testFolderName)
