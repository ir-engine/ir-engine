https://docs.google.com/document/d/1WsMVjVwPdXag5BfFQxNPTwA8d758oFy8xLA76EOXs7M/edit

HOW TO SETUP GAME ON XRENGINE:


Game setup in editor. First create an element Game, then choose game mode from the drop list “gameMode”.


	Then create a role object: for that use the Model or BoxCollider element. In golf we use only BoxCollider triggers. Create BoxCollider triggers, put it in place, scale, rotate what you want, now add from droplist “target” choose your game. Next add role for this trigger, choose from droplist “role”.



For setup Golf game your need to create triggers for golf hole and golf tee:

Create one trigger for role “Tee-0” and one trigger for role “Hole. 

Do it for all golf spots. Same choosing one “Tee-1”, “Tee-2”, “Tee-3” and  create triggers with role “Hole” for all golf holes.


GAME MANAGER DOCUMENTATION:


	1. game: (state, action, storage)
	  - state
	  - action
	  - storage

2. game schema, (GolfGameMode).

	3. role logic, role rule.
	

GOLF game mode for GameManager :

1. golf rules:



	2. example to write new behavior:

		this is place where we write game logic. This is js object with a named role which will every frame and if some “rule” .






What you need to know to work with a game manager or improve it.
Let's start with the Network part so that you can immediately understand Why everything is so complicated.
- firstly, we adhere to the principle that 1 and also logical code are processed on the server and on the client. 
- this is necessary so that the player can see in real time the result of his clicks without waiting for the server's reaction.
- And at the same time, we want everything to be controlled only by the server and the server was responsible for making any decisions.
- Or in other words, so that player press inputs , they are sent to the server, the server exec it according to game logic What happened when these buttons were pressed and already sent some results to the client that the client would change But then we will need to wait for server response, to see changes. But after each press or click of the mouse it would be rather unpleasant to wait for the result of the game logic from the server and it would seem that the game is lagging, therefore a system of server correction and local game logic was created.


second What you need to take into account is that the system was developed in order to be a single platform for a large number of simple games, since we are still limited in the performance of modern VR headsets and browser technologies, therefore, absolutely cool games like the same overwatch are straightforward We are unlikely to do A here are a lot of fairly simple and a wide variety of simple games, we can still take the gaming audience.


therefore, the game manager needs to be understood as two parts, one of them is a constructor that would make it easy to collect various games and the second is a Network system that allows you to simultaneously calculate the same logic determined by the rules of the game in order not to have a delay when you press Cancer and see every second the reaction of the game logic and at the same time be able to synchronize or recheck all the results with the server.


Let's start with the game logic because I know you about the constructor lately.Doubts have appeared So this part may not make sense to defend very strongly.But I really like the network part as implemented, because for all the time all the bugs that happened were connected only with how we get the ivantez of other systems, or the banal stupidity of not teaching any one state at some point But these were never problems of desynchronization of the server and client in game states, which I am proud of.



NETWORKING PART

Client:

	Let's get started What the Client can do over the network and we find out that the client has only one type of request for us, this is to request a game state:

```

```
	‘Yes, we can add more requests in the future If there are serious reasons for this, I did not want to add such requests from the very beginning How to leave the game, enter the game Because we are going to this location, reload this location, why send any other request, that is specifically, so that there is a reason to do this And then our logic, as it were, will be based on something, they are just theoretical, we will get confused.’

 How its see by client:

Thus, when the Client enters the location, the game is loaded from the scenes of the fleet, the game by the location of the player, the player learns whether the player enters Well, how would Vyru join her.After that, he sends a request State to the server in order to know well in which state the game is now Maybe there are already other players and they already have some kind of score, well, that is, that is, it updates the state.


LOCAL MODE:

If on Game Node in editor was checkbox Global false, the game will create and work only in the client, the gamemanager will work completely locally only on your machine, the server will not react at all to this game, other players can’t see what you are doing, and don’t see game objects.

