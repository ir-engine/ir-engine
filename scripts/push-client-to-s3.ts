/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs'
import appRootPath from 'app-root-path'
import cli from 'cli'
import path from 'path'
import { getStorageProvider, createDefaultStorageProvider } from '@xrengine/server-core/src/media/storageprovider/storageprovider'
import {getFilesRecursive} from "@xrengine/server-core/src/util/fsHelperFunctions"
import  {processFileName} from "@xrengine/common/src/utils/processFileName"
import {getContentType} from "@xrengine/server-core/src/util/fileUtils"
import logger from "@xrengine/server-core/src/ServerLogger"

cli.enable('status');

const options = cli.parse({});

cli.main(async () => {
    try {
        await createDefaultStorageProvider()
        const storageProvider = getStorageProvider()
        const clientPath = path.resolve(appRootPath.path, `packages/client/dist`)
        const files = getFilesRecursive(clientPath)
        await Promise.all(
            files
                .map((file) => {
                    return new Promise(async (resolve) => {
                        try {
                            const fileResult = fs.readFileSync(file)
                            let filePathRelative = processFileName(file.slice(clientPath.length))
                            let contentType = getContentType(file)
                            const putData = {
                                Body: fileResult,
                                ContentType: contentType,
                                Key: `client${filePathRelative}`
                            }
                            if (/.br$/.exec(filePathRelative)) {
                                filePathRelative = filePathRelative.replace(/.br$/, '')
                                putData.ContentType = getContentType(filePathRelative)
                                putData.ContentEncoding = 'br'
                                putData.Key = `client${filePathRelative}`
                            }
                            await storageProvider.putObject(putData, { isDirectory: false })
                            resolve()
                        } catch (e) {
                            logger.error(e)
                            resolve(null)
                        }
                    })
                })
        )
        console.log('Pushed client files to S3')
        process.exit(0)
    } catch(err) {
        console.log('Error in pushing client images to S3:');
        console.log(err);
        cli.fatal(err)
    }
});
