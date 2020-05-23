const dotenv = require('dotenv')

const cli = require('cli')
const Sequelize = require('sequelize')

dotenv.config()
import { db } from '../src/db-config'

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
