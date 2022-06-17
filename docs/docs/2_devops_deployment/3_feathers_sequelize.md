# Database Migrations

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

## OpenAPI
Our server is set up with Swagger documentation to automatically generate from most endpoints. A few custom routes are not documented at this time, but most of the basic stuff is.

You can see the docs for a running XREngine instance locally at:
```
https://localhost:3030/openapi
```

Or on our [dev cluster](https://api-dev.theoverlay.io/openapi)