initially it was assumed that this would be useful enough to work on the logic of the game and without rebooting the server every time, that is, it quickly enough updates immediately as a change, but rather the problem turned out to be that the server with the client has its own variety in other systems Therefore, to be sure that the network game works there is no particular point in writing it in local mode.


in any case, it can still be useful if we have just some beautiful chips based on managers, some nice things that do not need to be synchronized with other players, this can be based on gamemanager, but just some beauty for some locations add This is where the local mode is very suitable.



GLOBAL MODE:


If on Game Node in editor was checkbox Global true, the game will works on both server and client, client was work the same way as it does just locally, only it all the time saves the actions that it received in bulk and then waits for the server to receive the same actions if they match, they are removed from the array That is, if the array is empty during player inactivity, it turns out that the entire the logic matched correctly If there are some records in the array that have not disappeared, then I also found a pair on the server, respectively, this did not happen on the server.

if this did not happen on the server, then we already do not know how much this Action could change the whole course of the game correctly Therefore, it will not be possible to change some little thing back, you need to get the entire game state from it update all components all data to be sure that we are synchronized by the server, it sounds like something big But in fact, in the game logic at one moment in time It is only seven or eight states where Which player is the turn to hit where is whose ball is standing whose moves What score is it even at the moment the opinions of the game dropped out to intervene in one frame and replace all these numbers do not break the game logic in any way, because all these states at one time or another switch correctly if they do not coincide with the conditions for the appearance of these states, that is, we put that the ball is moving costs Well for example, the server so it came that in fact it is moving And we have it standing Even if we put on it that it moves to the next frame, the game with but you and will put what he is worth because she will check that in fact he is worth And will change this state for him in this way we will not get into the hatch The only thing that can even if we get is as soon as the next action occurs on the server.

as soon as the following actions take place on the server, and we somehow, due to the fact that we somehow updated it at the wrong time.It is worth something a little bit in the wrong place, the shame machine entered it, She again check that it does not match the Action with the one the server arrives significant again, we do something wrong and we again ask for it is worth asking in this way, we seem to fix all local errors, but these are not errors of logic, these are errors if we have a large desynchronization That is, our skeleton does not work correctly That is on our client, so you hit on the server it is lower or higher, so it’s already differently everything went and even with such problems, the game logic copes and corrects all these conditions all the time they want normal us, in fact, there should be the same movement on the client on the server then there will be no discrepancy in the movement of the ball and in the game states.


Server:
to do


What is it Game State:
So now more specifically exactly what are Actions and what is State and how do we store some data or how they are transmitted.

State Game Tag Component - this is the simple component ECS:


 
  class Example = createMappedComponent<{}>()
 
  const State = {
    ...
    [gameStates.Example]: Example,
    ...
   }
  // to check if entity was this state:
  hasComponent(entity, State.Example);
 

that is, this component, its name means something for the game logic But, as it were, for the rest of the system It's just the presence of the components of this entity, either it is there or it is not.

-This component should not contain any data in itself because it is not transmitted over the network only knows about its presence Well the entity System uses local and game logic in order to know this entity has such a state there is no this state visited is not transmitted Therefore, if you write to it some data Not a fact that in another Well, that is, another player, this data will not appear by itself, respectively, he will not see your change if he does not see it and the server does not see it then What's the point.

-The second reason why you do not need to write any data into it This is because the game logic has such a concept as State in which all game entities are recorded and the list of them is there at the moment As the name State Tag Component.

Game State Methods:
source file: '../game/functions/functionsState.ts'


initState - this initializes the current Game.
This method is used in the game manager system to add the first State from game rules to first game objects or players.

saveInitStateCopy
This method is used in the game manager system and creates a copy of state after initState(), used for easy restart of Game.

reInitState - this restart the current Game.
This method is used in the game manager system for restarting game state.
If apply a just initialize a copy of state its be the same as restarting the game.

