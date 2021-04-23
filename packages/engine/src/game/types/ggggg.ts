1. added GameManager initialize:
  - games areas creating in editor
  - in one locations maybe many game areas
  - in dependency from chosen modes game areas maybe not as full games but like a simple quest or one interactive object (elevator for example).
  - differents in network part of game area objects ( glb models) from other object:
  * they not sends they position or other parameters by network, but theys sync with all players and server by Game Manager State Machine.
  * physics rigid body have network transfer, but his game behavior do not depensing from it (game rules may change it).
  - game area objects are creating from editor and have roles, prepared from game mode schema (choose role for object from list in editor).
  - while other people playing in game area, game area saving state machine result, and when new gamer joins, he will init his clients game State Machine from server saving state, and will see all hapendes and will have data (score or any you want).
2. Games dont have start or finish, theys always ready for joins new playrs.
   But when all your friends connected, you may to restart game (re init game state) to play from start with zero score.
  When your leave game will stay with your name and score (in game state, if we want) for others player who will be connected later in this location instance, and they maybe will restart game again. ( its a architecture build, but we may do finish game if needed, even with fire show, but then you click restart and game started again).
3. I will repeat, this mehanism may be useful for simple actions.
  for example we have house with lots of doors, and all players may open and close they. And we dont need to give doors a network objects, transfer they rotation and else. All will see the same, and its safer from bugs, beacose only server send states.
4. way to write new scenarias vary simple, if we collect many behaviors, you dont need to write code, just schema with already exist components and behaviors allow create millens new games or simple quest, just combaing game rules and give models a role.
Its all done. Next I will write compenents and behaviors for golf, and combin it in roleSchema (schema already exist but need continue adding golf needes behaviors), and given object ( club, ball ) in editor role from this schema, thats all, and network, init, restart, save data, executing, checks exeptions, will be work automitic.
