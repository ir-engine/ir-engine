declare module '*.wasm' {
  const value: any;
  export = value;
}

declare namespace PhysX {
  class PxQueryFlag {
    static eSTATIC: { value: number };
    static eDYNAMIC: { value: number };
    static ePREFILTER: { value: number };
    static ePOSTFILTER: { value: number };
    static eANY_HIT: { value: number };
    static eNO_BLOCK: { value: number };
  }
  class PxQueryHitType {
    static eNONE: { value: number };
    static eBLOCK: { value: number };
    static eTOUCH: { value: number };
  } 

  class PxShapeFlag {
    static eSIMULATION_SHAPE: { value: number };
    static eSCENE_QUERY_SHAPE: { value: number };
    static eTRIGGER_SHAPE: { value: number };
    static eVISUALIZATION: { value: number };
    // static ePARTICLE_DRAIN: { value: number };
  }

  class PxRigidBodyFlag {
    static eKINEMATIC: { value: number };
    static eUSE_KINEMATIC_TARGET_FOR_SCENE_QUERIES: { value: number };
    static eENABLE_CCD: { value: number };
    static eENABLE_CCD_FRICTION: { value: number };
    static eENABLE_POSE_INTEGRATION_PREVIEW: { value: number };
    static eENABLE_SPECULATIVE_CCD: { value: number };
    static eENABLE_CCD_MAX_CONTACT_IMPULSE: { value: number };
    static eSIMULATION_SHAPE: { value: number };
    static eRETAIN_ACCELERATIONS: { value: number };
  }

  class PxSceneFlag {
    static eENABLE_ACTIVE_ACTORS: { value: number };
    static eENABLE_CCD: { value: number };
    static eDISABLE_CCD_RESWEEP: { value: number };
    static eADAPTIVE_FORCE: { value: number };
    static eENABLE_PCM: { value: number };
    static eDISABLE_CONTACT_REPORT_BUFFER_RESIZE: { value: number };
    static eDISABLE_CONTACT_CACHE: { value: number };
    static eREQUIRE_RW_LOCK: { value: number };
    static eENABLE_STABILIZATION: { value: number };
    static eENABLE_AVERAGE_POINT: { value: number };
    static eEXCLUDE_KINEMATICS_FROM_ACTIVE_ACTORS: { value: number };
    static eENABLE_GPU_DYNAMICS: { value: number };
    static eENABLE_ENHANCED_DETERMINISM: { value: number };
    static eENABLE_FRICTION_EVERY_ITERATION: { value: number };
  }

  class PxRigidDynamicLockFlag {
    static eLOCK_LINEAR_X: { value: number };
    static eLOCK_LINEAR_Y: { value: number };
    static eLOCK_LINEAR_Z: { value: number };
    static eLOCK_ANGULAR_X: { value: number };
    static eLOCK_ANGULAR_Y: { value: number };
    static eLOCK_ANGULAR_Z: { value: number };
  }

  // class PxActorFlags {
  //   constructor(flags: number);
  // }

  enum PxActorFlag {
    eVISUALIZATION = 1 << 0,
    eDISABLE_GRAVITY = 1 << 1,
    eSEND_SLEEP_NOTIFIES = 1 << 2,
    eDISABLE_SIMULATION = 1 << 3,
  }

  class PxShapeFlags {
    constructor(flags: PxShapeFlag | number);
  }

  class PxRigidBodyFlags {
    constructor(flags: number);
  }

  class PxMeshGeometryFlags {
    constructor(a: any);
  }

  class PxConvexMeshGeometryFlags {
    constructor(a: any);
  }

  class PxControllerCollisionFlags {
    isSet(flag: PxControllerCollisionFlag): boolean;
  }

  class PxControllerCollisionFlag {
    static eCOLLISION_SIDES: {
      value: number;
    };
    static eCOLLISION_UP: {
      value: number;
    };
    static eCOLLISION_DOWN: {
      value: number;
    };
  }

  interface PxPvdInstrumentationFlag {
    eALL: {
      value: number;
    };
    eDEBUG: {
      value: number;
    };
    ePROFILE: {
      value: number;
    };
    eMEMORY: {
      value: number;
    };
  }

  type Constructor<T = {}> = new (...args: any[]) => T;
  type VoidPtr = number;
  const NULL: {};
  const HEAPF32: Float32Array;
  function destroy(obj: PhysX.Type): void;
  function castObject<T1, T2 extends PhysX.Type>(obj: T1, fun: Constructor<T2>): T2;
  function wrapPointer<T extends PhysX.Type>(params: number, obj: Constructor<T>): T;
  function addFunction(params: Function): number;
  function getClass(obj: PhysX.Type): void;
  function getPointer(obj: PhysX.Type): void;
  function getCache(fun: Constructor<PhysX.Type>): void;
  function _malloc(byte: number): number;
  function _free(...args: any): any;
  function compare(obj1: PhysX.Type, obj2: PhysX.Type): boolean;

