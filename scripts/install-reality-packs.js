import { download } from "@xrengine/gameserver/src/downloadRealityPacks";
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


async function installAllRealityPacks() {

  const sequelizeClient = new Sequelize({
    ...db,
    logging: true,
    define: {
        freezeTableName: true
    }
  });
  await sequelizeClient.sync();

  const RealityPacks = sequelizeClient.define('reality_pack', {
    id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    }
  });

  const realityPacks = await RealityPacks.findAll()

  for(const realityPack of realityPacks) {
    await download(realityPack.name)
  }

};

installAllRealityPacks();