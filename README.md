# three-volumetric
Right now this repo is in a transition state. We have demos and tests running files from several different vendors in AR, VR and mobile, but we are transitioning to an npm-installable package to run volumetric from any vendor where we can mediate an open-source playback solution.

To run:
1. Run npm install inside serve/ folder
2. Create assets folder (same as volumetric player)
3. Set the constants correctly in index.js file 
4. Run ./serve/bin/serve -d evercoast -p 8000

Points to note:
1. If position gets disturbed, tap with 2 fingers, the object will be centered again
2. The dna lounge takes a small while to load, and the playback starts after a few seconds. Please wait for some time for it.
