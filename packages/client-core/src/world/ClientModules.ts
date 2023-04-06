import { MediaModule } from '@etherealengine/engine/src/audio/MediaModule'
import { AvatarClientModule } from '@etherealengine/engine/src/avatar/AvatarClientModule'
import { AvatarCommonModule } from '@etherealengine/engine/src/avatar/AvatarCommonModule'
import { CameraModule } from '@etherealengine/engine/src/camera/CameraModule'
import { DebugModule } from '@etherealengine/engine/src/debug/DebugModule'
import { ECSSerializationModule } from '@etherealengine/engine/src/ecs/ECSSerializationModule'
import { initSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { InputModule } from '@etherealengine/engine/src/input/InputModule'
import { InteractionModule } from '@etherealengine/engine/src/interaction/InteractionModule'
import { MotionCaptureModule } from '@etherealengine/engine/src/mocap/MotionCaptureModule'
import { RealtimeNetworkingModule } from '@etherealengine/engine/src/networking/RealtimeNetworkingModule'
import { RendererModule } from '@etherealengine/engine/src/renderer/RendererModule'
import { SceneClientModule } from '@etherealengine/engine/src/scene/SceneClientModule'
import { SceneCommonModule } from '@etherealengine/engine/src/scene/SceneCommonModule'
import { TransformModule } from '@etherealengine/engine/src/transform/TransformModule'
import { XRModule } from '@etherealengine/engine/src/xr/XRModule'
import { XRUIModule } from '@etherealengine/engine/src/xrui/XRUIModule'

export function ClientModules() {
  return initSystems([
    ...XRModule(),
    ...TransformModule(),
    ...MotionCaptureModule(),
    ...ECSSerializationModule(),
    ...RendererModule(),
    ...MediaModule(),
    ...InputModule(),
    ...SceneCommonModule(),
    ...SceneClientModule(),
    ...AvatarCommonModule(),
    ...AvatarClientModule(),
    ...CameraModule(),
    ...XRUIModule(),
    ...InteractionModule(),
    ...RealtimeNetworkingModule(),
    ...DebugModule()
  ])
}