sendState - this is used as an answer to the client on requireState.
This method is used …
 
  interface GameStateUpdateMessage {
    game: string
    ownerId: string
    state: GameState[]
  }

requireState - this is in client on requireState from server.
This method is used …

applyStateToClient - this client used to apply a new or right State.
This method is used in client to remove all game State that he have and addState from data from server message.

correctState - this client used to check differences in his states with the server.
This method is used by the client before applying to check client game state on more complicated problems, like do we have all needed for a game entity with the right game role.

clearRemovedEntitysFromGame
This method is used in server and client in game manager to clear game.state from removing objects or leaving players.

addStateComponent
This main method to change game states, this and removeStateComponent();

This function does addComponent(), but with adding to game.state data about which entity gets a new component. It will just add data to game.state for can be sent to the client if he will require all game state.

Yeah, game state is just a simple ECS Component without any data in it.
Constructor:
   addStateComponent(entity: Entity, component:  ComponentConstructor<any, any>): void
Examples:
 
// Next Turn for Players
removeStateComponent(entity, State.WaitTurn);
addStateComponent(entity, State.YourTurn);
console.log('NEXT TURN '+ roleFullName);

Warning: 
Use removeStateComponent() and addStateComponent() only inside Game Manager Behaviors. Because game state is part of determined logic of the game it's not transferred by network but will be for all clients by Game Logic State Machine. If you will use this method in other parts of the engine, we can't be sure that all players will have the same changes with you.

removeStateComponent
This main method to change game states, this and addStateComponent();

This function does removeComponent(), but with removing in game.state data about in which entity was removed component. It will just remove data from game.state to always have the right copy about who has which State (Component).

Yeah, game state is just a simple ECS Component without any data in it.
Constructor:
   removeStateComponent(entity: Entity, component:  ComponentConstructor<any, any>): void
Examples:
 
// Next Turn for Players
removeStateComponent(entity, State.WaitTurn);
addStateComponent(entity, State.YourTurn);
console.log('NEXT TURN '+ roleFullName);



Warning: 
Use removeStateComponent() and addStateComponent() only inside Game Manager Behaviors. Because game state is part of determined logic of the game it's not transferred by network but will be for all clients by Game Logic State Machine. If you will use this method in other parts of the engine, we can't be sure that all players will have the same changes with you.



Game Actions Methods:
What is it Game Actions:
Actions its method to trigger game logic from other systems or from any code.

Just like the game state component as well as it is not recommended to change it in other parts of the engine except game manager behaviors.

Actions are not recommended for use in inside game manager behaviors, but on the contrary in all external systems that need to be interacted with game logic.

Action Game Component - this is the simple component ECS:


 
  class GameObjectCollisionTag = createMappedComponent<{}>()
 
  export const Action = {
    [gameActions.HasHadInteraction]: HasHadInteraction,
    [gameActions.GameObjectCollisionTag]: GameObjectCollisionTag
  }
 
  // to check if entity was this action:
  hasComponent(entity, Action.GameObjectCollisionTag);
 

For adding any external part to game logic use Actions, example: collision from physics, pressing buttons from input, or any other place from engine.

one more important thing about actions:
they remove the itch game manager frame. It's like events, it will work with game logic onse, and regardless of whether this led to some behavior or not, action will be removed from his entity.

Actions are always sent to all players from the server, and clients can create it too but just for don't waste time and have immediate reaction game manager on action, and then the system will check if server sends to client the same action, when action message will come from the network.

addActionComponent
This method needs to be used in any place in the engine, where you want to do impact (action) on game logic.
example: collision from physics, pressing buttons from input.

sendActionComponent
This method is used by the server to send all he gets actions from other engine parts in the work process, to the clients.

applyActionComponent
This method is used in the client, to create local Action from server messages.



Game Storage Methods:
 This method is used to keep some data from game behaviors and be sure all clients will have the same. Game scores work from these methods.
	
