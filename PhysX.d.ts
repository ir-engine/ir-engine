declare module '*.wasm' {
  const value: any
  export = value
}
declare namespace PhysX {
  class PxQueryFlag {
    static eSTATIC: { value: number }
    static eDYNAMIC: { value: number }
    static ePREFILTER: { value: number }
    static ePOSTFILTER: { value: number }
    static eANY_HIT: { value: number }
    static eNO_BLOCK: { value: number }
  }
  class PxQueryHitType {
    static eNONE: { value: number }
    static eBLOCK: { value: number }
    static eTOUCH: { value: number }
  }

  class PxShapeFlag {
    static eSIMULATION_SHAPE: { value: number }
    static eSCENE_QUERY_SHAPE: { value: number }
    static eTRIGGER_SHAPE: { value: number }
    static eVISUALIZATION: { value: number }
    // static ePARTICLE_DRAIN: { value: number };
  }

  class PxRigidBodyFlag {
    static eKINEMATIC: { value: number }
    static eUSE_KINEMATIC_TARGET_FOR_SCENE_QUERIES: { value: number }
    static eENABLE_CCD: { value: number }
    static eENABLE_CCD_FRICTION: { value: number }
    static eENABLE_POSE_INTEGRATION_PREVIEW: { value: number }
    static eENABLE_SPECULATIVE_CCD: { value: number }
    static eENABLE_CCD_MAX_CONTACT_IMPULSE: { value: number }
    static eSIMULATION_SHAPE: { value: number }
    static eRETAIN_ACCELERATIONS: { value: number }
  }

  class PxSceneFlag {
    static eENABLE_ACTIVE_ACTORS: { value: number }
    static eENABLE_CCD: { value: number }
    static eDISABLE_CCD_RESWEEP: { value: number }
    static eADAPTIVE_FORCE: { value: number }
    static eENABLE_PCM: { value: number }
    static eDISABLE_CONTACT_REPORT_BUFFER_RESIZE: { value: number }
    static eDISABLE_CONTACT_CACHE: { value: number }
    static eREQUIRE_RW_LOCK: { value: number }
    static eENABLE_STABILIZATION: { value: number }
    static eENABLE_AVERAGE_POINT: { value: number }
    static eEXCLUDE_KINEMATICS_FROM_ACTIVE_ACTORS: { value: number }
    static eENABLE_GPU_DYNAMICS: { value: number }
    static eENABLE_ENHANCED_DETERMINISM: { value: number }
    static eENABLE_FRICTION_EVERY_ITERATION: { value: number }
  }

  class PxRigidDynamicLockFlag {
    static eLOCK_LINEAR_X: { value: number }
    static eLOCK_LINEAR_Y: { value: number }
    static eLOCK_LINEAR_Z: { value: number }
    static eLOCK_ANGULAR_X: { value: number }
    static eLOCK_ANGULAR_Y: { value: number }
    static eLOCK_ANGULAR_Z: { value: number }
  }

  class PxForceMode {
    static eFORCE: { value: number }
    static eIMPULSE: { value: number }
    static eVELOCITY_CHANGE: { value: number }
    static eACCELERATION: { value: number }
  }

  // class PxActorFlags {
  //   constructor(flags: number);
  // }

  enum PxActorFlag {
    eVISUALIZATION = 1 << 0,
    eDISABLE_GRAVITY = 1 << 1,
    eSEND_SLEEP_NOTIFIES = 1 << 2,
    eDISABLE_SIMULATION = 1 << 3
  }

  class PxActorType {
    static eRIGID_STATIC: { value: number }
    static eRIGID_DYNAMIC: { value: number }
  }

  class PxMeshGeometryFlag {
    static eDOUBLE_SIDED: { value: number }
  }

  class PxGeometryType {
    static eSPHERE: { value: number }
    static ePLANE: { value: number }
    static eCAPSULE: { value: number }
    static eBOX: { value: number }
    static eCONVEXMESH: { value: number }
    static eTRIANGLEMESH: { value: number }
    static eHEIGHTFIELD: { value: number }
  }

