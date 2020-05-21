const dotenv = require('dotenv')

const cli = require('cli')
const Sequelize = require('sequelize')

dotenv.config()

const db = {
	username: process.env.MYSQL_USER || 'server',
	password: process.env.MYSQL_PASSWORD || 'password',
	database: process.env.MYSQL_DATABASE || 'xrchat',
	host: process.env.MYSQL_HOST || 'localhost',
	port: process.env.MYSQL_PORT || 3306,
	dialect: 'mysql',
	forceRefresh: process.env.FORCE_DB_REFRESH === 'true'
}

db.url = process.env.MYSQL_URL || `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`


cli.enable('status')

cli.parse({
	userId: [false, 'UserID to make admin', 'string']
});

cli.main(async function(args, options) {
	try {
		const sequelizeClient = new Sequelize({
			...db,
			logging: true,
			define: {
				freezeTableName: true
			}
		})

		await sequelizeClient.sync()

		const User = sequelizeClient.define('user', {
			id: {
				type: Sequelize.DataTypes.UUID,
				defaultValue: Sequelize.DataTypes.UUIDV1,
				allowNull: false,
				primaryKey: true
			},
			name: {
				type: Sequelize.DataTypes.STRING,
				allowNull: false
			},
			userRole: {
				type: Sequelize.DataTypes.STRING,
				allowNull: true
			}
		});

		console.log(options.userId)
		const userMatch = await User.findOne({
			where: {
				id: options.userId
			}
		})

		userMatch.userRole = 'admin'
		await userMatch.save()

		this.ok('User with ID ' + options.userId + ' made an admin')
		process.exit(0);
	}
	catch(err) {
		this.fatal(err)
	}
})