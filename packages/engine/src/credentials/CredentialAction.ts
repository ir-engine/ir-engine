import { matches } from 'ts-matches'

import { defineAction } from '@xrengine/hyperflux'

import { matchesUserId } from '../common/functions/MatchesUtils'
import { NetworkTopics } from '../networking/classes/Network'

export type ResultLog = {
  id: string // e.g. 'signature_valid'
  valid: boolean
}

export type Result = {
  verified: boolean
  credential: Credential
  error?: string
  log?: ResultLog[]
}

export class CredentialAction {
  static requestVerify = defineAction({
    type: 'xre.credential.requestVerifyCredential',
    credential: matches.any,
    $cache: true,
    $topic: NetworkTopics.world
  })

  static verificationResult = defineAction({
    type: 'xre.credential.didVerify',
    verified: matches.boolean,
    credential: matches.any,
    $cache: true,
    $topic: NetworkTopics.world,
    userId: matchesUserId,
    errorMessage: matches.string.optional(),
    log: matches
      .arrayOf(
        matches.shape({
          id: matches.string,
          valid: matches.boolean
        })
      )
      .optional()
  })
}
