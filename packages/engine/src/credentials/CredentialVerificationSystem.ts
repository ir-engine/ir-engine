import { verifyCredential } from '@xrengine/common/src/credentials/credentials'
import { createActionQueue, dispatchAction } from '@xrengine/hyperflux'

import { CredentialAction } from './CredentialAction'

// import multiLogger from '../../logger'

const requestVerifyCredential = async (action: typeof CredentialAction.requestVerify.matches._TYPE) => {
  // check database (VerificationEvent table) to see this credential has recently been verified
  const result = await verifyCredential(action.credential)
  console.log(JSON.stringify(result, null, 2))

  if (result.verified) {
    // if verified, dispatch action to set credential
    // if not verified, dispatch action to set error
    dispatchAction(
      CredentialAction.verificationResult({
        credential: action.credential,
        userId: action.$from,
        verified: true
      })
    )
  } else {
    dispatchAction(
      CredentialAction.verificationResult({
        credential: action.credential,
        userId: action.$from,
        verified: false,
        log: result.log
      })
    )
  }
}

export const CredentialVerificationSystem = () => {
  const requestVerifyCredentialActions = createActionQueue(CredentialAction.requestVerify.matches)
  return () => {
    for (const action of requestVerifyCredentialActions()) {
      requestVerifyCredential(action) // check database
    }
  }
}
