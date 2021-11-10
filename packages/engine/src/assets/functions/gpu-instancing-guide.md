# GPU Instancing guidelines

GPU instancing can be used to instantiate multiple copies of an object without incurring extra draw calls. This functionality has been added in the XREngine with a focus on static scene objects.
Kindly use the following guidelines to use this feature in XREngine:

1. Model your object in some modelling tool like blender etc and make the copies as instanced versions of the original mesh.
    NOTE: When modelling your object, remember to only assign one material to one mesh. Mesh that have multiple materials assigned to them cannot be GPU instantiated currently.
2. Export the glb for your model and load it in the XREngine editor using Model Node.
3. Set the Using GPU instancing Flag in the given Model Node to true.
    NOTE: The model node can be selected as a complete object. The individual instances in the glb cannot be selected/translated in the editor.
4. Some test models are present on this path models/debug/glTF-instancing.
