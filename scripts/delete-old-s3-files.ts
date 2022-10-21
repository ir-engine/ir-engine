/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs'
import cli from 'cli'
import {
    createDefaultStorageProvider,
    getStorageProvider
} from "@xrengine/server-core/src/media/storageprovider/storageprovider";

cli.enable('status');

cli.main(async () => {
    try {
        await createDefaultStorageProvider()
        const storageProvider = getStorageProvider()
        const files = JSON.parse(fs.readFileSync('S3FilesToRemove.json', { encoding: 'utf-8' }))
        while (files.length > 0) {
            const toDelete = files.splice(0, 1000)
            await storageProvider.deleteResources(toDelete)
        }
        console.log('Deleted old S3 files')
        process.exit(0)
    } catch(err) {
        console.log('Error in deleting old S3 client files:');
        console.log(err);
        cli.fatal(err)
    }
});
