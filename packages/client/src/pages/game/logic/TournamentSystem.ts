import { isClient } from '@xrengine/engine/src/common/functions/isClient'
 import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
 import { World } from '@xrengine/engine/src/ecs/classes/World'
 //import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
 import { TournamentAction } from './TournamentAction'
 import { nextStep } from './TournamentLogic'


 import { dispatchFrom } from '@xrengine/engine/src/networking/functions/dispatchFrom'
 import { createState, Downgraded } from '@hookstate/core'


 import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
 import {
   addComponent,
   defineQuery,
   getComponent,
   removeComponent
 } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
 import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'

 //import { setupPlayerInput } from './functions/setupPlayerInput'
 //import { registerGolfBotHooks } from './functions/registerGolfBotHooks'

 import { useState } from '@hookstate/core'
 
 import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'

 import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
 import matches from 'ts-matches'

 import { UserId } from '@xrengine/common/src/interfaces/UserId'
 import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
 
 interface statePlayer {
  userId: string
  teamParameters: any[]
  anyData: any[]
 }

 interface stateAll {
  tournamentStage: 'waitingPlayers'|'gameStart'|'nextRound'|'teamsPlaying'|'gameResults'|'finalResults'
    players: statePlayer[],
    game: any[],
    gamesHistory: any[]
 }

 const id =  {
  userId: 'test',
  teamParameters: [],
  anyData: 0
};

 export const TournamentState = createState({
    tournamentStage: 'waitingPlayers', 
    players: [],
    game: [],
    gamesHistory: [[]]
 } as stateAll)
 /*
 tournamentStage: 'loading', 
    players: [ id, id, id, id],
    game: [
      {
        players: [id, id],
        state: 'wait' // starting|playing|ended
      },
      {
        players: [id, id],
        state: 'wait' // starting|playing|ended
      }
    ],
    gamesHistory: [
      [{
          players: [ id, id],
          winner: id
      },
      {
          players: [ id, id],
          winner: id
      }]
    ]
    */
 
 // Attach logging
 TournamentState.attach(() => ({
   id: Symbol('Logger'),
   init: () => ({
     onSet() {
       console.warn('TOURNAMENT STATE:\n' + JSON.stringify(TournamentState.attach(Downgraded).value, null, 2))
     }
   })
 }))
 
 export function useTournamentState() {
   console.clear()
   return JSON.parse(JSON.stringify(TournamentState.attach(Downgraded).value, null, 2))//useState(TournamentState) as any as typeof TournamentState
 }

 // IMPORTANT : For FLUX pattern, consider state immutable outside a receptor
 function tournamentReceptor(action) {
   const world = useWorld()
 
   TournamentState.batch((s) => {
     matches(action)
       .when(TournamentAction.sendState.matches, ({ state }) => {
         console.log('test')
         //s.set(state)
       })
 
       /**
        * On PLAYER_JOINED
        * - Add a player to player list
        */
       .when(NetworkWorldAction.createClient.matches, ({ userId }) => {
         const playerAlreadyExists = s.players.find((p) => p.userId.value === userId)

         if (!playerAlreadyExists) {
           s.players.merge([
             {
               userId: userId,
               teamParameters: [],
               anyData: [0]
             }
           ])
           //console.warn(`player ${userId} JOINED`)
            nextStep(s)
         } else {
           console.log(`player ${userId} rejoined`)
         }
        // dispatchFrom(world.hostId, () => TournamentAction.sendState({ state: s.attach(Downgraded).value })).to(userId)
         //const entity = world.getUserAvatarEntity(userId)
         //setupPlayerAvatar(entity)
         //setupPlayerInput(entity)
       })
   })
 }
 
 // Note: player numbers are 0-indexed
 
 globalThis.TournamentState = TournamentState
 //let ballTimer = 0
 
 export default async function TournamentSystem(world: World) {
   
   world.receptors.add(tournamentReceptor)
   console.log('Receptor -6-6-6-6-6-6-6-6-6-6-6-')
   const namedComponentQuery = defineQuery([NameComponent])
  // const golfClubQuery = defineQuery([GolfClubComponent])
 
   if (isClient) {
   //  registerGolfBotHooks()
     // pre-cache the assets we need for this game
     await Promise.all([
      // AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_head.glb' }),
      // AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_hands.glb' }),
      // AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/avatars/avatar_torso.glb' }),
      // AssetLoader.loadAsync({ url: Engine.publicPath + '/models/golf/golf_ball.glb' })
     ])
   }
 
   return () => {
     /*
     for (const entity of golfClubQuery()) {
       const { networkId } = getComponent(entity, NetworkObjectComponent)
       const { number } = getComponent(entity, GolfClubComponent)
       const ownerEntity = getPlayerEntityFromNumber(number)
       updateClub(entity)
       // we only need to detect hits for our own club
       if (typeof ownerEntity !== 'undefined' && isEntityLocalClient(ownerEntity)) {
         if (getCurrentGolfPlayerEntity() === ownerEntity) {
           const currentPlayerId = TournamentState.currentPlayerId.value
           const entityBall = getBall(currentPlayerId)
           if (entityBall && getComponent(entityBall, NetworkObjectComponent).networkId === networkId) {
             const { collisionEntity } = getCollisions(entity, GolfBallComponent)
             if (collisionEntity !== null && collisionEntity === entityBall) {
               const golfBallComponent = getComponent(entityBall, GolfBallComponent)
               if (golfBallComponent.state === BALL_STATES.WAITING) {
                 hitBall(entity, entityBall)
                 setBallState(entityBall, BALL_STATES.MOVING)
                 dispatchFrom(Engine.userId, () => TournamentAction.playerStroke({}))
               }
             }
           }
         }
       }
     }
 */
     for (const entity of namedComponentQuery.enter()) {
       const { name } = getComponent(entity, NameComponent)
       if (name) {
         console.log(name)
/*
         if (name.includes('GolfHole')) {
           addComponent(entity, GolfHoleComponent, {})
         }
         if (name.includes('GolfTee')) {
           addComponent(entity, GolfTeeComponent, {})
         }
*/
       }
     }
 /*
     const currentPlayerId = TournamentState.currentPlayerId.value
     const activeBallEntity = getBall(currentPlayerId)
     if (typeof activeBallEntity !== 'undefined') {
       const golfBallComponent = getComponent(activeBallEntity, GolfBallComponent)
       updateBall(activeBallEntity)
 
       if (!isClient && golfBallComponent.state === BALL_STATES.MOVING) {
         ballTimer++
         if (ballTimer > 60) {
           const { velocity } = getComponent(activeBallEntity, VelocityComponent)
           const position = getComponent(activeBallEntity, TransformComponent)?.position
           if (!position) return
           const velMag = velocity.lengthSq()
           if (velMag < 0.001 || position.y < -100) {
             setBallState(activeBallEntity, BALL_STATES.STOPPED)
             setTimeout(() => {
               const position = getComponent(activeBallEntity, TransformComponent)?.position
               golfBallComponent.groundRaycast.origin.copy(position)
               world.physics.doRaycast(golfBallComponent.groundRaycast)
               const outOfBounds = !golfBallComponent.groundRaycast.hits.length
               const activeHoleEntity = getHole(TournamentState.currentHole.value)
               if (!position) return
               const { collisionEvent } = getCollisions(activeBallEntity, GolfHoleComponent)
               const dist = position.distanceToSquared(getComponent(activeHoleEntity, TransformComponent).position)
               // ball-hole collision not being detected, not sure why, use dist for now
               const inHole = dist < 0.01 //typeof collisionEvent !== 'undefined'
               console.log('\n\n\n========= ball stopped', outOfBounds, inHole, dist, collisionEvent, '\n')
 
               dispatchFrom(world.hostId, () =>
               TournamentAction.ballStopped({
                   userId: currentPlayerId,
                   position: position.toArray(),
                   inHole,
                   outOfBounds
                 })
               )
             }, 1000)
           }
         }
       }
     }
 */
     return world
   }
 }