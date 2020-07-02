import { useEffect } from 'react'
import { Component, System, TagComponent } from 'ecsy'
import { connect } from 'react-redux'
import {
    Object3DComponent,
    ECSYThreeWorld
} from 'ecsy-three'
import {
    initialize
} from 'ecsy-three/src/extras'
import {
    GLTFLoader,
    Parent,
    Position,
    Rotation,
    Scale,
    Scene,
    SkyBox,
    Visible
} from 'ecsy-three/src/extras/components'
import {
    SkyBoxSystem
} from 'ecsy-three/src/extras/systems/SkyBoxSystem'
import { GLTFLoaderSystem } from 'ecsy-three/src/extras/systems/GLTFLoaderSystem'
import * as THREE from 'three'
import {
    Sky
} from 'three/examples/jsm/objects/Sky'
import { selectAuthState } from '../../../redux/auth/selector'
import { v4 } from 'uuid'
import { client } from '../../../redux/feathers'
import Error404 from '../../../pages/spoke-room/[projectId]'
import React from 'react'
import _ from 'lodash'

const projectRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/

// This React component demonstrates how to handle networked ecsy-three components controlled by users.
// There's a rotating box at the center of the room that's controlled by no one.
// When someone enters the room, there's a camera and stationary box created for them at (0,0,40).
// The box entity is saved to the realtime store, as is its Position component.
// When the user presses the arrow keys, their camera and box move. The position component of the box is updated
// in the realtime store.
// There are subscriptions for entities being created and removed; components being created, patched, and removed;
// and users being created and removed. When a user box is moved, other users in the room will updated that user's box
// position from the Position component patched subscription returning the new position.
// When a user closes or refreshes their window, all of their networked entities and components will be removed,
// so the other users' windows will be notified and remove the user's box accordingly.

const entityMap = new Map()
const componentMap = new Map()
const userMap = new Map()

// eslint-disable-next-line react/prefer-stateless-function
class Rotating extends Component<any> {}

class LightTagComponent extends TagComponent {}

// According to the ECSY documentation, entities and components should be modified from systems.
// You could probably modify them elsewhere, but this seems to be the most accepted and scoped place.
class RotationSystem extends System {
    // execute runs every frame. delta is the amount of time since the last call to execute.
    execute(delta) {
        // queries.X.results gets everything that matches that result.
        // queries.X.changed gets only the entities that have changed.
        // There's also queries.X.added and queries.X.removed.
        this.queries.entities.results.forEach(entity => {
            // entity.getComponent will get a component in a read-only state. If you want to modify it, you must
            // use .getMutableComponent
            const rotation = (entity.getMutableComponent(Object3DComponent) as any).value.rotation
            rotation.x += 0.5 * delta
            rotation.y += 0.1 * delta
        })
    }
}

// This system is attached to objects that we want to move
// It is not attached to the rotating box, so that will not be affected by any of the logic here.
class MovementSystem extends System {
    execute() {
    }
}

// This is how you set which entities you want to attach a system to (you can also set it inside the system by
// using this.queries = {<blah>})
// components is a list of Components; if an entity has all of those Components, then the system will affect it.
// If it's missing at least one of those Components, it will be ignored by that system.
// listen.changed/removed/added will apply only to changes/additions/removals of those types of Components
RotationSystem.queries = {
    entities: {
        components: [Rotating, Object3DComponent],
        listen: {
            changed: [Object3DComponent as any]
        }
    }
}

interface Props {
    auth: any,
    projectId: string
}

const mapStateToProps = (state: any) => {
    return {
        auth: selectAuthState(state)
    }
}

const mapDispatchToProps = () => ({
})

const texture = new THREE.TextureLoader().load('../../textures/crate.gif')
const geometry = new THREE.BoxBufferGeometry(20, 20, 20)
const material = new THREE.MeshBasicMaterial({ map: texture })

