import { download } from "@xrengine/server-core/src/projects/project/downloadProjects";
import { createDefaultStorageProvider } from "@xrengine/server-core/src/media/storageprovider/storageprovider";
import dotenv from 'dotenv';
import Sequelize from 'sequelize';
import path from "path";
import fs from "fs";
import appRootPath from 'app-root-path'
import logger from '@xrengine/server-core/src/ServerLogger'

dotenv.config();
const db = {
    username: process.env.MYSQL_USER ?? 'server',
    password: process.env.MYSQL_PASSWORD ?? 'password',
    database: process.env.MYSQL_DATABASE ?? 'xrengine',
    host: process.env.MYSQL_HOST ?? '127.0.0.1',
    port: process.env.MYSQL_PORT ?? 3306,
    dialect: 'mysql'
};

db.url = process.env.MYSQL_URL ??
    `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`;


async function installAllProjects() {
  try {
    createDefaultStorageProvider()
    const localProjectDirectory = path.join(appRootPath.path, 'packages/projects/projects')
    if (!fs.existsSync(localProjectDirectory)) fs.mkdirSync(localProjectDirectory, { recursive: true })
    logger.info('running installAllProjects')
    const sequelizeClient = new Sequelize({
      ...db,
      define: {
          freezeTableName: true
      }
    });
    await sequelizeClient.sync();
    logger.info('inited sequelize client')

    const Projects = sequelizeClient.define('project', {
      id: {
          type: Sequelize.DataTypes.UUID,
          defaultValue: Sequelize.DataTypes.UUIDV1,
          allowNull: false,
          primaryKey: true
      },
      name: {
          type: Sequelize.DataTypes.STRING
      }
    });


    const projects = await Projects.findAll()
    logger.info('found projects', projects)
    await Promise.all(projects.map((project) => download(project.name)))
    process.exit(0)
  } catch (e) {
    logger.fatal(e)
  }

}

installAllProjects();