  class PxShapeFlags {
    constructor(flags: PxShapeFlag | number)
    isSet(flag: PxShapeFlag): boolean
  }

  class PxRigidBodyFlags {
    constructor(flags: number)
    isSet(flag: PxRigidBodyFlag): boolean
  }

  class PxMeshGeometryFlags {
    constructor(a: any)
    isSet(flag: PxMeshGeometryFlag): boolean
  }

  class PxConvexMeshGeometryFlags {
    constructor(a: any)
    isSet(flag: PxConvexMeshGeometryFlag): boolean
  }

  class PxControllerCollisionFlags {
    constructor(a: any)
    isSet(flag: PxControllerCollisionFlag): boolean
  }

  class PxControllerCollisionFlag {
    static eCOLLISION_SIDES: {
      value: number
    }
    static eCOLLISION_UP: {
      value: number
    }
    static eCOLLISION_DOWN: {
      value: number
    }
  }

  interface PxPvdInstrumentationFlag {
    eALL: {
      value: number
    }
    eDEBUG: {
      value: number
    }
    ePROFILE: {
      value: number
    }
    eMEMORY: {
      value: number
    }
  }

  const NULL: {}
  const HEAPF32: Float32Array
  const HEAPF64: Float64Array
  const HEAPU8: Uint8Array
  const HEAPU16: Uint16Array
  const HEAPU32: Uint32Array
  const HEAP8: Int8Array
  const HEAP16: Int16Array
  const HEAP32: Int32Array
  function _malloc(byte: number): number
  function _free(...args: any): any

  class GeometryType {
    Enum: {
      eSPHERE: number
      ePLANE: number
      eCAPSULE: number
      eBOX: number
      eCONVEXMESH: number
      eTRIANGLEMESH: number
      eHEIGHTFIELD: number
      eGEOMETRY_COUNT: number //!< internal use only!
      eINVALID: number //= -1		//!< internal use only!
    }
  }

  const PX_PHYSICS_VERSION: number
  interface PxAllocatorCallback {}
  class PxDefaultErrorCallback implements PxAllocatorCallback {}
  interface PxErrorCallback {}
  class PxDefaultAllocator implements PxErrorCallback {}

  class PxPvdTransport {
    static implement(pvdTransportImp: PxPvdTransport): PxPvdTransport

    connect: () => void
    isConnected: () => boolean
    write: (inBytesPtr: number, inLength: number) => void
  }

  class PxFoundation {}

  class PxSimulationEventCallback {
    static implement(imp: PxSimulationEventCallback): PxSimulationEventCallback

    onContactBegin: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => void
    onContactEnd: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => void
    onContactPersist: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => void
    onTriggerBegin: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => void
    onTriggerEnd: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => void
  }

  function PxCreateFoundation(a: number, b: PxAllocatorCallback, c: PxErrorCallback): PxFoundation
  function getDefaultSceneDesc(
    scale: PxTolerancesScale,
    numThreads: number,
    simulationCallback: PxSimulationEventCallback
  ): PxSceneDesc
  function getDefaultCCTQueryFilter(): PxQueryFilterCallback

  // TODO - figure out these typings properly
  class PxTransformLike {
    translation: {
      x: number
      y: number
      z: number
    }
    rotation: {
      x: number
      y: number
      z: number
      w: number
    }
  }
  class PxTransform {
    constructor(p: number[], q: number[])
    constructor()
    setPosition(t: number[]): void
    getPosition(): number[]
    setQuaternion(t: number[]): void
    getQuaternion(): number[]

    translation: {
      x: number
      y: number
      z: number
    }
    rotation: {
      x: number
      y: number
      z: number
      w: number
    }
  }

  class ClassHandle {
    count: { value: number }
    ptr: number
  }

  class Base {
    $$: ClassHandle
  }

  class PxGeometryHelper {
    getType(): PxGeometryType
  }

