/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import { Params, ServiceInterface } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import appconfig from '../../appconfig'

import { createHash, createPublicKey, JsonWebKey, KeyObject, X509Certificate } from 'crypto'

export interface JWKOutput {
  kty: string
  n: string
  e: string
  kid: string
  alg: string
  use: string
  x5c: string[]
  x5t: string
  'x5t#S256': string
}

/**
 * A class for Login service
 */
export class JWTPublicKeyService implements ServiceInterface {
  app: Application
  publicKey: KeyObject
  certificate: X509Certificate
  jwk: JsonWebKey

  constructor(app: Application) {
    this.app = app
    if (
      appconfig.authentication.jwtAlgorithm === 'RS256' &&
      typeof appconfig.authentication.jwtPublicKey === 'string' &&
      typeof appconfig.authentication.jwtCertificate === 'string'
    ) {
      this.publicKey = createPublicKey({ key: appconfig.authentication.jwtPublicKey, format: 'pem' })
      this.certificate = new X509Certificate(appconfig.authentication.jwtCertificate)
      console.log('raw cert', this.certificate.raw, this.certificate.raw.toString('base64url'))
      this.jwk = this.publicKey.export({ format: 'jwk' })
      this.jwk.kid = createHash('sha3-256').update(appconfig.authentication.jwtPublicKey).digest('hex')
      this.jwk.alg = 'RS256'
      this.jwk.use = 'sig'
      this.jwk.x5c = [this.certificate.raw.toString('base64')]
      this.jwk.x5t = createHash('sha1').update(this.certificate.raw).digest().toString('base64url')
      this.jwk['x5t#S256'] = createHash('sha256').update(this.certificate.raw).digest().toString('base64url')
    }
  }

  /**
   * A function which find specific login details
   *
   * @param params
   * @returns {token}
   */
  async find(params?: Params) {
    if (
      appconfig.authentication.jwtAlgorithm !== 'RS256' ||
      typeof appconfig.authentication.jwtPublicKey !== 'string' ||
      typeof appconfig.authentication.jwtCertificate !== 'string'
    )
      return {
        keys: []
      }

    return {
      keys: [this.jwk]
    }
  }
}
