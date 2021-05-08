import { Entity } from '../../ecs/classes/Entity';
import { System } from "../../ecs/classes/System";
import { Network } from '../../networking/classes/Network';
import { isServer } from '../../common/functions/isServer';

import { NetworkObject } from '../../networking/components/NetworkObject';
import { Game } from "../components/Game";
import { TransformComponent } from '../../transform/components/TransformComponent';
import { GameObject } from "../components/GameObject";
import { GamePlayer } from "../components/GamePlayer";

import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent, getRemovedComponent } from '../../ecs/functions/EntityFunctions';
import { addActionComponent, sendActionComponent, applyActionComponent } from '../functions/functionsActions';
import { initState, saveInitStateCopy, reInitState, sendState, requireState, applyStateToClient, correctState, addStateComponent, removeStateComponent  } from '../functions/functionsState';
import { initStorage, getStorage } from '../functions/functionsStorage';

import { GameMode, RoleBehaviorWithTarget, RoleBehaviors, GameRolesInterface } from "../../game/types/GameMode";

import { GamesSchema } from "../../game/templates/GamesSchema";
import { PrefabType } from '../../networking/templates/PrefabType';
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";

/**
 * @author HydraFire <github.com/HydraFire>
 */

function checkWatchers( entity, arr ) {
  return arr === undefined || arr.length === 0 || arr.some( componentArr => componentArr.every( component => hasComponent(entity, component)));
}

function checkCheckers( entity, entityOther, arr ) {
  return arr.map(checker => checker.function(entity, checker.args, entityOther));
}

function isPlayerInGameArea(entity, gameArea) {
  const p = getComponent(entity, TransformComponent).position;
  const inGameArea = (p.x < gameArea.max.x && p.x > gameArea.min.x &&
                      p.y < gameArea.max.y && p.y > gameArea.min.y &&
                      p.z < gameArea.max.z && p.z > gameArea.min.z);
  return { entity, inGameArea };
}

/**
 * @author HydraFire <github.com/HydraFire>
 */

export class GameManagerSystem extends System {
  updateType = SystemUpdateType.Fixed;
  updateNewPlayersRate: number;
  updateLastTime: number;
  static createdGames: Entity[];

  constructor() {
    super();
    this.updateNewPlayersRate = 60;
    this.updateLastTime = 0;
    GameManagerSystem.createdGames = [];
  }

  dispose(): void {
    super.dispose();
  }