  class PxGeometry {
    getType(): number
    isValid(): boolean
  }
  class PxBoxGeometry extends PxGeometry {
    constructor(x: number, y: number, z: number)
    readonly halfExtents: PxVec3
    setHalfExtents(halfExtents: PxVec3): void
  }
  class PxSphereGeometry extends PxGeometry {
    constructor(radius: number)
    setRadius(radius: number): void
    readonly radius: number
  }
  class PxCapsuleGeometry extends PxGeometry {
    constructor(radius: number, halfHeight: number)
    setRadius(radius: number): void
    setHalfHeight(halfHeight: number): void
    readonly radius: number
    readonly halfHeight: number
  }
  class PxPlaneGeometry extends PxGeometry {
    constructor()
  }
  class PxTriangleMeshGeometry extends PxGeometry {
    constructor()
    constructor(mesh: PxTriangleMesh, meshScale: PxMeshScale, flags: PxMeshGeometryFlags)
    getTriangleMesh(): PxTriangleMesh
    setScale(scale: PxMeshScale): void
    getScale(): PxMeshScale
    getMeshFlags(): PxMeshGeometryFlags
  }

  class PxConvexMesh {
    constructor()
    getVertices(): PxRealVector
    getIndexBuffer(): PxRealVector
  }

  class PxConvexMeshGeometry extends PxGeometry {
    constructor(mesh: PxConvexMesh, meshScale: PxMeshScale, flags: PxConvexMeshGeometryFlags)
    getConvexMesh(): PxConvexMesh
    setScale(scale: PxMeshScale): void
    getScale(): PxMeshScale
    getMeshFlags(): PxConvexMeshGeometryFlags
  }

  class PxHeightFieldGeometry extends PxGeometry {
    constructor(heightfield: PxHeightField, flags: PxMeshGeometryFlags, a: number, b: number, c: number)
  }

  class PxMaterial extends Base {
    setDynamicFriction(value: number): void
    setStaticFriction(value: number): void
    setRestitution(value: number): void
    getDynamicFriction(): number
    getStaticFriction(): number
    getRestitution(): number
    setFrictionCombineMode(value: number): void
    setRestitutionCombineMode(value: number): void
    getFrictionCombineMode(): number
    getRestitutionCombineMode(): number
  }

  class PxShape extends Base {
    setContactOffset(contactOffset: number): void
    setSimulationFilterData(filterData: PxFilterData): void
    getSimulationFilterData(): PxFilterData
    setQueryFilterData(filterData: PxFilterData): void
    getQueryFilterData(): PxFilterData
    setName(value: string): void
    getName(): string
    setFlag(flag: PxShapeFlag, value: boolean): void
    getFlags(): PxShapeFlags
    release(): void
    setLocalPose(transform: PxTransformLike): void
    getLocalPose(): PxTransform
    getGeometry(): PxGeometryHelper
    setGeometry(geometry: PxGeometry): void
    getBoxGeometry(geom: PxBoxGeometry): boolean
    getSphereGeometry(geom: PxSphereGeometry): boolean
    getCapsuleGeometry(geom: PxCapsuleGeometry): boolean
    getConvexMeshGeometry(geom: PxConvexMeshGeometry): boolean
    getTriangleMeshGeometry(geom: PxTriangleMeshGeometry): boolean
    getHeightFieldGeometry(geom: PxHeightFieldGeometry): boolean
    setRestOffset(restOffset: number): void
    // setMaterials(materials: PxMaterial[]): void;
    getMaterials(): PxMaterial[] | PxMaterial
    // getWorldBounds(actor: PxActor, inflation: number): PxBounds3;
  }