getStorage
This method used to get values just like getComponent()

  
  const gameScore = getStorage(entity, { name: 'GameScore' });
  // { score: { hits: 0, goal: 0 }}
  console.log(gameScore.score.goal);
 


setStorage
This method is used to set values just like getComponent() but need to ...
 
  setStorage(entity, { name: 'GameScore' }, { score: { hits: 0, goal: 0 }});
 
   //or to save values just from any component.
 
  let position = getComponent(entity, TransformComponent).position;
  setStorage(entity, TransformComponent, position);
 


initStorage
This method is used in the manager system, he allow to get some data in game storage from any other component before game start.
 …

Let's quickly move on to how the rules are described and how to change something in the golf game logic.


 
const GolfGameMode: GameMode = {
 
  name: "Golf",
  priority: 1,
  preparePlayersRole: somePrepareGameInitPlayersRole,
  onGameLoading: onGolfGameLoading,
  onGameStart: onGolfGameStart,
  beforePlayerLeave: beforeGolfPlayerLeave,
  onPlayerLeave: onGolfPlayerLeave,
  registerActionTagComponents: [],
  registerStateTagComponents: [],
  initGameState: {
    'newPlayer': {
      behaviors: [addRole]
    }
  },
  gamePlayerRoles: {
    'newPlayer': {}
  },
  gameObjectRoles: {
	   'GolfTee-0': {},
    'GolfTee-1': {},
  }
 
}
let's go straight to the hardest and most important part now





gamePlayerRoles and gameObjectRoles

