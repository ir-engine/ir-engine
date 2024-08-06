import logger from '@etherealengine/server-core/src/ServerLogger'
import cli from 'cli'
import fs from 'fs'
import Jwt from 'jsonwebtoken'

cli.enable('status')

cli.main(async () => {
  try {
    const creds = cli.parse({
      secretKeyPath: ['', 'Path to Apple SSO secret key.p8', 'string'],
      keyId: ['', 'Key ID of the Secret Key generated in Apple Developer Account', 'string'],
      teamId: ['', 'Team ID of the Apple Developer Account', 'string'],
      clientId: ['', 'The client ID of the service ID created in the Apple Developer Account', 'string']
    })
    if (!creds.secretKeyPath || !creds.keyId || !creds.teamId || !creds.clientId) {
      cli.fatal('Please provide all the required arguments')
    }
    const privateKey = fs.readFileSync(creds.secretKeyPath)

    const claims = {
      iss: creds.teamId,
      aud: 'https://appleid.apple.com',
      sub: creds.clientId
    }

    const clientSecret = Jwt.sign(claims, privateKey, {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: creds.keyId,
        typ: 'JWT'
      },
      expiresIn: '180d' // The token will expire in 180 days. The token can be set to expire in a shorter time but not more than 6 months.
    })

    logger.info(clientSecret)
    process.exit(0)
  } catch (err) {
    console.log('Error while generating client secret for Apple')
    console.log(err)
    cli.fatal(err)
  }
})