  class PxActor extends Base {
    setActorFlag(flag: PxActorFlag, value: boolean): void
    setActorFlags(flags: PxActorFlag): void
    getActorFlags(): number
    getType(): PxActorType
  }
  class PxRigidActor extends PxActor {
    attachShape(shape: PxShape): void
    detachShape(shape: PxShape, wakeOnLostTouch?: boolean | true): void
    getShapes(): PxShape[] | PxShape
    getGlobalPose(): PxTransform
    setGlobalPose(transform: PxTransformLike, autoAwake: boolean): void
    setLinearVelocity(value: PxVec3, autoAwake: boolean): void
    getLinearVelocity(): PxVec3
    setAngularVelocity(value: PxVec3, autoAwake: boolean): void
    getAngularVelocity(): PxVec3
    addImpulseAtLocalPos(valueA: PxVec3, valueB: PxVec3): void
  }
  class PxRigidBody extends PxRigidActor {
    setAngularDamping(value: number): void
    getAngularDamping(): number
    setLinearDamping(value: number): void
    getLinearDamping(): number
    setMass(value: number): void
    getMass(): number
    setCMassLocalPose(value: PxTransformLike): void
    clearForce(): void
    clearTorque(): void
    addForce(force: PxVec3): void
    addForceAtPos(force: PxVec3, pos: PxVec3): void
    addForceAtLocalPos(force: PxVec3, pos: PxVec3): void
    addLocalForceAtLocalPos(force: PxVec3, pos: PxVec3): void
    addImpulseAtPos(impulse: PxVec3, pos: PxVec3): void
    addImpulseAtLocalPos(impulse: PxVec3, pos: PxVec3): void
    addLocalImpulseAtLocalPos(impulse: PxVec3, pos: PxVec3): void
    applyImpulse(impulse: PxVec3, pos: PxVec3): void
    applyLocalImpulse(impulse: PxVec3, pos: PxVec3): void
    applyForce(force: PxVec3, pos: PxVec3): void
    applyLocalForce(force: PxVec3, pos: PxVec3): void
    addTorque(torque: PxVec3): void
    setRigidBodyFlags(flags: PxRigidBodyFlags): void
    setRigidBodyFlag(flag: PxRigidBodyFlag, value: boolean): void
    getRigidBodyFlags(): number
    setMassandUpdateInertia(mass: PxVec3): void
    setMassSpaceInertiaTensor(mass: PxVec3): void
    updateMassAndInertia(shapeDensities: number[]): void
  }

  class PxRigidStatic extends PxRigidActor {}
  class PxRigidDynamic extends PxRigidBody {
    constructor() {
      super()
    }
    wakeUp(): void
    putToSleep(): void
    isSleeping(): boolean
    setWakeCounter(wakeCounterValue: number): void
    getWakeCounter(): void
    setSleepThreshold(threshold: number): void
    getSleepThreshold(): number
    setKinematicTarget(transform: PxTransformLike): void
    setRigidDynamicLockFlag(flags: PxRigidDynamicLockFlag, value: boolean): void
    setRigidDynamicLockFlags(flags: PxRigidDynamicLockFlags): void
    getRigidDynamicLockFlags(flags: PxRigidDynamicLockFlag): void
    setSolverIterationCounts(minPositionIters: number, minVelocityIters: number): void
  }
  class PxVec3 {
    x: number
    y: number
    z: number
  }

  class VectorBase<T> {
    get(index: number): T
    push_back(value: T): void
    resize(index: number): void
    set(index: number, value: T): void // need to double check the ordering here
    size(): number
  }

  class PxVec3Vector extends VectorBase<PxVec3> {}

  type PxReal = number
  class PxRealVector extends VectorBase<PxReal> {}

  class PxLocationHit {
    position: PxVec3
    normal: PxVec3
    distance: number
  }

  class PxRaycastHit extends PxLocationHit {
    getShape(): PxShape
  }

  class PxRaycastCallback {
    block: PxRaycastHit
    hasBlock: boolean
  }

  class PxRaycastBuffer extends PxRaycastCallback {
    constructor()
    constructor()
    getNbAnyHits(): number
    getAnyHit(index: number): PxRaycastHit
    getNbTouches(): number
    getTouch(index: number): PxRaycastHit
  }