  class GeometryType {
    Enum: {
      eSPHERE: number;
      ePLANE: number;
      eCAPSULE: number;
      eBOX: number;
      eCONVEXMESH: number;
      eTRIANGLEMESH: number;
      eHEIGHTFIELD: number;
      eGEOMETRY_COUNT: number; //!< internal use only!
      eINVALID: number; //= -1		//!< internal use only!
    };
  }

  const PX_PHYSICS_VERSION: number;
  interface PxAllocatorCallback {}
  class PxDefaultErrorCallback implements PxAllocatorCallback {}
  interface PxErrorCallback {}
  class PxDefaultAllocator implements PxErrorCallback {}

  class PxPvdTransport {
    static implement(pvdTransportImp: PxPvdTransport): PxPvdTransport;

    connect: () => void;
    isConnected: () => boolean;
    write: (inBytesPtr: number, inLength: number) => void;
  }

  class PxFoundation {}

  class PxSimulationEventCallback {
    static implement(imp: PxSimulationEventCallback): PxSimulationEventCallback;

    onContactBegin: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => void;
    onContactEnd: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => void;
    onContactPersist: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => void;
    onTriggerBegin: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => void;
    onTriggerEnd: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => void;
  }

  function PxCreateFoundation(a: number, b: PxAllocatorCallback, c: PxErrorCallback): PxFoundation;
  function getDefaultSceneDesc(scale: PxTolerancesScale, numThreads: number, simulationCallback: PxSimulationEventCallback): PxSceneDesc;
  class PxTransform {
    constructor(p: number[], q: number[]);
    constructor();
    setPosition(t: number[]): void;
    getPosition(): number[];
    setQuaternion(t: number[]): void;
    getQuaternion(): number[];

    translation: {
      x: number;
      y: number;
      z: number;
    };
    rotation: {
      x: number;
      y: number;
      z: number;
      w: number;
    };
  }

  class ClassHandle {
    count: { value: number };
    ptr: number;
  }

  class Base {
    $$: ClassHandle;
  }

  class PxGeometry {
    getType(): number;
  }
  class PxBoxGeometry extends PxGeometry {
    constructor(x: number, y: number, z: number);
  }
  class PxSphereGeometry extends PxGeometry {
    constructor(r: number);
  }
  class PxCapsuleGeometry extends PxGeometry {
    constructor(r: number, h: number);
  }
  class PxPlaneGeometry extends PxGeometry {
    constructor();
  }
  class PxTriangleMeshGeometry extends PxGeometry {
    constructor(a: any, b: any, c: any);
  }

  class PxConvexMeshGeometry extends PxGeometry {
    constructor(a: any, b: any, c: any);
  }

  class Material extends Base {}

  class PxShape extends Base {
    setContactOffset(contactOffset: number): void;
    setSimulationFilterData(filterData: PxFilterData): void;
    setName(value: string): void;
    getName(): string;
    setFlag(flag: PxShapeFlag, value: boolean): void;
  }

  class Actor extends Base {
    // setActorFlag(flag: number, value: boolean): void;
    setActorFlags(flags: PxActorFlag): void;
    getActorFlags(): number;
    getGlobalPose(): PxTransform;
    setGlobalPose(transform: PxTransform, autoAwake: boolean): void;
    setLinearVelocity(value: PxVec3, autoAwake: boolean): void;
    getLinearVelocity(): PxVec3;
    setAngularVelocity(value: PxVec3, autoAwake: boolean): void;
    getAngularVelocity(): PxVec3;
    addImpulseAtLocalPos(valueA: PxVec3, valueB: PxVec3): void;
  }
  class PxRigidActor extends Actor {
    attachShape(shape: PxShape): void;
    detachShape(shape: PxShape, wakeOnLostTouch?: boolean | true): void;
    addForce(force: PxVec3 | any, mode: PxForceMode | number, autowake: boolean): void;
    getShapes(): PxShape[] | PxShape;
  }
  enum PxForceMode {}
  class PxRigidBody extends PxRigidActor {
    setRigidBodyFlags(flags: PxRigidBodyFlags): void;
    setRigidBodyFlag(flag: PxRigidBodyFlag, value: boolean): void;
    getRigidBodyFlags(): number;

    setMass(value: number): void;
    getMass(): number;

    setAngularVelocity(value: PxVec3, autoWake: boolean): void;

