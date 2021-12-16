import { strictEqual } from 'assert'
import { Engine } from '../../ecs/classes/Engine'
import { usingThumbstick } from './ClientInputSchema'

describe('clientInputSchema', () => {
    
    it('check useThumpstick', () => {
        strictEqual(usingThumbstick(), false)
    })
    
})