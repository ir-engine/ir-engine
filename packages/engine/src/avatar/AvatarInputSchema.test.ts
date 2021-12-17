import assert, { strictEqual } from 'assert'
import { Group, PerspectiveCamera } from "three"
import { Engine } from "../ecs/classes/Engine"
import { createWorld } from "../ecs/classes/World"
import { addComponent } from "../ecs/functions/ComponentFunctions"
import { createEntity } from "../ecs/functions/EntityFunctions"
import { initializeEngine } from "../initializeEngine"
import { AvatarInputSchema, handlePrimaryButton } from "./AvatarInputSchema"
import { AvatarComponent } from "./components/AvatarComponent"

describe('avatarInputSchema', () => {
	let world
    
    beforeEach(async () => {
            world = createWorld()
            Engine.currentWorld = world
        await world.physics.createScene()
        })
    
    it('check fi avatar schema maps sizes are ok', () => {
        const avatarSchema = AvatarInputSchema;
        strictEqual(avatarSchema.inputMap.size, 56)
        strictEqual(avatarSchema.behaviorMap.size, 27)
    })
})
