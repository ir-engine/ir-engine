import { defineActionCreator, matchesUserId } from '@xrengine/engine/src/networking/interfaces/Action'
//import matches from 'ts-matches'

export const TournamentAction = {
  sendState: defineActionCreator({
    type: 'puttclub.GAME_STATE',
    state: 'test state'//matches.any
  }),
/*
  addHole: defineActionCreator({
    type: 'puttclub.ADD_HOLE',
    number: matches.number,
    par: matches.number
  }),
*/
  playerJoined: defineActionCreator({
  type: 'puttclub.PLAYER_JOINED',
     userId: matchesUserId
   }),

   playerReady: defineActionCreator({
     type: 'puttclub.PLAYER_READY',
     userId: matchesUserId
   }, {allowFromAny: true}),
/*
  spawnBall: defineActionCreator({
    ...NetworkWorldAction.spawnObject.actionShape,
    prefab: 'puttclub.ball'
  }),

  spawnClub: defineActionCreator({
    ...NetworkWorldAction.spawnObject.actionShape,
    prefab: 'puttclub.club'
  }),

  playerStroke: defineActionCreator(
    {
      type: 'puttclub.PLAYER_STROKE'
    },
    { allowDispatchFromAny: true }
  ),

  ballStopped: defineActionCreator({
    type: 'puttclub.BALL_STOPPED',
    userId: matchesUserId,
    position: matches.tuple(matches.number, matches.number, matches.number),
    inHole: matches.boolean,
    outOfBounds: matches.boolean
  }),

  nextTurn: defineActionCreator({
    type: 'NEXT_TURN',
    userId: matchesUserId
  }),

  resetBall: defineActionCreator({
    type: 'puttclub.RESET_BALL',
    userId: matchesUserId,
    position: matches.tuple(matches.number, matches.number, matches.number)
  }),

  nextHole: defineActionCreator({
    type: 'puttclub.NEXT_HOLE'
  }),

  lookAtScorecard: defineActionCreator(
    {
      userId: matchesUserId,
      type: 'puttclub.SHOW_SCORECARD',
      value: matches.some(matches.boolean, matches.literal('toggle'))
    },
    { allowDispatchFromAny: true }
  )
  */
}