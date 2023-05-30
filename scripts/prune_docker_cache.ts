/* eslint-disable @typescript-eslint/no-var-requires */
import cli from 'cli'
import {
  createDefaultStorageProvider,
  getStorageProvider
} from '@etherealengine/server-core/src/media/storageprovider/storageprovider'
import { buffer } from 'node:stream/consumers'
import { DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

cli.enable('status');

const options = cli.parse({
    bucket: [true, 'Name of Bucket', 'string'],
    releaseName: [true, 'Name of release', 'string']
});

cli.main(async () => {
    try {
        await createDefaultStorageProvider()
        const storageProvider = getStorageProvider()
        const s3 = storageProvider.provider
        const listCommand = new ListObjectsV2Command({
            Bucket: options.bucket,
            Prefix: 'blobs/',
            Delimiter: '/'
        })
        const result = await s3.send(listCommand)
        const manifestCommand = new GetObjectCommand({ Bucket: options.bucket, Key: `manifests/latest_${options.releaseName}` })
        const manifestResult = await s3.send(manifestCommand)
        const bufferBody = await buffer(manifestResult.Body)
        const manifest = JSON.parse(bufferBody.toString())
        const layers = manifest.layers
        const matches = layers.map(layer => layer.blob)
        const layersToRemove = result.Contents.filter(item => matches.indexOf(item.Key.replace('blobs/', '')) < 0).map(item => { return { Key: item.Key }})
        const deleteCommand = new DeleteObjectsCommand({
            Bucket: options.bucket,
            Delete: {
                Objects: layersToRemove
            }
        })
        await s3.send(deleteCommand)
        console.log('Pruned Docker build cache', options)
        process.exit(0)
    } catch(err) {
        console.log('Error in pruning Docker build cache', options);
        console.log(err);
    }
});