    setAngularDamping(value: number): void;
    getAngularDamping(): number;

    setLinearDamping(value: number): void;
    getLinearDamping(): number;

    setMassSpaceInertiaTensor(value: PxVec3): void;
  }

  class PxRigidStatic extends PxRigidActor {}
  class PxRigidDynamic extends PxRigidBody {
    wakeUp(): void; //, &PxRigidDynamic::wakeUp)
    setWakeCounter(): void; //, &PxRigidDynamic::setWakeCounter)
    isSleeping(): boolean; //, &PxRigidDynamic::isSleeping)
    getWakeCounter(): void; //, &PxRigidDynamic::getWakeCounter)
    setSleepThreshold(value: number): void; //, &PxRigidDynamic::setSleepThreshold)
    getSleepThreshold(): number; //, &PxRigidDynamic::getSleepThreshold)
    setKinematicTarget(transform: PxTransform): void; //, &PxRigidDynamic::setKinematicTarget)
    setRigidDynamicLockFlags(flags: PxRigidDynamicLockFlag): void; //, &PxRigidDynamic::setRigidDynamicLockFlags);
    setSolverIterationCounts(minPositionIters: number, minVelocityIters: number): void;
  }
  class PxVec3 {
    x: number;
    y: number;
    z: number;
  }

  class PxLocationHit {
    position: PxVec3;
    normal: PxVec3;
    distance: number;
  }

  class PxRaycastHit extends PxLocationHit {
    getShape(): PxShape;
  }

  class PxRaycastCallback {
    block: PxRaycastHit;
    hasBlock: boolean;
  }

  class PxRaycastBuffer extends PxRaycastCallback {
    constructor();
    constructor();
    getNbAnyHits(): number;
    getAnyHit(index: number): PxRaycastHit;
    getNbTouches(): number;
    getTouch(index: number): PxRaycastHit;
  }

  class PxSceneDesc {
    gravity: PxVec3;
    flags: any;
    bounceThresholdVelocity: number;
  }
  class PxScene {
    addActor(actor: Actor, unk: any): void;
    removeActor(actor: Actor, unk: any): void;
    simulate(timeStep: number, rando: boolean): void;
    fetchResults(b: boolean): void;
    getActiveActors(len: number): Actor[];
    setGravity(value: PxVec3): void;

    raycast(origin: PxVec3, unitDir: PxVec3, maxDistance: number /*PxReal*/, hits: PxRaycastBuffer): boolean;
    raycastSingle(origin: PxVec3, unitDir: PxVec3, maxDistance: number /*PxReal*/, flags: number, hit: PxRaycastHit, filterData: PxQueryFilterData, queryCallback: PxQueryFilterCallback, cache: null): boolean;
    raycastAny(origin: PxVec3, unitDir: PxVec3, maxDistance: number /*PxReal*/, hit: PxRaycastHit, filterData: PxQueryFilterData, queryCallback: PxQueryFilterCallback, cache: null): boolean;
    // raycastMultiple(origin: PxVec3, unitDir: PxVec3, maxDistance: number /*PxReal*/, flags: number, hits: PxRaycastHit[], hbsize: number, filterData: PxQueryFilterData, queryCallback: PxQueryFilterCallback, cache: null): boolean;
    sweep(geometry: PxGeometry, pose: PxTransform, unitDir: PxVec3, maxDistance: number /*PxReal*/, hit: PxRaycastBuffer): boolean;
  }

  class PxCookingParams {
    constructor(scale: PxTolerancesScale);
    public meshPreprocessParams: number;
  }

  class PxMeshScale {
    constructor(a: any, b: any);
  }

  class PxTriangleMesh {
    constructor(x: number, y: number, z: number);
  }

  class PxMeshGeometryFlags {
    constructor(a: any);
  }

  class PxCooking {
    createTriMesh(verticesPtr: number, vertCount: number, indicesPrt: number, indexCount: number, isU16: boolean, physics: PxPhysics): void;
    // todo: createConvexMeshFromVectors();
    createConvexMesh(verticesPtr: number, vertCount: number, physics: PxPhysics): void;
  }

