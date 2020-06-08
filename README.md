# three-volumetric
Volumetric player plugin to add textures, merge and optimize files

Sample usage:
1. Add texture to a single file
$ node index.js gltf-texturize-file -o . --gltf-file mesh.00001.gltf --texture-file tex.00001.jpg --output-file mesh_texturized3.gltf

2. Add texture to every file in the folder (assuming mesh names are <MeshName>.<00001>.gltf and texture names are tex.<00001>.jpg
$ node index.js gltf-texturize-folder -o ./assets/textured/ --gltf-folder ./assets/gltf/ --texture-folder ./assets/textures/  

3. Merge all gltf files in a folder
$ node index gltf-merge -o . --merged-file combined_ruvi.gltf -i ./assets/textured/

4. Convert to glb and add draco compression
$ node index.js gltf-optimize -o . --input-file ruvi_combined.gltf --output-file ruvi_optimized.glb --gltf-binary --gltf-draco-compression

