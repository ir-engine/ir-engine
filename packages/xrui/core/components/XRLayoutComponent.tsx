import { defineComponent } from ''

export const XRLayoutComponent = defineComponent({
  name: 'XRLayoutComponent',

  onInit: () => {
    return {
      position: new Vector3(),
      positionTransition: Transition.defineVector3Transition(),

      positionOrigin: new Vector3(),
      positionOriginTransition: Transition.defineVector3Transition(),

      alignmentOrigin: new Vector3(),
      alignmentTransition: Transition.defineVector3Transition(),

      rotation: new Quaternion(),
      rotationTransition: Transition.defineVector3Transition(),

      rotationOrigin: new Vector3(),
      rotationOriginTransition: Transition.defineVector3Transition(),

      size: new Vector3(),
      sizeMode: { x: 'proportional', y: 'proportional', z: 'proportional' } as XRSizeMode,
      sizeTransition: Transition.defineVector3Transition(),

      effectiveSize: new Vector3()
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const xrLayout = useComponent(entity, XRLayoutComponent)
    const parentEntity = useAncestorWithComponent(entity, XRLayoutComponent)
    const parentLayout = useOptionalComponent(parentEntity, XRLayoutComponent)

    // compute effective size
    useImmediateEffect(() => {
      if (!xrLayout) return
      const sizeMode = xrLayout.sizeMode.value
      const size = xrLayout.size.value
      const parentSize = parentLayout?.effectiveSize.value ?? Vector3_Zero
      xrLayout.effectiveSize.set(
        new Vector3(
          sizeMode.x === 'proportional' ? size.x * parentSize.x : size.x,
          sizeMode.y === 'proportional' ? size.y * parentSize.y : size.y,
          sizeMode.z === 'proportional' ? size.z * parentSize.z : size.z
        )
      )
    }, [xrLayout?.size, xrLayout?.sizeMode, parentLayout?.effectiveSize])

    return null
  }
})
