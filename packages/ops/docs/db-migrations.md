## Migrations

### Generate Migration file

```node_modules/.bin/sequelize migration:generate --name "migration_name"```

### Migrate the database

Before run the server, you should migrate the db.
To do this, please run as following.
```npm run compile```
```node_modules/.bin/sequelize db:migrate```

### For more information

For more information, please visit here
https://github.com/douglas-treadwell/sequelize-cli-typescript