  class PxSceneDesc {}
  class PxScene {
    addActor(actor: PxActor, unk: any): void
    removeActor(actor: PxActor, wakeOnLostTouch: boolean): void
    simulate(timeStep: number, rando: boolean): void
    fetchResults(b: boolean): void
    getActiveActors(len: number): PxActor[]
    setGravity(value: PxVec3): void

    raycast(origin: PxVec3, unitDir: PxVec3, maxDistance: PxReal, hits: PxRaycastBuffer): boolean
    raycastSingle(
      origin: PxVec3,
      unitDir: PxVec3,
      maxDistance: PxReal,
      outputFlags: number,
      hit: PxRaycastHit,
      filterData: PxQueryFilterData
    ): boolean
    raycastAny(
      origin: PxVec3,
      unitDir: PxVec3,
      maxDistance: PxReal,
      hit: PxRaycastHit,
      filterData: PxQueryFilterData
    ): boolean
    // raycastMultiple(origin: PxVec3, unitDir: PxVec3, maxDistance: PxReal, flags: number, hits: PxRaycastHit[], hbsize: number, filterData: PxQueryFilterData): boolean;
    setBounceThresholdVelocity(threshold: number): void
    getBounceThresholdVelocity(): number
    sweep(
      geometry: PxGeometry,
      pose: PxTransformLike,
      unitDir: PxVec3,
      maxDistance: PxReal,
      hit: PxRaycastBuffer
    ): boolean
  }

  class PxCookingParams {
    constructor(scale: PxTolerancesScale)
    public meshPreprocessParams: number
  }

  class PxMeshScale {
    constructor(a: any, b: any)
  }

  class PxTriangleMesh {
    constructor(x: number, y: number, z: number)
    getVertices(): PxRealVector
    getTriangles(): PxRealVector
  }

  class PxMeshGeometryFlags {
    constructor(a: any)
  }

  class PxCooking {
    createTriMesh(
      verticesPtr: number,
      vertCount: number,
      indicesPrt: number,
      indexCount: number,
      isU16: boolean,
      physics: PxPhysics
    ): PxTriangleMesh
    // todo: createConvexMeshFromVectors();
    createConvexMesh(verticesPtr: number, vertCount: number, physics: PxPhysics): PxConvexMesh
  }

  class PxPhysics {
    createSceneDesc(): PxSceneDesc
    createScene(a: PxSceneDesc): PxScene
    createRigidDynamic(a: PxTransformLike): PxRigidDynamic
    createRigidStatic(a: PxTransformLike): PxRigidStatic
    createMaterial(staticFriction: number, dynamicFriction: number, restitution: number): PxMaterial
    //shapeFlags = PxShapeFlag:: eVISUALIZATION | PxShapeFlag:: eSCENE_QUERY_SHAPE | PxShapeFlag:: eSIMULATION_SHAPE
    createShape(
      geometry: PxGeometry,
      material: PxMaterial,
      isExclusive?: boolean | false,
      shapeFlags?: number | PxShapeFlags
    ): PxShape
    getTolerancesScale(): PxTolerancesScale
  }
  class PxTolerancesScale {
    length: number | 1.0
    speed: number | 10.0
  }
  class PxPvd {
    connect(pvdTransport: PxPvdTransport): void
  }
  function PxCreatePhysics(
    a?: number,
    b?: PxFoundation,
    c?: PxTolerancesScale,
    trackOutstandingAllocations?: boolean,
    e?: PxPvd
  ): PxPhysics
  function PxCreateCooking(version: number, foundation: PxFoundation, params: PxCookingParams): PxCooking
  function PxCreatePvd(foundation: PxFoundation): PxPvd

  function allocateRaycastHitBuffers(size: number): PxRaycastBuffer

  function allocateSweepHitBuffers(size: number): PxRaycastBuffer

  type Type = {}

  function PxCreateControllerManager(scene: PxScene, lockingEnabled: boolean): PxControllerManager

  class PxControllerManager {
    createCapsuleController(desc: PxControllerDesc): PxCapsuleController
    createBoxController(desc: PxControllerDesc): PxBoxController
    createObstacleContext(): PxObstacleContext
  }

