## Scene Editor

Navigating to `/editor` will show you the projects page, where you can open existing projects or create a new one. 

Opening a project will route you to `/editor/<projectName>` where the project editor will load. From here, you can open a scene, which will route you again to `/editor/<projectName>/<sceneName>`

The scene consists of a list of 'nodes' which act as templates / prefabs. These are what you would normally expect in a scene editor, such as models, colliders and audio, but we also support a wide range of integrations, such as shopify, wordpress and even portals to let you traverse between worlds.

To save a scene with Ctrl+S or in the top left hamburger menu.

## Locations & Instances

Locations can be thought of as instantiations of scene. This is how you connect your scene to a shared session.

Locations can be loaded via the `/location/<locationName>` route, where `locationName` is the name of the location. By default, the location `test` and `sky-base` scenes are added. This will tell the server to figure out which of the current instances of the location is best suited for you to join. This allows us to scale events and locations to potentially millions of concurrent users without having to support them all on a single instance. Instances can be customised with the 'matchmaker' functionality to create private rooms for you to hang out with your friends that disappear once everyone leaves, or game where more complicated logic can be handled for things like tournaments with multiple rounds. 

Adding a new location is done from `/admin/locations` route.