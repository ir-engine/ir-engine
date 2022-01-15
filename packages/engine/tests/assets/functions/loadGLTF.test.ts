import assert from "assert"

import {GLTF, GLTFLoader} from "../../../src/assets/loaders/gltf/GLTFLoader"
import {AssetLoader} from "../../../src/assets/classes/AssetLoader"
import {Mesh, Material, MeshBasicMaterial, Texture} from "three"

describe("LoadGLTF", () => {
    describe("LoadLightmaps", () => {
        it("should load lightmapped gltf", async () => {
            AssetLoader.load({url:"assets/lightmap_test.glb"}, async (gltf:GLTF) => {
                let sphere = gltf.scene.children[1]
                let mat = sphere.material
                assert.equal(mat.lightMap.type, Texture)
            })
        })
    })
})