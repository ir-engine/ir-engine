# High Level Roadmap

- [ ] Devops
  - [ ] Logging
- [ ] QA / Testing
  - [ ] Comprehensive Unit Tests
    - [ ] All feathers API calls
    - [ ] All engine functions
    - [ ] Front end state & services
  - [ ] Integration tests
    - [ ] Basic functionality (loading location, saving scenes, installing projects etc)
  - [ ] Test scenes
  - [ ] Gameserver lifecycle testing
  - [ ] K8s scale testing
- [ ] Youtube explainers & Text documentation
  - [ ] Install & setup
  - [ ] How to make a PR & dev cycle
  - [ ] Project API, Routes & Custom Scripting
  - [ ] Locations, Scenes & Editor
  - [ ] Deployment
  - [ ] Asset pipeline
  - [ ] Minikube
  - [ ] XRUI
- [ ] Engine & Architecture
  - [ ] Inventory (Web3 integration?)
  - [ ] Rapier physics integration
  - [ ] Retargeting & IK
  - [ ] Adaptive XRUI
  - [ ] Matchmaking
  - [ ] Social features
    - [ ] Friends Indicators
    - [ ] Privacy, blocking

## Backlog

<table>
  <tr>
   <td>
   </td>
   <td>Needs
   </td>
   <td>Wants
   </td>
   <td>Long Term
   </td>
  </tr>
  <tr>
   <td>Avatars
   </td>
   <td>- Wearables
<p>
- Vertex animation shaders / matrix palette
   </td>
   <td>- <a href="https://github.com/XRFoundation/XREngine/issues/3551">Upload retargeting helper window</a>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Engine Core
   </td>
   <td>- Occlusion Culling
<p>
- Peer 2 Peer Network transport
   </td>
   <td>- Object persistence
<p>
<a href="https://github.com/XRFoundation/XREngine/issues/3108">- Pointer lock mode</a>
<p>
<a href="https://github.com/XRFoundation/XREngine/issues/3319">- HTTP3</a>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Engine Content
   </td>
   <td>- GLTF extensions for all custom properties
<p>
- Convert scene format to GLTF and replace all (de)serializaton with extensions
<p>
- Nightclub music scene with DJ playlist
<p>
- Metamask login
   </td>
   <td><a href="https://github.com/XRFoundation/XREngine/issues/3161">- Drag and drop models, images, videos etc into world</a>
<p>
<a href="https://github.com/XRFoundation/XREngine/issues/884">- Cars / vehicles</a>
<p>
- Instant portals
<p>
- Spline camera
<p>
- <a href="https://github.com/XRFoundation/XREngine/issues/3157">https://github.com/XRFoundation/XREngine/issues/3157</a>
<p>
<a href="https://github.com/XRFoundation/XREngine/issues/3156">https://github.com/XRFoundation/XREngine/issues/3156</a> 
<p>
- <a href="https://github.com/XRFoundation/XREngine/issues/2918">Instant portal traversal</a>
<p>
- <a href="https://github.com/XRFoundation/XREngine/issues/3264">Web AR Demo Scene</a>
   </td>
   <td>- 3D Spatial Segmentation
<p>
- Server-to-Server stitching
<p>
- Procedural generation of terrain
<p>
- Spaceships
<p>
- Portal guns
<p>
- portals to other platforms - requires WebXR API changes
<p>
<a href="https://github.com/XRFoundation/XREngine/issues/3153">- Footsteps</a>
<p>
- <a href="https://github.com/XRFoundation/XREngine/issues/365">Music visualiser </a>
<p>
<a href="https://github.com/XRFoundation/XREngine/issues/3633">- Sprite sheet rasterisation</a>
   </td>
  </tr>
  <tr>
   <td>Editor
   </td>
   <td>- <a href="https://github.com/XRFoundation/XREngine/issues/3144">Editor play mode</a>
<p>
- Realtime world editing and updating
<p>
- In-situ (Immersive) editor
<p>
- Editor designs
<p>
<a href="https://github.com/XRFoundation/XREngine/issues/2073">- Monaco editor integration - Abhishek</a>
   </td>
   <td>-<a href="https://github.com/Menithal/Blender-Metaverse-Addon"> Support blender metaverse toolkit</a>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>UI
   </td>
   <td>- Onscreen keyboard
<p>
- WebXR DOM Rasterization - <strong><em>Oculus Team, Gheric</em></strong>
<p>
- WebXR Immersive navigation - <strong><em>Oculus Team, Gheric</em></strong>
<p>
- Platform UI redesign
   </td>
   <td>- <a href="https://github.com/XRFoundation/XREngine/issues/3472">chat immersive UI indicator</a>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Backend
   </td>
   <td>- DID Wallet
<p>
- Matrix.org
<p>
- IPFS storage provider
<p>
- IPSME
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Frontend
   </td>
   <td>- Implement new platform design - <strong><em>Zian</em></strong>
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Devops
   </td>
   <td>- Automated logic & render performance benchmarks - <strong><em>N8</em></strong>
<p>
<a href="https://github.com/XRFoundation/XREngine/issues/3217">- clumsy network tests</a>
<p>
- <a href="https://github.com/XRFoundation/XREngine/issues/4190">Move social package capacitor builder in it's own repo with an NPX script</a>
<p>
-<a href="https://github.com/XRFoundation/XREngine/issues/4277"> Github codespaces integration</a> - <strong><em>Liam</em></strong>
<p>
- npm/yarn/cdn install for projects
<p>
- AWS Marketplace listing
<p>
<a href="https://github.com/XRFoundation/XREngine/issues/2401">- streaming reverse proxy</a>
<p>
- <a href="https://github.com/libscie/credit-roll">Contributor auto updater</a>
<p>
<a href="https://github.com/XRFoundation/XREngine/issues/3826">- Migrate to prisma</a>
   </td>
   <td>- Separate base stack from engine
<p>
- Graphical deploy form
<p>
- Custom build chain
<p>
- <a href="https://github.com/XRFoundation/XREngine/issues/3165">DIDs</a>
<p>
- <a href="https://github.com/XRFoundation/XREngine/issues/3120">https://github.com/XRFoundation/XREngine/issues/3120</a> 
<p>
-<a href="https://github.com/XRFoundation/XREngine/issues/2973"> Bug report with comprehensive </a>
<p>
- <a href="https://github.com/XRFoundation/XREngine/issues/3523">Restream</a>
   </td>
   <td>- Unity scene, item, avatar authoring and publishing
<p>
<a href="https://github.com/XRFoundation/XREngine/issues/3451">- Unreal scene, item, avatar authoring and publishing</a>
<p>
<a href="https://github.com/XRFoundation/XREngine/issues/3206">- Server stack k8s controller with Electron</a>
<p>
<a href="https://github.com/XRFoundation/XREngine/issues/3148">- Conference stuff</a>
<p>
- <a href="https://github.com/XRFoundation/XREngine/issues/3149">Social virtual event system</a>
   </td>
  </tr>
  <tr>
   <td>Ecosystem
   </td>
   <td>- <a href="https://github.com/XRFoundation/XREngine/issues/3447">Add 'postprocessing' Package Typings</a>
<p>
- <a href="https://github.com/XRFoundation/XREngine/issues/3446">Add 'three-mesh-bvh' Package Typings</a>
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Crypto
   </td>
   <td>- Crypto Universal Adapter
<p>
- <a href="https://docs.snapshot.org/">https://docs.snapshot.org/</a>
<p>
- XRPL
<p>
- ILP
<p>
- Coil
<p>
- BTC & Metatron
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
</table>


