import { download } from "@xrengine/server-core/src/entities/project/downloadProjects";
import dotenv from 'dotenv';
import Sequelize from 'sequelize';

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
    console.log('running installAllProjects')
    const sequelizeClient = new Sequelize({
      ...db,
      logging: true,
      define: {
          freezeTableName: true
      }
    });
    await sequelizeClient.sync();
    console.log('inited sequelize client')

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
    console.log('found projects', projects)
    
    for(const project of projects) {
      await download(project.name)
    }
  } catch (e) {
    console.log(e)
  }

};

installAllProjects();