  class PxControllerDesc {
    position: PxVec3
    isValid(): boolean
    setMaterial(material: PxMaterial): void
    stepOffset: number
    contactOffset: number
    maxJumpHeight: number
    invisibleWallHeight: number
    slopeLimit: number
    setReportCallback(callbackImp: any): any
  }

  class PxCapsuleControllerDesc extends PxControllerDesc {
    radius: number
    height: number
    climbingMode: PxCapsuleClimbingMode
  }

  class PxBoxControllerDesc extends PxControllerDesc {
    halfForwardExtent: number
    halfHeight: number
    halfSideExtent: number
  }

  enum PxCapsuleClimbingMode {
    eEASY,
    eCONSTRAINED,
    eLAST
  }

  class PxFilterData {
    word0: number
    word1: number
    word2: number
    word3: number

    constructor(word0: number, word1: number, word2: number, word3: number)
  }

  class PxQueryFilterData {
    constructor()
    setWords(word0: number, word1: number)
    setFlags(flags: number)
  }

  class PxQueryFilterCallback {
    static implement(queryFilterCallback: PxQueryFilterCallback): PxQueryFilterCallback

    postFilter(filterData: PxFilterData, hit: PxQueryHit): void
    preFilter(filterData: PxFilterData, shape: PxShape, actor: PxRigidActor): void
  }

  class PxControllerFilterCallback {}

  class PxControllerFilters {
    constructor(filterData?: PxFilterData, callbacks?: PxQueryFilterCallback, cctFilterCb?: PxControllerFilterCallback)
  }

  class PxObstacleContext {
    release(): void
    addObstacle(obstacle: PxObstacle): number
    removeObstacle(handle: number): void
    updateObstacle(handle: number, obstacle: PxObstacle): void
    getNbObstacles(): number
    getObstacle(index: number): PxObstacle
    getObstacleByHandle(handle: number): PxObstacle
  }

  class PxObstacle {
    getType(): void
    getUserData(): any
    setUserData(userData: any)
    getPosition(): PxVec3
    setPosition(position: PxVec3)
    getRotation(): PxQuat
    setRotation(rotation: PxQuat)
  }

  class PxBoxObstacle extends PxObstacle {
    getHalfExtents(): PxVec3
    setHalfExtents(halfExtents: PxVec3)
  }

  class PxCapsuleObstacle extends PxObstacle {
    getHalfHeight(): number
    setHalfHeight(halfHeight: number)
    getRadius(): number
    setRadius(radius: number)
  }

  class PxController extends Base {
    move(
      displacement: PxVec3,
      minDistance: number,
      elapsedTime: number,
      filters: PxControllerFilters,
      obstacles?: PxObstacleContext
    ): PxControllerCollisionFlags
    setPosition(pos: PxVec3): any
    getPosition(): PxVec3
    getActor(): PxRigidDynamic
    resize(height: number): void
    release(): void
  }

  class PxCapsuleController extends PxController {
    getHeight(): number
    getRadius(): number
    getClimbingMode(): PxCapsuleClimbingMode
    setHeight(height: number): void
    setRadius(radius: number): void
    setClimbingMode(climbingMode: PxCapsuleClimbingMode): void
  }

  class PxBoxController extends PxController {
    getHalfForwardExtent(): number
    getHalfHeight(): number
    getHalfSideExtent(): number
    setHalfForwardExtent(size: number): void
    setHalfHeight(size: number): void
    setHalfSideExtent(size: number): void
  }

  class PxUserControllerHitReport {
    static implement(userControllerHitReport: PxUserControllerHitReport): PxUserControllerHitReport

    onShapeHit(event: PxControllerShapeHit): void
    onControllerHit(event: unknown): void
    onObstacleHit(event: unknown): void
  }

  class PxControllerHit {
    getController(): PxController
    getWorldPos(): PxVec3
    getWorldNormal(): PxVec3
    getLength(): number
    getTriangleIndex(): number
  }

