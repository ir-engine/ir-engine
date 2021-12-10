# XREngine Avatar and Scene Asset Pipeline

![image](https://user-images.githubusercontent.com/578371/145126692-02e51aa0-45ce-4f1b-83ad-ef8360bb43c0.png)

## Our pipeline process:
1. Create scene in Blender, Unity, Maya etc. with Colliders
2. Export scene as GLB and import into XREditor<br/>
   Our editor is in final development:<br/>
   [✅ Production Server - Updated Weekly - in Beta](https://app.theoverlay.io/editor)<br/>
   [🚧 Developer Server - Updated Daily](https://dev.theoverlay.io/editor) <br/>
3. Publish scene to a location and test using a XREngine Location Link

## XREditor
The XREngine location editor is based on and forward/backward compatible with Spoke (Spoke for Mozilla Hubs).
We have added extra features to Spoke:
 - Level of Detail (Low, Med, High, Ultra)
 - Interactable Objects
 - Volumetric Video Objects
 - Broad support for Shaders/Shadows/Lights
 - Cascaded shadow maps (automatic)

The number of lights is very limited, we augment our lighting with environment maps and postprocessing effects. Baking support is in development but currently can achieve good results when used in conjunction with environment maps.

## Blender Export
We use the same [blender exporter](//github.com/MozillaReality/hubs-blender-exporter) as hubs. Mozilla has written a [guide](//hubs.mozilla.com/docs/creators-using-the-blender-gltf-exporter.html) to using the exporter.

 - Use blender 2.91.
 - You will need to understand how to use the environment map lighting.
 - Create the materials under a PBR workflow following [this guide](//docs.blender.org/manual/en/dev/addons/import_export/scene_gltf2.html?highlight=gltf#gltf-2-0).
 - If you have different instances of the same static model, batch them manually and combine them as single mesh so they can be batched. If they have too many polygons, combine them on different mesh groups

### Target output sizes

| Format  | Max Size  | Max Texture  | Max Poly  | Max Verts  |
| ------- | --------- | ------------ | --------- | ---------- |
| GLB     | 30 MB     | 25 MB        | 300k      | 300k       |

Use Texture Map / Atlas  as much as you can.
Use maps at 2048^2 we allow for 1-4 2k maps for the scene - 4096^2 is usually too much for the render.
Blender Draco compression Supported for poly/vert.

## LOD Level of Detail system

LOD is handled by engine/camera system - defined Groups

### Examples
 - https://www.dropbox.com/s/zijpipsat1azaug/TestMesh_LODGroup.blend?dl=0
 - ![image](https://user-images.githubusercontent.com/578371/145126904-28c67da8-e0ed-40ba-8815-df34e49f6428.png)
 - https://www.dropbox.com/s/4puro5zbqnbwvjk/TestMeshWithLODGroup.glb?dl=0
 - Setup an empty group that is associated with the different LODs

Target sizes:
 - Ultra - 300k
 - High - 180k
 - Med - 100k
 - Low - 40k

## Adding Colliders

Video: [how to create XREngine colliders in blender](https://youtu.be/hj8md0hBxa8)

Reference the Rooftop / VR Golf

Needs better Script Automation
![image](https://user-images.githubusercontent.com/578371/145126963-2ba84e8d-dd10-4a55-a3a5-54d39765bb5d.png)


### Box Colliders

To add these add a cube, move, rotate and scale the cube in object mode. Do not add a material to the collision object. Do not move the vertex of the cube in edit mode. Set custom properties to type = box. Don’t use type=obstacle unless you have express authorization from the engineers.

### Trimeshes

To add these simply create a mesh and triangulate it. It's not mandatory that the trimesh needs to be a closed mesh. Apply scale and rotation. Check the normals direction, must point out on the collider direction. Needs to be below 255 vertices. Decimate if needed. Do not add a material to the collision object. Set custom properties to `type = trimesh`.

Group colliders by similarity (ie: environment, objects, boxes, trimshes, ect..) and parent them to an appropriately named empty,
The group node must have Custom Properties set to `xrengine.collider.bodyType = 0` and `xrengine.entity` can be named anything
The children nodes act as shapes of the body, and do not need the `xrengine.collider` prefix, but must have the type property set to one of `box, ground, sphere, capsule, convex, trimesh`.
For each shape object, there are additional optional properties:
 - bodyType: number: 0 (static), 1 (dynamic) - (default = 0)
 - isTrigger: boolean (default = false)
 - staticFriction: number (default = 0)
 - dynamicFriction: number(default = 0)
 - restitution: number(default = 0)
 - collisionLayer: number (default = 19)
 - collisionMask: number(default = 1)
 - contactOffset: number (default = 0)
 - restOffset: number (default = 0)

Any box or capsule shaped colliders used to only block the player should be instead type = obstacle. If made an obstacle, optional properties do not apply.

To assign properties to parent object of the type:

```python
import bpy
objs = bpy.context.view_layer.objects.selected

for obj in objs:
  obj[“xrengine.collider.bodyType”] = 0
  obj[“xrengine.entity”] = “chooseaname”
```

To assign properties to each of the childs:

```python
import bpy
objs = bpy.context.view_layer.objects.selected

for obj in objs:
  obj[“type”] = “box or ground or sphere or capsule or convex or trimesh”
```

The 2 most used are box, obstacle and trimesh.

Replaces all selected object's custom properties tags and replace it with the active object's custom properties:

```python
import bpy

ob_sel = bpy.context.selected_editable_objects
ob_act = bpy.context.object
props = ob_act.keys()
print(props)
for ob in ob_sel:
  if ob == ob_act:
    continue
  for key, value in ob.items():
    print('removed', key, value)
    del ob[key]
  for p in props:
    print('set', p, ob_act[p])
    ob[p] = ob_act[p]
```

 - adjusted the mixing of the rotation position and the scale of the Model + parameters of the editor. For all colliders, and types of creation.
 - set up spawn points to work on the server and change not transform, but capsula.body. Without transforming packets, the client character will appear at x0 y0 z0. The server corrects it to spawn point .
(Since this will immediately show whether there is a connection to the server, if the location on the server has not started, we will appear at the 0 coordinate.)
 - If the character is in the fall for some time, server teleports him to the spawn point
 - Correctly added the network correction component to the character prefab.
 - Portals works now from model user.data

Always export colliders with the rest of the meshes.

We need the code to remove all properties for a selection of objects.

Interactable objects

![image](https://user-images.githubusercontent.com/578371/145127100-23b19dea-06ac-42d6-9f9a-d1ff144651c5.png)
![image](https://user-images.githubusercontent.com/578371/145127112-861bd2ff-ecde-4f0b-bf4e-621b3dc6afbc.png)


Tips
 - Box players into playspace with colliders
 - Bloom support - use the standard bsdf node
 - Prefered settings to create lightmaps:
    ![image](https://user-images.githubusercontent.com/578371/145127137-3e022270-5e73-4d04-a317-df1520c4a90b.png)


 - Image size: up to 2048.

 - Pack quality 48 (maximize the UV space)

 - Margin 0.2 (to eliminate seams)

 - Share texture space selected allows multiple objects to use the same UV space. This is handy to separate the objects in different collections, but in my opinion I think that it is better to keep all the meshes that will be using a single lightmap in a single object.

 - __Typical set up of materials in blender:__ Principled shader allows use of PBR textures (albedo, metallic, roughness and normal). Is okay to input values as parameters. Avoid using metallic and roughness maps. Keep texture usage at a minimum. Any node between the texture and the input would be ignored by the engine.

 - __To maximize performance:__ Bake AO, Metal and Roughness maps into single map on seperate channels where Red channel is AO, Green channel is Roughness, and Blue channel is Metal
  ![image](https://user-images.githubusercontent.com/578371/145127170-54955b81-3e9a-46e3-af56-e89270468226.png)


  Quixel mixer usage is advised to achieve this type of result.

 - __Baking setup with only 1 UV map:__ Plug directly the image instead of principled shader, but it will be an “unlit” material without the ability to include any other maps than albedo. This is useful to get baked shadows with very low performance impact. Use baking for all materials that are not rough or emissive.
![image](https://user-images.githubusercontent.com/578371/145127185-5bd3d716-9bf8-484d-b172-e6a6f1b3b3cf.png)


 - __Baking setup with only 2 UV maps (Alternative setting seen in apartment.glb):__
MOZ_lightmap intensity needs to be set between 1 and 5 in order to achieve good results in natural light environments. We don’t recommend this type of workflow.

![image](https://user-images.githubusercontent.com/578371/145127298-3b04ab11-4bd1-4f1d-a580-0c69003a6e13.png)

 - combined map. Bake type: combined. Influence: direct, indirect, diffuse and ambient occlusion. Diffuse bake only with direct and indirect can be used but we will lose the ambient occlusion information.
 - Denoise nodes are use to remove artifacts
 - The combined map has to be desaturated (that’s because how blender bakes the combined  and as we increase the intensity on the moz parameter it has to be clamped with RGB curves.
 - to increase intensity of the shadows, simply reduce the enviroment intensity on the global settings.

Using the cubemap skybox modifies the influence of lightmaps and its hard to correct. With MOZ_influence = 1:

![image](https://user-images.githubusercontent.com/578371/145127326-0d787dbb-f8a4-4710-a0eb-744f1dad0420.png)

NO shadows.

With MOZ_influence = 4
![image](https://user-images.githubusercontent.com/578371/145127344-41a126f0-8091-4735-b739-c434e4701129.png)
Overblown highlights

Using cubemap bridge seems to be more balanced. Shadows are rendering properly, but the floor Is overexposed MOZ_influence = 4
![image](https://user-images.githubusercontent.com/578371/145127381-841a7bd3-9373-4036-8ed5-a67c3f1055f8.png)


## Asset workflow using Substance Painter
File structure:
 - Root. Contains source blend file and the substance painter project
 - /FBX. Contains source FBX files for Painter
 - /GLB. Contain final output, engine-ready
 - /GLB Textures. Contains Painter export maps used to create the GLB.
 - /Previews. Images for marketing porpoises/work previsualization.
 - /Textures. Textures used as input for creating the asset

PBR Roughness - Metallic workflow will be used.
Texture sets will be used at discretion. We need to keep texture sets at a minimum to create performant assets. For cryptosabers 3 texture sets will be used. Each texture set will be represented as a different mesh in blender.
Meshes will be created in 2 different meshes complexities. All of them should be inside a blender collection called [NAME]_source.

High poly will be the source mesh. It doesn’t need to be UV unwrapped. It will be splitted into different materials.

Example.
![image](https://user-images.githubusercontent.com/578371/145127394-a1ecda4c-f228-4dde-b643-abcacee26c85.png)
This will be used to bake the ID map in Painter. The mesh needs to be named as: [NAME]\_high

Low poly. Is an optimized version of the high poly one. This will be the main file that we are going to work on painter and will be finally delivered on the GLB. It needs to be properly UV unwrapped (use UVPackmaster2). Also, all materials should be erased except 1 that should be named as [NAME]. The mesh needs to be named as: [NAME]\_low
![image](https://user-images.githubusercontent.com/578371/145127432-5ad73f3a-ce35-41b8-8738-b91d94e1c307.png)

Once this is done, both files will be exported as FBX. After that, _low file will be used to create a new project in painter with the following settings:
![image](https://user-images.githubusercontent.com/578371/145127444-4c45eda4-c4a0-40c1-b9fa-c371b178cc52.png)

After this ID baking should be carried on. Load the high poly mesh FBX on the “high definition meshes” and use the following settings to create the ID. Note: is possible that the map is not 100% properly baked and it will need further retouches to iron out little mistakes.
![image](https://user-images.githubusercontent.com/578371/145127503-dbc12e26-c643-42c2-b754-10a677ebbc60.png)
Then World space normal, ambient occlusion, curvature and position can be baked using the same \_low mesh as source, unless \_high contains details that it is wanted to be used in the project. Use the tool at your discretion. 

The different textures set will be gathered from the different meshes. With the color selection mask it is possible to assign different materials to each of the sets using the ID mask baked.
![image](https://user-images.githubusercontent.com/578371/145127545-de56f084-bdd4-4786-91b7-81d2cce454b1.png)

When exporting the maps for GLTF usage, please generate the maps as following. Export them to the /glbtextures folder.
![image](https://user-images.githubusercontent.com/578371/145127629-6909d4c3-5bfa-468e-a02e-dc4bc2e60c78.png)

Once this is done, put the_low meshes inside a new collection called [NAME]\_GLB. Assign the textures sets to the meshes following this shader configuration. 
![image](https://user-images.githubusercontent.com/578371/145127645-9033540f-518d-4085-a5c0-0b6c086f867d.png)

Export the meshes as a new GLB file (production ready).

## Preparing assets to use GPU instancing
 - If the asset has different objects, join them all together (preferred) or parent them all to a single empty object.
 - If the asset has different materials, bake all the materials into a single material (preferred) or separate the meshes by material.
 - Use blender instance tool (duplicate using alt+D). Also known as duplicate linked.
   ![image](https://user-images.githubusercontent.com/578371/145127703-cb7ef7a5-b5e3-475b-a4f4-57fb19c233ee.png)


## Other

Characters are going to target 1.6-1.8M tall
Standardize scale in Blender and Spoke across all scenes. 1 = 1M 
Uvs must be clean without overlapping, you can use mapping nodes in blender to add tiling textures instead of scaling Uvs. Use the UVPackmaster for asset creation and baking preparation to optimize as much as possible the UV space.
Keep naming tidy and clean the geometry as much as possible.
[Blender Mixer - Collaboration Tools](https://ubisoft-mixer.readthedocs.io/en/latest/)

### Alt Lightmap Tools 
 - [Shahzod114/Blender-BakeLab2: Blender addon for baking images](https://github.com/Shahzod114/Blender-BakeLab2)
 - Bake Wrangler [Bake Wrangler Addon (free)](https://www.blendernation.com/2020/02/07/bake-wrangler-addon-free/) This is broken for baking combined lightmaps!
 - [UV textools](https://blender-addons.org/textools-addon/)
 - [Better FBX Importer & Exporter](https://blendermarket.com/products/better-fbx-importer--exporter)

Unreal > Spoke
[glTF Exporter in Code Plugins - UE Marketplace](https://www.unrealengine.com/marketplace/en-US/product/gltf-exporter#)
Unity > Blender
[Unity-Technologies/MeshSyncDCCPlugins](https://github.com/Unity-Technologies/MeshSyncDCCPlugins)
[DCC plugins for MeshSync in Unity.](https://github.com/Unity-Technologies/MeshSyncDCCPlugins)
[Supported tools: Maya, Maya LT, 3ds Max, Motion Builder, Modo, Blender, Metasequoia](https://github.com/Unity-Technologies/MeshSyncDCCPlugins)

OTHERS: blender GIS https://github.com/domlysz/BlenderGIS, F2 loops tools, bool tool, node wrangler, simple lattice, 
Hubs blender exporter: https://github.com/MozillaReality/hubs-blender-exporter  

Adding a folder Creator Scenes\998_tools_addons with the tools. I can put all the free addons over there


# Avatar Workflow 
TODO: ADD Avatar Pipeline / optmization for Demo 
We use the Miximo (future VRM) standard for Avatars

infosia/avatar-asset-pipeline: Avatar asset pipeline is a tool to create continuous integration build pipelines for 3D avatar assets using set of common transformation logic as a component, such as "A-pose to T-pose". 
Rokoko/rokoko-studio-live-blender: Rokoko Studio Live plugin for Blender 

How to make VRM file 
VRM applications 
VRM importer, exporter and utilities for Blender
Blender - Import VRM file tutorial
VRM Project コンソーシアム
VRM Vroid Studio to Unreal Engine 4 - Full Lifehack Tutorial 
Converting an avatar to VRM format · GitHub 

In the avatar folder in dropbox we will have 4 subfolders that will contain each of the files for each step.

https://www.dropbox.com/sh/kfzksvu9egfehmf/AADNJkXdpr50nynaekyxKrKxa?dl=0
![image](https://user-images.githubusercontent.com/578371/145127794-fac8c8c0-02c5-48ae-a5de-b611f9f6b5cf.png)


## Step 1 Prepare Avatar
In the input will be placed the input obj/fbx/glb file of the avatar with the materials, with the head and the body meshes separated. Check that face blendshapes exist. The blend file is without armature and ready to pass it to mixamo (deleting all vertex weights on the process). Optimize vertex count (delete invisible meshes). Optimize materials, try to only leave albedo map on the PBR workflow. Export on FBX to mixamo. Double check that materials are present on the model. Bake all the textures in head and body only. Keep normal maps if they are really important. Resize textures to 1K. ___Separate the head mesh from the rest of the body.___

All these files should be placed on the input folder.

Name the files as ID + Name
![image](https://user-images.githubusercontent.com/578371/145127812-6baee641-2158-4641-876a-18f60e28d3c5.png)


## Step 2 Rig in Mixamo Autorigger

Import the FBX to mixamo. Use autorigger.

![image](https://user-images.githubusercontent.com/578371/145127842-cb4f3ef2-88fe-4509-963c-e8b28c75521f.png)

Download the FBX model as soon the autorigger has finished its work. Save the file on the Mixamo output folder.
![image](https://user-images.githubusercontent.com/578371/145127890-6ff26522-fd8b-4e3c-9792-47abce85566f.png)

## Step 3 Save Masters to Storage

Save as copy on the Blender rig optimized folder the blend file. Import the avatar from mixamo and use mixamo plugin to fix the armature. Replace the materials of the newly imported armature w/meshes from the original avatar. Delete the original model. Check functionality of the blendshapes/materials. Purge unused data and save the blend file again.

![image](https://user-images.githubusercontent.com/578371/145127943-60bd1eaf-6558-4e36-9361-494fd61b8664.png)

## Step 4 Test

Test animations via loading in a content pack and trying actions.

## Step 5 Export to Content Pack

Export the avatar to GLB. Save it in the 4. GLB ready for production folder. Use the following settings. Avoid using draco compression. Don’t export animations.

![image](https://user-images.githubusercontent.com/578371/145127963-45d30624-9f67-4d8a-8543-747325024ce3.png)