in this place we indicate which different roles are in our game and also our own rules for them. it looks like this

  
  gamePlayerRoles: {
    'newPlayer': {},
    '1-Player': {
      'spawnBall':[
        {
          behavior: spawnBall, 
          args: { positionCopyFromRole: 'GolfTee-0', offsetY: 1 },
          watchers:[ [ State.YourTurn ] ],
          checkers:[{
            function: doesPlayerHaveGameObject,
            args: { on: 'self', objectRoleName: 'GolfBall'}
          }]
        }
      ],
 

now let's analyze everything that happens here because this is the most central place where all the logic of the game is described.

 
  gamePlayerRoles: {
    'newPlayer': {},
    '1-Player': {}
  }
   
This is how we create and name the roles of the players in our game. If we had a game for example football, then there would be the first team, the second team as name for the role.

If you were in the example of the game Mafia, then here would be the roles: Civilian, Detective, Mafia.

That is, this method of description is more designed for games in which there are a variety of roles for the players, but since in golf all the players seem to play for themselves and have the same rules of the game, we just call them the '1-Player'.

We also have the role of a 'newPlayer'.This is because a player who has just joined does not yet have the ability to do something there until some initialization functions are completed, for example, spawning a ball or a club, he is first given the role of a new player in which he does not have those opportunities to hit etc.

By itself, the declaration of roles in this object for the players does not carry any burden until they have some rules to follow.


 
  gameObjectRoles: {
    'GolfBall': {},
    'GolfTee-0': {}
  }

the objects Role of the declaration of the roles themselves do not have any load In addition to the fact that they will be displayed in the editor and their role can be assigned to some game object in the editor from droplist.

OK, let's say we have described all the roles that will be in our game, now we are starting to write rules for them:

 
  '1-Player': {
      'spawnBall':[
        {
          behavior: spawnBall, 
          args: { positionCopyFromRole: 'GolfTee-0', offsetY: 1 },
          watchers:[ [ State.YourTurn ] ],
          checkers:[{
            function: doesPlayerHaveGameObject,
            args: { on: 'self', objectRoleName: 'GolfBall'}
          }]
        }
      ],
      'HitBall': [
       ...

our first rule will be called 'spawnBall' the name doesn't matter, this is just to keep developers separate and easier to find code chunks.

As you can see from the syntax in one such rule name there can be several performing functions that we call behaviors.

{
   behavior: spawnBall, 
   args: { positionCopyFromRole: 'GolfTee-0', offsetY: 1 },
   watchers:[ [ State.YourTurn ] ],
   checkers:[{
     function: doesPlayerHaveGameObject,
     args: { on: 'self', objectRoleName: 'GolfBall'}
   }]
}

Behavior:
This function will execute if all of the following checks are true.

Args:
These are the arguments that will be passed to this function, along with some internal ones such as entities of the player who has this role at the moment.


In order for the gamemanager system to decide that this behavior needs to be run, the state of the game must correspond to the written checks in this rule.
Thus, we sort of separate the very behavior that will happen to the father, a description of the conditions under which this should happen. 

There are 2 types of check methods: watchers and checkers. 

In fact, this is the same thing, it is simply written in 2 versions that watchers are those who look only at the game states and game actions that's all. And checkers are already more complicated this is some kind of function that takes some data compares it considers something and then returns true or false.

for this rule to work and behavior to be runed needed both methods to return true.

Watchers:
In this place we write which game State or Action must possess this player at the moment for this rule will run his behavior.
 
  watchers:[ [ State.YourTurn ] ]
 
- Now we can see that to spawn ball player need to have game state State.YourTurn

 
  watchers:[ [ Action.GameObjectCollisionTag, State.BallStopped, State.Ready, State.Active ] ]
 
- and this example is more difficult, it is a check on whether it is possible to hit the ball with a club.

As you can see 2 nested arrays, all the states listed inside one array are like  ‘&&’ operator and if you write the second array separated by commas, then it will be ‘||’ operator

 
  watchers:[ [ State.BallStopped, State.Ready ], [ State.ForcePush ] ]
 
such a record will say that the rules will work if the ball is in place stopped and ready, or if some other super force is acting on it, well, let's say in our game there would be some event in which everyone would cheat something with ball, and can hit moving ball, and its event we named ForcePush.


Checkers:
checkers are also an array only now of functions that always return a boolean and their purpose is to carry out some kind of more accurate check, for example. What is the distance to the target, is this object the owner of some other one. Well, that is, any calculated things.

 
  checkers:[{
    function: ifOwned
  }]
Here is a fairly simple example of a checker, one function that checks whether one object belongs to our player.

Okay, in Golf at the club the ball is recorded who its owner is, so this checker simply directs the work of this rule to apply the behavior only to if the player and the ball he was going to hit coincide by the owner ID.

Accordingly, if in the rule these are used i will remove this Checker, it will turn out that I can hit the ball of another person.

This is how all the game logic is written, you explain what needs to be checked before doing the behavior and then write the action itself without thinking about any checks.

Secondly, it is so easy to change the rules of the game. What can be useful when we add something. We expand it is very easy to change because the behavior itself remains a behavior And you can only work on checkers, to adjust or adapt to new game rules.

 
  checkers:[{
    function: ifMoved,
    args: { max: 0.005 }
  }]
this function checks the maximum speed of the object, that is, if more than a given number, it will return true.

Well, and also one of the Big advantages is that you can specify a bunch of several roles in order to get two entities from two different roles of needed you in behavior and More often this is what is required, for example, to hit the ball, you need to know the rotation of the club in order to calculate the hit velocity.

TakeEffectOn:
Now let's look at a More complex example of a rule here is how the game rule is written about the fact that a player can use a club to hit the ball.
to do: more info
…


Now let's look at the most difficult rule that is in the game is hitting the ball:

  
 gamePlayerRoles: {
  'newPlayer': {},
  '1-Player': {
     ...
     'HitBall': [
        {
          behavior: addState,
          args: { on:'target', add: State.addedHit },
          watchers:[ [ State.YourTurn ] ],
          takeEffectOn: {
            targetsRole: {
              'GolfClub': {
                watchers:[ [ Action.GameObjectCollisionTag ] ],
                checkers:[{
                  function: ifOwned
                },{
                  function: dontHasState,
                  args: { stateComponent: State.Hit }
                },{
                  function: customChecker,
                  args: {
                    on:'GolfBall',
                    watchers:[ [ Action.GameObjectCollisionTag, State.BallStopped, State.Ready, State.Active ] ],
                    checkers:[{
                      function: ifOwned
                    }]
                  }
                }]
              }
            }
          }
        },
      ],
  ...
  ...
  gameObjectRoles: {
   'GolfClub': {
      ...
      'hitBall': [
        {
          behavior: hitBall,
          watchers:[ [ State.addedHit ] ],
          args: { clubPowerMultiplier: 10, hitAdvanceFactor: 1.2  },
          takeEffectOn: {
            targetsRole: {
              'GolfBall': {
                checkers:[{
                  function: ifOwned
                }]
              }
            }
          }
        },
        {
          behavior: switchState,
          args: { on: 'self', remove: State.addedHit, add: State.Hit},
          watchers:[ [ State.addedHit ] ]
        },
 

It consists of two rules, the first is found in Player rule and second in Object Club.

what are the difficulties because of what I had to make the rule so big:
collision golf club with ball gives not one event but always different counts.
if you do just from one collision do hit, i will sometimes have bug with hit now and on next frame once more and on next frame.

so as not to disable the club after hitting the ball, which is also suitable for us, but only in this game it coincided so I wanted to find a solution how, without relying on other rules, always get only one hit on the ball despite the collision event in next couple frames from physics.

so I did that Action symbolizing the contact of the club and the ball switches the state of the hit which lasts several frames and is removed after the complete completion of this action.


 
  gamePlayerRoles: {
    '1-Player': {
    ...
      behavior: addState,
      args: { on:'target', add: State.addedHit },
    ...
 

The first rule that the player has Performs all checks: owned ball with your, do we have collision on both club and ball, is now your turn to hit. And assigns the state to 'GolfClub' that the ball needs to hit. - State.addedHit

And the rules that are located at another object of the club are waiting for the state after which it reads the force and applies it to the ball, I do not double-check anything besides checking the correct (owned, yours) ball of which force will apply.

 
  gameObjectRoles: {
   'GolfClub': {
      ...
      'hitBall': [
        {
          behavior: hitBall,
          watchers:[ [ State.addedHit ] ],
      ...

after the club has performed hit behavior, next rule switches thay state from State.addedHit to State.Hit

{
  behavior: switchState,
  args: { on: 'self', remove: State.addedHit, add: State.Hit},
  watchers:[ [ State.addedHit ] ]
},

and in rule of our player on checks is a check that it is impossible to give Club State.addedHit if the club already has State.Hit states. 

  ...
  checkers:[{
    function: ifOwned
  },{
    function: dontHasState,
    args: { stateComponent: State.Hit }
  },{
  ...


Thus, reliable work is obtained due to the fact that if for some reason physics collision events have a couple of next frames, it is either repeated several times or because of the network we have lag on client, and server will send Action about collision. In all cases now we can’t make mistakes and it does not require other work (club disabled).


And now we will consider specifically each paragraph of these rules how to perform the described check as one is correctly referred to as well Three different roles: player, club and ball.

 
  gamePlayerRoles: {
    '1-Player': {
    ...
          behavior: addState,
          args: { on:'target', add: State.addedHit },
          watchers:[ [ State.YourTurn ] ],
          takeEffectOn: {
            targetsRole: {
              'GolfClub': {
                watchers:[ [ Action.GameObjectCollisionTag ] ],
                checkers:[{
                  function: ifOwned
                },{
                  function: dontHasState,
                  args: { stateComponent: State.Hit }
                },{
                  function: customChecker,
                  args: {
                    on:'GolfBall',
                    watchers:[ [ Action.GameObjectCollisionTag, State.BallStopped, State.Ready, State.Active ] ],
                    checkers:[{
                      function: ifOwned
                    }]
                  }
                }]
              }
            }
          }