  class PxControllerShapeHit extends PxControllerHit {
    getShape(): PxShape
    getActor(): PxRigidActor
  }

  class PxControllersHit extends PxControllerHit {
    getOther(): PxController
  }
  class PxControllerObstacleHit extends PxControllerHit {
    getUserData(): number
  }
}

// virtual PxController*		createController(const PxControllerDesc& desc) = 0;

// function("PxCreateControllerManager", &PxCreateControllerManager, allow_raw_pointers());

//   enum_<PxControllerShapeType::Enum>("PxControllerShapeType")
//       .value("eBOX", PxControllerShapeType::Enum::eBOX)
//       .value("eCAPSULE", PxControllerShapeType::Enum::eCAPSULE)
//       .value("eFORCE_DWORD", PxControllerShapeType::Enum::eFORCE_DWORD);

//   enum_<PxCapsuleClimbingMode::Enum>("PxCapsuleClimbingMode")
//       .value("eEASY", PxCapsuleClimbingMode::Enum::eEASY)
//       .value("eCONSTRAINED", PxCapsuleClimbingMode::Enum::eCONSTRAINED)
//       .value("eLAST", PxCapsuleClimbingMode::Enum::eLAST);

//   enum_<PxControllerNonWalkableMode::Enum>("PxControllerNonWalkableMode")
//       .value("ePREVENT_CLIMBING", PxControllerNonWalkableMode::Enum::ePREVENT_CLIMBING)
//       .value("ePREVENT_CLIMBING_AND_FORCE_SLIDING", PxControllerNonWalkableMode::Enum::ePREVENT_CLIMBING_AND_FORCE_SLIDING);

//
//   class_<PxController>("PxController")
//       .function("release", &PxController::release)
//       .function("move", &PxController::move, allow_raw_pointers())
//       .function("setPosition", &PxController::setPosition)
//       .function("getPosition", &PxController::getPosition)
//       .function("setSimulationFilterData", optional_override(
//                                                [](PxController &ctrl, PxFilterData &data) {
//                                                  PxRigidDynamic *actor = ctrl.getActor();
//                                                  PxShape *shape;
//                                                  actor->getShapes(&shape, 1);
//                                                  shape->setSimulationFilterData(data);
//                                                  return;
//                                                }));

//   class_<PxControllerDesc>("PxControllerDesc")
//       .function("isValid", &PxControllerDesc::isValid)
//       .function("getType", &PxControllerDesc::getType)
//       .property("position", &PxControllerDesc::position)
//       .property("upDirection", &PxControllerDesc::upDirection)
//       .property("slopeLimit", &PxControllerDesc::slopeLimit)
//       .property("invisibleWallHeight", &PxControllerDesc::invisibleWallHeight)
//       .property("maxJumpHeight", &PxControllerDesc::maxJumpHeight)
//       .property("contactOffset", &PxControllerDesc::contactOffset)
//       .property("stepOffset", &PxControllerDesc::stepOffset)
//       .property("density", &PxControllerDesc::density)
//       .property("scaleCoeff", &PxControllerDesc::scaleCoeff)
//       .property("volumeGrowth", &PxControllerDesc::volumeGrowth)
//       .property("nonWalkableMode", &PxControllerDesc::nonWalkableMode)
//       // `material` property doesn't work as-is so we create a setMaterial function
//       .function("setMaterial", optional_override([](PxControllerDesc &desc, PxMaterial *material) {
//                   return desc.material = material;
//                 }),
//                 allow_raw_pointers());

//   class_<PxCapsuleControllerDesc, base<PxControllerDesc>>("PxCapsuleControllerDesc")
//       .constructor<>()
//       .function("isValid", &PxCapsuleControllerDesc::isValid)
//       .property("radius", &PxCapsuleControllerDesc::radius)
//       .property("height", &PxCapsuleControllerDesc::height)
//       .property("climbingMode", &PxCapsuleControllerDesc::climbingMode);

declare function PhysX(): Promise<typeof PhysX>
