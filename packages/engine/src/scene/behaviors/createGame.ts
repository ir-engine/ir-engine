import { addComponent, getComponent } from '../../ecs/functions/EntityFunctions'
import { GameComponent } from '../../game/components/Game'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Engine } from '../../ecs/classes/Engine'

interface GameDataProps {
  minPlayers: number
  maxPlayers: number
  isGlobal: boolean
  name: string
  gameName: string
  gameMode: string
  sceneEntityId: string
  role: string
}

export const createGame = (entity, args: GameDataProps) => {
  console.log(args.gameMode + ' GAME LOADING ...')

  const transform = getComponent(entity, TransformComponent)
  transform.scale.set(Math.abs(transform.scale.x) / 2, Math.abs(transform.scale.y) / 2, Math.abs(transform.scale.z) / 2)

  const p = transform.position
  const s = transform.scale
  const min = { x: -s.x + p.x, y: -s.y + p.y, z: -s.z + p.z }
  const max = { x: s.x + p.x, y: s.y + p.y, z: s.z + p.z }

  addComponent(entity, GameComponent, {
    name: args.name,
    gameMode: args.gameMode,
    isGlobal: args.isGlobal,
    priority: 0,
    minPlayers: args.minPlayers,
    maxPlayers: args.maxPlayers,
    gameArea: { min, max },
    gamePlayers: {},
    gameObjects: {},
    initState: '[]',
    state: []
  })

  // register spawn objects prefabs
  const gameSchema = Engine.gameModes.get(args.gameMode)
  gameSchema.onGameLoading(entity)
}
