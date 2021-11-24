## Integration Tests

Simply run `npm run test` and all the tests in the `tests/` directory will be run.
This will launch the whole xrengine development environment, so any existing processes (including the database + utils, client & servers) should be stopped.

## Unit Tests

The engine and server packages have tests. These can be ran individually by navigating to the package and running `npm run test`.
Individual files can be tested via `npx jest ./tests/file.test.js`.

## Linting

`npm run lint`

## SMTP Testing

https://mailtrap.io/inboxes

add credentials in ```packages/server/.env```
```dotenv
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=<mailtrap-user>
SMTP_PASS=<mailtrap-password>
```

## Browser Debug

```p key``` debug colliders view