async function init(auth: any, projectId: string) {
    let lastTime = 0
    const world = new ECSYThreeWorld()
    world.registerComponent(Position)
        .registerComponent(SkyBox)
        .registerComponent(Parent)
        .registerComponent(GLTFLoader)
        .registerComponent(Rotation)
        .registerComponent(Scale)
        .registerComponent(Visible)
    world.registerSystem(GLTFLoaderSystem)
    let data = initialize(world)
    let { scene, camera } = data.entities;
    let camera3d = camera.getObject3D()
    camera3d.position.z = 5
    let scene3d = scene.getObject3D()
    scene3d.add(new THREE.HemisphereLight(0xcccccc, 0x707070));
    document.onkeydown = (e) => {
        const camera3dObjectComponent = camera.getMutableComponent(Object3DComponent).value
        switch (e.keyCode) {
            case 37:
                camera3dObjectComponent.position.x -= 0.5
                break
            case 38:
                camera3dObjectComponent.position.z -= 0.5
                break
            case 39:
                camera3dObjectComponent.position.x += 0.5
                break
            case 40:
                camera3dObjectComponent.position.z += 0.5
                break
        }
    }
    world.createEntity().addObject3DComponent(new THREE.AmbientLight(), scene)
    var light = new THREE.DirectionalLight(0xaaaaaa);
    light.position.set(0.2, 1.7, -0.7);
    light.castShadow = true;
    light.shadow.camera.top = 1;
    light.shadow.camera.bottom = -1;
    light.shadow.camera.right = 10;
    light.shadow.camera.left = -10;
    light.shadow.mapSize.set(4096, 4096);
    scene3d.add(light);
    // world.createEntity()
    //     .addObject3DComponent(new THREE.HemisphereLight(0xcccccc, 0x707070), scene)
    // world
    //     .createEntity()
    //     .addComponent(GLTFLoader, {
    //         url: "../../textures/set.glb",
    //         onLoaded: model => {
    //             const cloudsMaterial = model.getObjectByName("clouds").material;
    //             cloudsMaterial.transparent = true;
    //             cloudsMaterial.fog = false;
    //             const skyMaterial = model.getObjectByName("sky").material;
    //             skyMaterial.fog = false;
    //             //model.getObjectByName('floor').receiveShadow = true;
    //         }
    //     })
    //     .addComponent(Parent, { value: data.entities.scene });
    world
        .createEntity()
        .addObject3DComponent(
            new THREE.Mesh(
                new THREE.BoxBufferGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial({
                    map: new THREE.TextureLoader().load("../../textures/crate.gif")
                })
            ),
            scene
        )


    const authUser = auth.get('authUser')
    const user = auth.get('user')
    // Let's begin
    if (authUser != null && authUser.accessToken && authUser.accessToken.length > 0) {
        try {
            let service, serviceId
            const projectResult = await client.service('project').get(projectId)
            const projectUrl = projectResult.project_url
            const regexResult = projectUrl.match(projectRegex)
            if (regexResult) {
                service = regexResult[1]
                serviceId = regexResult[2]
            }
            const result = await client.service(service).get(serviceId)
            Object.keys(result.entities).forEach((key) => {
                const entity = result.entities[key]
                const newEntity = world.createEntity(entity.id)
                entity.components.forEach((component) => {
                    console.log(component)
                    switch(component.name) {
                        case 'skybox':
                            console.log(component)
                            const skyComponent = new Sky()
                            let uniforms = skyComponent.material.uniforms
                            const sun = new THREE.Vector3();
                            var theta = Math.PI * ( component.data.inclination - 0.5 );
                            var phi = 2 * Math.PI * ( component.data.azimuth - 0.5 );

                            sun.x = Math.cos( phi );
                            sun.y = Math.sin( phi ) * Math.sin( theta );
                            sun.z = Math.sin( phi ) * Math.cos( theta );
                            uniforms.mieCoefficient.value = component.data.mieCoefficient
                            uniforms.mieDirectionalG.value = component.data.mieDirectionalG
                            uniforms.rayleigh.value = component.data.rayleigh
                            uniforms.turbidity.value = component.data.turbidity
                            uniforms.sunPosition.value = sun

                            console.log(skyComponent)

                            newEntity.addObject3DComponent(skyComponent, scene)
                                // .addComponent(Parent, { value: scene })
                        case 'transform':
                            // newEntity.addObject3DComponent(new THREE.Mesh(geometry, material), scene)
                            newEntity.addComponent(Position, { value: component.data.position })
                            newEntity.addComponent(Rotation, { rotation: component.data.rotation })
                            newEntity.addComponent(Scale, { value: component.data.scale })
                            break
                        case 'visible':
                            newEntity.addComponent(Visible, { value: component.data.visible })
                            break
                        case 'directional-light':
                            var light = new THREE.DirectionalLight(component.data.color, component.data.intensity);
                            light.castShadow = true;
                            light.shadow.mapSize.set(component.data.shadowMapResolution[0], component.data.shadowMapResolution[1]);
                            light.shadow.bias = (component.data.shadowBias)
                            light.shadow.radius = (component.data.shadowRadius)
                            newEntity.addObject3DComponent(light, scene)
                                .addComponent(Parent, { value: scene })
                    }
                })
            })
            // Let's begin
            console.log(world)
            const time = performance.now()
            const delta = time - lastTime
            world.registerSystem(MovementSystem)
            world.execute(delta, time)
            lastTime = time
        } catch (err) {
            console.log(err)

            return <Error404 />
        }
    }
}

const EcsyComponent = (props: Props) => {
    useEffect(() => {
        const { auth, projectId } = props
        init(auth, projectId)
    }, [])

    return (<div/>)
}

const EcsyComponentWrapper = (props: any) => {
    return <EcsyComponent {...props} />
}

export default connect(mapStateToProps, mapDispatchToProps)(EcsyComponentWrapper)
