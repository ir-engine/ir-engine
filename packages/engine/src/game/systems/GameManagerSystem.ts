import { System } from "../../ecs/classes/System";
//import { Engine } from '../../ecs/classes/Engine';
import { Network } from '../../networking/classes/Network';
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
import { Game } from "../components/Game";
import { TransformComponent } from '../../transform/components/TransformComponent';
import { GameObject } from "../components/GameObject";
import { GamePlayer } from "../components/GamePlayer";
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { DefaultGameMode } from "../../templates/game/DefaultGameMode";
import { GolfGameMode } from "../../templates/game/GolfGameMode";
import { GamesSchema } from "../../templates/game/GamesSchema";
import { PrefabType } from '../../templates/networking/PrefabType';

function checkWatchers( entity, arr ) {
  return arr === undefined || arr.length === 0 || arr.some( componentArr => componentArr.every( component => hasComponent(entity, component)));
}

function checkCheckers( entity, entityOther, arr ) {
  return arr.map(checker => checker.function(entity, entityOther, checker.args));
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

  constructor() {
    super();
    this.updateNewPlayersRate = 60;
  }

  execute (delta: number): void {

    this.queryResults.game.added?.forEach(entity => {
      const game = getComponent(entity, Game);
      const gameSchema = GamesSchema[game.gameMode];
      Object.keys(gameSchema.gameObjectRoles).forEach(key => game.gameObjects[key] = []);
      Object.keys(gameSchema.gamePlayerRoles).forEach(key => game.gamePlayers[key] = []);
    });

    this.queryResults.game.all?.forEach(entityGame => {
      const game = getComponent(entityGame, Game);
      const gameName = game.name // lets do this
      const isGlobal = game.isGlobal // lets do this
      const gameArea = game.gameArea // lets do this
      const gameSchema = GamesSchema[game.gameMode]
      const gameObjects = game.gameObjects;
      const gamePlayers = game.gamePlayers;
      const gameState = game.state;

      // its needet for allow dynamicly adding objects and exept errors when enitor gives object without created game
      this.queryResults.gameObject.added?.forEach(entity => {
        if (getComponent(entity, GameObject).gameName != gameName) return;
        // add init Tag components for start state of Games
        gameSchema.gameInitState[getComponent(entity, GameObject).role].forEach(component => addComponent(entity, component));
        // add to gameObjects list sorted by role
        gameObjects[getComponent(entity, GameObject).role].push(entity);
      });

      this.queryResults.gamePlayers.added?.forEach(entity => {
        if (getComponent(entity, GamePlayer).gameName != gameName) return;
        // add init Tag components for start state of Games
        gameSchema.gameInitState[getComponent(entity, GamePlayer).role].forEach(component => addComponent(entity, component));
        gamePlayers[getComponent(entity, GamePlayer).role].push(entity);
      });

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
                  let resultObjects = (gameObjects[searchedRoleName] || gamePlayers[searchedRoleName]);

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
                  complexResultObjects = b.takeEffectOn.sortMetods(complexResultObjects)
                }

                complexResultObjects.forEach(complexResult => {
                //  b.behavior(entity, complexResult.entity, { ...args, ...complexResult.args }, { ...checkersResult, ...complexResult.checkersResult });
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
      executeComplexResult.forEach(v => v.behavior(v.entity, v.entityOther, v.args, v.checkersResult));
      // Clean onetime Tag components for every gameobject
      Object.keys(gameSchema.gameObjectsCleanState).forEach(role => {
        gameObjects[role].forEach(entity => {
          gameSchema.gameObjectsCleanState[role].forEach(component => hasComponent(entity, component) ? removeComponent(entity, component):'');
        });
      });
      //
      if (this.updateLastTime > this.updateNewPlayersRate) {
        Object.keys(Network.instance.networkObjects).map(Number)
          .filter(key => Network.instance.networkObjects[key].prefabType === PrefabType.Player)
          .map(key => Network.instance.networkObjects[key].component.entity)
          .map(entity => isPlayerInGameArea(entity, gameArea))
          .forEach(v => {
            if (v.inGameArea && hasComponent(v.entity, GamePlayer)) {
              getComponent(v.entity, GamePlayer).gameName != gameName ? removeComponent(v.entity, GamePlayer):'';
            } else if (v.inGameArea && !hasComponent(v.entity, GamePlayer)) {
              addComponent(v.entity, GamePlayer, { gameName: gameName, role: Object.keys(gameSchema.gamePlayerRoles)[0] });
            } else if (!v.inGameArea && hasComponent(v.entity, GamePlayer)) {
              removeComponent(v.entity, GamePlayer);
            }
          })
      } else {
        this.updateLastTime += 1;
      }
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