  execute (delta: number, time: number): void {

    this.queryResults.game.added?.forEach(entity => {
      const game = getMutableComponent(entity, Game);
      const gameSchema = GamesSchema[game.gameMode];
      game.priority = gameSchema.priority;// DOTO: set its from editor
      initState(game, gameSchema);
      GameManagerSystem.createdGames.push(entity);
    });

    this.queryResults.game.all?.forEach(entityGame => {
      const game = getComponent(entityGame, Game);
      const gameArea = game.gameArea;
      const gameSchema = GamesSchema[game.gameMode];
      const gameObjects = game.gameObjects;
      const gamePlayers = game.gamePlayers;
      const gameState = game.state;
      // GAME AREA ADDIND PLAYERS or REMOVE
      // adding or remove players from this Game, always give the first Role from GameSchema
      if (this.updateLastTime > this.updateNewPlayersRate) {
        Object.keys(Network.instance.networkObjects).map(Number)
          .filter(key => Network.instance.networkObjects[key].prefabType === PrefabType.Player)
          .map(key => Network.instance.networkObjects[key].component.entity)
          .map(entity => isPlayerInGameArea(entity, gameArea))
          .forEach(v => {
            // is Player in Game Area
            if (v.inGameArea && hasComponent(v.entity, GamePlayer)) {
              if (getComponent(v.entity, GamePlayer).game.name != game.name) {
                getComponent(v.entity, GamePlayer).game.priority < game.priority;
                removeComponent(v.entity, GamePlayer);
              }
            } else if (v.inGameArea && !hasComponent(v.entity, GamePlayer)) {

              addComponent(v.entity, GamePlayer, {
                game: game,
                role: Object.keys(gameSchema.gamePlayerRoles)[0],
                uuid: getComponent(v.entity, NetworkObject).ownerId
              });
            } else if (!v.inGameArea && hasComponent(v.entity, GamePlayer)) {
              if (getComponent(v.entity, GamePlayer).game.name === game.name) {
                removeComponent(v.entity, GamePlayer);
              }
            }
          })
          this.updateLastTime = 0;
      } else {
        this.updateLastTime += 1;
      }

      // OBJECTS
      // its needet for allow dynamicly adding objects and exept errors when enitor gives object without created game
      this.queryResults.gameObject.added?.forEach(entity => {
        if (getComponent(entity, GameObject).game != game.name) return;
        getMutableComponent(entity, GameObject).game = game;
        // add to gameObjects list sorted by role
        gameObjects[getComponent(entity, GameObject).role].push(entity);
        // add init Tag components for start state of Games
        const schema = gameSchema.initGameState[getComponent(entity, GameObject).role];
        if (schema != undefined) {
          schema.components.forEach(component => addStateComponent(entity, component));
          initStorage(entity, schema.storage);
        }
      });

      // PLAYERS
      this.queryResults.gamePlayers.added?.forEach(entity => {
        if (getComponent(entity, GamePlayer).game.name != game.name) return;
        // befor adding first player
        if (this.queryResults.gamePlayers.all.length == 1) saveInitStateCopy(entityGame);
        // add to gamePlayers list sorted by role
        const playerComp = getComponent(entity, GamePlayer);
        gamePlayers[playerComp.role].push(entity);
        // add init Tag components for start state of Games
        const schema = gameSchema.initGameState[playerComp.role];
        if (schema != undefined) {
          schema.components.forEach(component => addStateComponent(entity, component));
          //initStorage(entity, schema.storage);
        }
        //console.warn(game.state);
        requireState(game, playerComp);
      });
      // PLAYERS
      this.queryResults.gamePlayers.removed?.forEach(entity => {
        Object.keys(game.gamePlayers).forEach((role: string) => {
          game.gamePlayers[role] = game.gamePlayers[role].filter((entityFromState: Entity) => hasComponent(entityFromState, GamePlayer));
        });
      });
      // MAIN EXECUTE
      const executeComplexResult = [];
      // its case beter then this.queryResults.gameObject.all, becose its sync execute all role groubs entity, and you not think about behavior do work on haotic case
      Object.keys(gamePlayers).concat(Object.keys(gameObjects)).forEach(role => {
        (gameObjects[role] || gamePlayers[role]).forEach(entity => {

          const gameObject = hasComponent(entity, GameObject) ? getComponent(entity, GameObject): getComponent(entity, GamePlayer);
          const actionSchema = (gameSchema.gameObjectRoles[role] || gameSchema.gamePlayerRoles[role]);

          Object.keys(actionSchema).forEach(actionName => {
            const actionBehaviors = actionSchema[actionName];
            actionBehaviors.forEach(b => {
              let args = [];
              let checkersResult = [];

              if (checkWatchers(entity, b.watchers) === false) return;

              if (b.checkers != undefined && b.checkers.length > 0) {
                checkersResult = checkCheckers(entity, undefined, b.checkers);
                if (checkersResult.some(result => result === undefined)) return;
              }

              b.args != undefined ? args = b.args :'';

              if (b.takeEffectOn === undefined || b.takeEffectOn.targetsRole === undefined) {
                //b.behavior(entity, undefined, args, checkersResult);
                executeComplexResult.push({ behavior: b.behavior, entity: entity, entityOther: undefined, args, checkersResult });
              } else {
                let complexResultObjects = Object.keys(b.takeEffectOn.targetsRole).reduce((acc, searchedRoleName) => {
                  const targetRoleSchema = b.takeEffectOn.targetsRole[searchedRoleName];
                  // search second entity
                  let resultObjects = (gameObjects[searchedRoleName] || gamePlayers[searchedRoleName]) as any;

                  if (targetRoleSchema.watchers != undefined && targetRoleSchema.watchers.length > 0) {
                    resultObjects = resultObjects.filter(entityOtherObj => checkWatchers(entityOtherObj, targetRoleSchema.watchers));
                  }

                  resultObjects = resultObjects.map(v => ({ entity: v, checkersResult: [], args: targetRoleSchema.args }));

                  if (targetRoleSchema.checkers != undefined && targetRoleSchema.checkers.length > 0) {
                    resultObjects.forEach(complexOtherObj => {
                      complexOtherObj.checkersResult = checkCheckers(entity, complexOtherObj.entity, targetRoleSchema.checkers);
                    });
                    resultObjects = resultObjects.filter(complexOtherObj => {
                      return !complexOtherObj.checkersResult.some(result => result === undefined);
                    })
                  }

                  return acc.concat(resultObjects);
                },[]);


                if (b.takeEffectOn.sortMetod != undefined && complexResultObjects.length > 1 ) {
                  complexResultObjects = b.takeEffectOn.sortMetod(complexResultObjects)
                }

                complexResultObjects.forEach(complexResult => {
                  executeComplexResult.push({
                    behavior: b.behavior,
                    entity: entity,
                    entityOther: complexResult.entity,
                    args: { ...args, ...complexResult.args },
                    checkersResult: { ...checkersResult, ...complexResult.checkersResult }
                  });
                })
              }
            });
          });
        })
      });
      // execute all behavior after all preparing
      executeComplexResult.forEach(v => v.behavior(v.entity, v.args, delta, v.entityOther, time, v.checkersResult));
      // Clean onetime Tag components for every gameobject
      Object.keys(gamePlayers).concat(Object.keys(gameObjects)).forEach((role: string) => {
        (gameObjects[role] || gamePlayers[role]).forEach(entity => {
          gameSchema.registerActionTagComponents.forEach(component => hasComponent(entity, component) ? removeComponent(entity, component):'');
        })
      });

      // end of frame circle one game
    });
  }
}

GameManagerSystem.queries = {
  game: {
    components: [Game],
    listen: {
      added: true,
      removed: true
    }
  },
  gameObject: {
    components: [GameObject],
    listen: {
      added: true,
      removed: true
    }
  },
  gamePlayers: {
    components: [GamePlayer],
    listen: {
      added: true,
      removed: true
    }
  },
}
