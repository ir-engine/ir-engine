/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023
Ethereal Engine. All Rights Reserved.
*/

import appRootPath from "app-root-path";
import { exec, spawnSync } from 'child_process'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import fs from 'fs'
import path from 'path'
import util from 'util'

const promiseExec = util.promisify(exec)

import config from '@etherealengine/server-core/src/appconfig'
import { useGit } from "@etherealengine/server-core/src/util/gitHelperFunctions";
import { getContentType } from '@etherealengine/server-core/src/util/fileUtils'
import {
    createStorageProvider,
    getStorageProvider
} from '@etherealengine/server-core/src/media/storageprovider/storageprovider'
import { getFilesRecursive } from "@etherealengine/server-core/src/util/fsHelperFunctions";
import LocalStorage from "@etherealengine/server-core/src/media/storageprovider/local.storage";
import S3Storage from "@etherealengine/server-core/src/media/storageprovider/s3.storage";
import logger from "@etherealengine/server-core/src/ServerLogger";

dotenv.config({
    path: appRootPath.path,
    silent: true
})

const options = cli.parse({
    projects: [true, 'Comma-delimited list of projects to use, first project is one to build from, specify branch by appending via colon to project name, include org and repo separated by slash, e.g. etherealengine/ee-example-project:dev,etherealengine/ee-example-project-2:prod', 'string'],
    storageProvider: [true, 'Storage Provider to use', 'string'],
    token: [true, 'GitHub OAuth Token', 'string'],
    user: [true, 'GitHub username', 'string'],
    bucketName: [true, 'Name of bucket to upload to', 'string'],
    region: [true, 'AWS region of bucket', 'string'],
    domain: [true, 'Domain to serve files from', 'string'],
    accessKey: [false, 'Public access key', 'string'],
    secretKey: [false, 'Secret access key', 'string'],
    distributionId: [false, 'Cloudfront Distribution ID', 'string'],
    intervalMinutes: [false, 'Number of minutes between re-deploying client', 'string']
})

cli.main(async () => {
    let interval
    if (options.intervalMinutes) interval = parseInt(options.intervalMinutes)
    const projectLocalDirectory = path.resolve(appRootPath.path, `packages/projects/projects/`)
    const StorageProvider = options.storageProvider === 's3' ? S3Storage: LocalStorage
    if (options.storageProvider === 's3') {
        config.server.storageProvider = 's3'
        config.aws.s3.staticResourceBucket = options.bucketName
        config.aws.s3.region = options.region
        config.aws.s3.accessKeyId = options.accessKey
        config.aws.s3.secretAccessKey = options.secretKey
        config.aws.cloudfront.distributionId = options.distributionId
        config.aws.cloudfront.region = options.region
        config.aws.cloudfront.domain = options.domain
    }
    console.log('config', config)
    const storageProvider = createStorageProvider(StorageProvider)
    console.log(storageProvider)
    const projects = options.projects.split(',')
    let rootProject, rootProjectDirectory

    const runDeploy = async () => {
        const promises = [] as Promise<void>[]
        for (const [index, project] of projects.entries()) {
            promises.push(new Promise(async (resolve, reject) => {
                const split = project.split(':')
                const projectSplit = split[0].split('/')
                const org = projectSplit[0]
                const projectName = projectSplit[1]
                const branch = split.length > 1 ? split[1] : 'main'
                const projectDirectory = path.resolve(appRootPath.path, `packages/projects/projects/${projectName}/`)
                if (!fs.existsSync(projectDirectory)) fs.mkdirSync(projectDirectory, { recursive: true })
                if (index === 0) {
                    rootProject = projectName
                    rootProjectDirectory = projectDirectory
                }
                await promiseExec(`npx rimraf packages/projects/projects/${projectName}`)
                const authRepo = `https://${options.user}:${options.token}@github.com/${org}/${projectName}`
                const gitCloner = useGit(projectLocalDirectory)
                await gitCloner.clone(authRepo, projectDirectory)
                const git = useGit(projectDirectory)
                try {
                    await git.checkout(branch)
                } catch (e) {
                    logger.warn(e)
                }
                resolve()
            }))
        }

        await Promise.all(promises)
        await promiseExec(`cp packages/client/client-only-build/vite.config.ts packages/projects/projects/${rootProject}/`)
        await promiseExec(`cp -r packages/client/public packages/projects/projects/${rootProject}`)
        const rootPath = path.resolve(appRootPath.path)
        // const npmInstallPromise = new Promise<void>((resolve) => {
        //     const npmInstallProcess = spawn('npm', ['install', '--legacy-peer-deps'], { cwd: rootPath })
        //         npmInstallProcess.once('exit', () => {
        //           logger.info('Finished npm installing %s', rootProject)
        //           resolve()
        //         })
        //         npmInstallProcess.once('error', resolve)
        //         npmInstallProcess.once('disconnect', resolve)
        //         npmInstallProcess.stdout.on('data', (data) => logger.info(data.toString()))
        //         npmInstallProcess.stderr.on('data', (data) => logger.error(data.toString()))
        //       })
        // await npmInstallPromise
        const projectPath = path.resolve(appRootPath.path, `packages/projects/projects/${rootProject}`)
        const projectFiles = getFilesRecursive(projectPath)
        const projectFilesFiltered = projectFiles.filter((file) => !file.includes(`projects/${rootProject}/.git/`))
        for (let file of projectFilesFiltered) {
            const fileName = file.split(`packages/projects/`)[1]
            const fileContent = fs.readFileSync(file)
            await storageProvider.putObject(
                {
                    Body: fileContent,
                    ContentType: getContentType(fileName),
                    Key: fileName
                }
            )
        }

        await promiseExec(`cd packages/projects/projects/${rootProject} && VITE_FILE_SERVER=https://${options.domain} STATIC_BUILD_HOST=${options.domain} cross-env NODE_OPTIONS=--max_old_space_size=10240 vite build`)

        const clientBuildPath = path.resolve(appRootPath.path, `packages/projects/projects/${rootProject}/dist`)
        const clientFiles = getFilesRecursive(clientBuildPath)
        const filtered = clientFiles.filter((file) => !file.includes(`projects/${rootProject}/.git/`))
        for (let file of filtered) {
            const fileName = file.split('dist/')[1]
            const fileContent = fs.readFileSync(file)
            await storageProvider.putObject(
                {
                    Body: fileContent,
                    ContentType: getContentType(fileName),
                    Key: fileName
                }
            )
        }
        console.log('Calling createInvalidation')
        await storageProvider.createInvalidation(['/*'])
        cli.ok(`Built and uploaded client-only build of project ${rootProject} at ${new Date()}`)
    }

    if (interval) {
        console.log('calling runDeploy at', new Date())
        runDeploy()
        setInterval(() => {
            console.log('calling runDeploy again at', new Date())
            runDeploy()
        }, interval * 1000 * 60)
    } else {
       await runDeploy()
       process.exit(0)
    }
})