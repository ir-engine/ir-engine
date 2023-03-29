import { download } from "@etherealengine/server-core/src/projects/project/downloadProjects";
import { createDefaultStorageProvider } from "@etherealengine/server-core/src/media/storageprovider/storageprovider";
import dotenv from 'dotenv';
import Sequelize from 'sequelize';
import path from "path";
import fs from "fs";
import appRootPath from 'app-root-path'
import logger from '@etherealengine/server-core/src/ServerLogger'
import { createFeathersExpressApp } from '@etherealengine/server-core/src/createApp'
import { ServerMode } from '@etherealengine/server-core/declarations'
import { getProjectConfig, onProjectEvent } from '@etherealengine/server-core/src/projects/project/project-helper'

dotenv.config();
const db = {
    username: process.env.MYSQL_USER ?? 'server',
    password: process.env.MYSQL_PASSWORD ?? 'password',
    database: process.env.MYSQL_DATABASE ?? 'etherealengine',
    host: process.env.MYSQL_HOST ?? '127.0.0.1',
    port: process.env.MYSQL_PORT ?? 3306,
    dialect: 'mysql'
};

db.url = process.env.MYSQL_URL ??
    `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`;


async function installAllProjects() {
  try {
    const app = createFeathersExpressApp(ServerMode.API)
    await app.setup()
    createDefaultStorageProvider()
    const localProjectDirectory = path.join(appRootPath.path, 'packages/projects/projects')
    if (!fs.existsSync(localProjectDirectory)) fs.mkdirSync(localProjectDirectory, { recursive: true })
    logger.info('running installAllProjects')

    const projects = await app.service('project').Model.findAll()
    logger.info('found projects %o', projects)
    await Promise.all(projects.map((project) => download(project.name)))
    await app.service('project').update({ sourceURL: 'default-project' })
    const projectConfig = (await getProjectConfig('default-project')) ?? {}
    if (projectConfig.onEvent) await onProjectEvent(app, 'default-project', projectConfig.onEvent, 'onUpdate')
    process.exit(0)
  } catch (e) {
    logger.fatal(e)
      console.error(e)
      process.exit(1)
  }

}

installAllProjects();
