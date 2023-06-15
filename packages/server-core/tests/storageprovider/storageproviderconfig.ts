import { DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3'
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

    const dir = path.join(appRootPath.path, `packages/server/upload_test`, testFolderName)
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true })
    fs.mkdirSync(path.join(appRootPath.path, `packages/server/upload_test`, folderKeyTemp), { recursive: true })
    fs.mkdirSync(path.join(appRootPath.path, `packages/server/upload_test`, folderKeyTemp2), { recursive: true })
    resolve()
  })
}
const localStorageAfterTest = (provider, testFolderName): Promise<any> => {
  return new Promise<void>((resolve) => {
    const dir = path.join(appRootPath.path, `packages/server/upload_test`, testFolderName)
    fs.rmSync(dir, { recursive: true })
    resolve()
  })
}

const clearS3TestFolder = (provider: S3Provider, testFolderName: string): Promise<any> => {
  return new Promise((resolve) => {
    const command = new ListObjectsV2Command({
      Bucket: provider.bucket,
      Prefix: testFolderName
    })
    provider.provider.send(command).then((res) => {
      const promises: Promise<any>[] = []
      res.Contents!.forEach((element) => {
        const command = new DeleteObjectCommand({ Bucket: provider.bucket!, Key: element.Key! })
        promises.push(provider.provider.send(command))
      })

      Promise.all(promises).then(resolve)
    })
  })
}
const s3StorageBeforeTest = async (provider: S3Provider): Promise<any> => {
  provider.bucket = process.env.STORAGE_S3_TEST_RESOURCE_BUCKET!

  let bucketExists
  try {
    bucketExists = await provider.provider.send(new HeadBucketCommand({ Bucket: provider.bucket }))
  } catch (err) {
    if (err.code !== 'NotFound') throw err
  }
  if (bucketExists == null) {
    await provider.provider.send(new CreateBucketCommand({ Bucket: provider.bucket, ACL: 'public-read' }))
  }
  return
}
const s3StorageAfterTest = (provider: S3Provider, testFolderName): Promise<any> =>
  clearS3TestFolder(provider, testFolderName)