  class PxPhysics {
    createSceneDesc(): PxSceneDesc;
    createScene(a: PxSceneDesc): PxScene;
    createRigidDynamic(a: PxTransform | any): PxRigidDynamic;
    createRigidStatic(a: PxTransform | any): PxRigidStatic;
    createMaterial(staticFriction: number, dynamicFriction: number, restitution: number): Material;
    //shapeFlags = PxShapeFlag:: eVISUALIZATION | PxShapeFlag:: eSCENE_QUERY_SHAPE | PxShapeFlag:: eSIMULATION_SHAPE
    createShape(geometry: PxGeometry, material: Material, isExclusive?: boolean | false, shapeFlags?: number | PxShapeFlags): PxShape;
    getTolerancesScale(): PxTolerancesScale;
  }
  class PxTolerancesScale {
    length: number | 1.0;
    speed: number | 10.0;
  }
  class PxPvd {
    connect(pvdTransport: PxPvdTransport): void;
  }
  function PxCreatePhysics(a?: number, b?: PxFoundation, c?: PxTolerancesScale, trackOutstandingAllocations?: boolean, e?: PxPvd): PxPhysics;
  function PxCreateCooking(version: number, foundation: PxFoundation, params: PxCookingParams): PxCooking;
  function PxCreatePvd(foundation: PxFoundation): PxPvd;

  function allocateRaycastHitBuffers(size: number): PxRaycastBuffer;

  function allocateSweepHitBuffers(size: number): PxRaycastBuffer;

  type Type = {};

  const HEAPU8: Uint8Array;
  const HEAPU16: Uint16Array;
  const HEAPU32: Uint32Array;

  function PxCreateControllerManager(scene: PxScene, lockingEnabled: boolean): PxControllerManager;

  class PxControllerManager {
    createCapsuleController(desc: PxControllerDesc): PxCapsuleController;
    createBoxController(desc: PxControllerDesc): PxBoxController;
  }

  class PxControllerDesc {
    position: PxVec3;
    isValid(): boolean;
    setMaterial(material: Material): void;
    stepOffset: number;
    contactOffset: number;
    maxJumpHeight: number;
    invisibleWallHeight: number;
    slopeLimit: number;
    setReportCallback(callbackImp: any): any;
  }

  class PxCapsuleControllerDesc extends PxControllerDesc {
    radius: number;
    height: number;
    climbingMode: PxCapsuleClimbingMode;
  }

  class PxBoxControllerDesc extends PxControllerDesc {
    halfForwardExtent: number;
    halfHeight: number;
    halfSideExtent: number;
  }

  enum PxCapsuleClimbingMode {
    eEASY,
    eCONSTRAINED,
    eLAST,
  }

  class PxFilterData {
    word0: number;
    word1: number;
    word2: number;
    word3: number;

    constructor(word0: number, word1: number, word2: number, word3: number);
  }

  class PxQueryFilterData {
    constructor();
  }

  class PxQueryFilterCallback {
    static implement(queryFilterCallback: PxQueryFilterCallback): PxQueryFilterCallback;

    postFilter(filterData: any, hit: any): void;
    preFilter(filterData: any, shape: any, actor: any): void;
  }

  class PxControllerFilterCallback {}

  class PxControllerFilters {
    constructor(filterData?: PxFilterData, callbacks?: PxQueryFilterCallback, cctFilterCb?: PxControllerFilterCallback);
  }

  class PxObstacleContext {}

  class PxController extends Base {
    move(displacement: PxVec3, minDistance: number, elapsedTime: number, filters: PxControllerFilters, obstacles?: PxObstacleContext): PxControllerCollisionFlags;
    setPosition(pos: PxVec3): any;
    getPosition(): PxVec3;
    getActor(): PxRigidDynamic;
    resize(height: number): void;
    release(): void;
  }

  class PxCapsuleController extends PxController {
    getHeight(): number;
    getRadius(): number;
    getClimbingMode(): PxCapsuleClimbingMode;
    setHeight(height: number): void;
    setRadius(radius: number): void;
    setClimbingMode(climbingMode: PxCapsuleClimbingMode): void;
  }

  class PxBoxController extends PxController {
    getHalfForwardExtent(): number;
    getHalfHeight(): number;
    getHalfSideExtent(): number;
    setHalfForwardExtent(size: number): void;
    setHalfHeight(size: number): void;
    setHalfSideExtent(size: number): void;
  }

  class PxUserControllerHitReport {
    static implement(userControllerHitReport: PxUserControllerHitReport): PxUserControllerHitReport;

    onShapeHit(event: PxControllerShapeHit): void;
    onControllerHit(event: unknown): void;
    onObstacleHit(event: unknown): void;
  }

  class PxControllerHit {
    getController(): PxController;
    getWorldPos(): PxVec3;
    getWorldNormal(): PxVec3;
    getLength(): number;
    getTriangleIndex(): number;
  }

  class PxControllerShapeHit extends PxControllerHit {
    getShape(): PxShape;
    getActor(): PxRigidActor;
  }

  class PxControllersHit extends PxControllerHit {
    getOther(): PxController;
  }
  class PxObstacleHit extends PxControllerHit {
    getUserData(): number;
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

declare function PhysX(): Promise<typeof PhysX>;
