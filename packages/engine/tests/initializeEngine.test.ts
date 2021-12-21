/**
 * tests
 */
import { initializeEngine, shutdownEngine } from '../src/initializeEngine'
import { Engine } from '../src/ecs/classes/Engine'
import assert from 'assert'
import { EngineSystemPresets, InitializeOptions } from '../src/initializationOptions'

/**
 * tests
 */
describe('InitializeEngine', () => {
    // force close until we can reset the engine properly
    after(() => setTimeout(() => process.exit(0), 1000))

    describe('InitializeEngine Server', () => {
        it('Can initialize engine for server', async () => {
            const options: InitializeOptions = {
                type: EngineSystemPresets.SERVER,
                publicPath: '',
                systems: []
            }
            await initializeEngine(options)
            assert.equal(Engine.isInitialized, true)
        })
    })

    describe('InitializeEngine Editor', () => {
        it('Can initialize engine for editor', async () => {
            const options: InitializeOptions = {
                type: EngineSystemPresets.EDITOR,
                publicPath: '',
                systems: []
            }
            await initializeEngine(options)
            assert.equal(Engine.isInitialized, true)
        })
    });

    describe('InitializeEngine Media', () => {
        it('Can initialize engine for media', async () => {
            const options: InitializeOptions = {
                type: EngineSystemPresets.MEDIA,
                publicPath: '',
                systems: []
            }
            await initializeEngine(options)
            assert.equal(Engine.isInitialized, true)
        })
    });

    describe('Shutdown Engine', () => {
        it('Can shutdown engine', async () => {
            await shutdownEngine()
            assert.equal(Engine.isInitialized, false)
        })
    });

})