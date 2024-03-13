import { UserID } from '@etherealengine/common/src/schema.type.module'
import { Validator, matches } from '@etherealengine/hyperflux'

export const matchesUserID = matches.string as Validator<unknown, UserID>
