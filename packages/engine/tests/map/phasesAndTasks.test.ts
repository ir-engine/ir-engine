// TODO
// import Task from '../../src/map/classes/Task'
// import Phase from '../../src/map/classes/Phase'
// import AsyncPhase from '../../src/map/classes/AsyncPhase'
// import actuateLazy from '../../src/map/functions/actuateLazy'
// import AsyncTask from '../../src/map/classes/AsyncTask'
// import MapCache from '../../src/map/classes/MapCache'
// import ArrayKeyedMap from '../../src/map/classes/ArrayKeyedMap'

// const spyMethods = ['exec', 'start', 'createTask', 'getTasks', 'getTaskKeys', 'cleanup']
// function spyClass(klass: any) {
//   return function newConstructor(...args: any[]) {
//     const instance = new klass(...args)
//     for (const methodName of spyMethods) {
//       if (instance[methodName]) {
//         jest.spyOn(instance, methodName)
//       }
//     }
//     newConstructor.prototype = instance.prototype
//     return instance
//   } as any
// }

// @spyClass
// class ChopVeggieTask extends Task<string> {
//   exec() {
//     return 'chop!'.repeat(3)
//   }
// }

// @spyClass
// class ChopVeggiePhase extends Phase<ChopVeggieTask> {
//   tasks = [new ChopVeggieTask(), new ChopVeggieTask(), new ChopVeggieTask()]
//   getTasks() {
//     return this.tasks
//   }
//   cleanup() {}
// }

// @spyClass
// class SauteVeggiesTask extends Task<string> {
//   exec() {
//     return 'szzzzzz!'
//   }
// }

// @spyClass
// class SauteVeggiesPhase extends Phase<SauteVeggiesTask> {
//   getTasks() {
//     return [new SauteVeggiesTask()]
//   }
//   cleanup() {}
// }

// @spyClass
// class BoilWaterTask extends AsyncTask<string> {
//   potSize: number
//   constructor(potSize: number) {
//     super()
//     this.potSize = potSize
//   }
//   start() {
//     return Promise.resolve('blub'.repeat(this.potSize))
//   }
// }

// @spyClass
// class BoilWaterPhase extends AsyncPhase<BoilWaterTask, number[], string> {
//   cache = new MapCache<number[], string>(5);
//   taskMap = new ArrayKeyedMap<number[], BoilWaterTask>()

//   getTaskKeys() {
//     return [
//       [2],
//       [3]
//     ]
//   }

//   createTask(potSize: number) {
//     const task = new BoilWaterTask(potSize)
//     return task
//   }
// }

// @spyClass
// class OrderTakoutTask extends AsyncTask<string> {
//   fineEstablishment: string
//   constructor(fineEstablishment: string) {
//     super()
//     this.fineEstablishment = fineEstablishment
//   }
//   start() {
//     return Promise.resolve(`weclome to ${this.fineEstablishment}`)
//   }
// }

// @spyClass
// class OrderTakeoutPhase extends AsyncPhase<OrderTakoutTask, any[], string> {
//   cache = new MapCache<any[], string>(5)
//   fineEstablishments = [['pizza hut'], ['taco bell']];
//   taskMap = new ArrayKeyedMap<string[], OrderTakoutTask>()

//   getTaskKeys() {
//     return this.fineEstablishments
//   }

//   createTask(fineEstablishment: string) {
//     return new OrderTakoutTask(fineEstablishment)
//   }
// }

// function expectAllTasksToHaveBeenExecuted<TaskType extends Task<any>>(phase: Phase<TaskType>) {
//   const firstCallResult = (phase.getTasks as jest.Mock).mock.results[0].value
//   let taskCount = 0
//   expect(phase.getTasks).toHaveBeenCalled()
//   for (const task of firstCallResult) {
//     taskCount++
//     expect(task.exec).toHaveBeenCalled()
//   }
//   expect(taskCount).toBeGreaterThan(0)
// }
// function expectAllAsyncTasksToHaveBeenStartedOnce<TaskType extends AsyncTask<any>>(phase: AsyncPhase<TaskType, any, any>) {
//   const firstCallResult = (phase.getTaskKeys as jest.Mock).mock.results[0].value
//   let taskCount = 0
//   expect(phase.getTaskKeys).toHaveBeenCalled()
//   for (const key of firstCallResult) {
//     const task = phase.taskMap.get(key)
//     taskCount++
//     expect(task.start).toHaveBeenCalledTimes(1)
//   }
//   expect(taskCount).toBeGreaterThan(0)
// }

// describe('actuateLazy() integration with (Async)Task/Phase', () => {

//   beforeEach(() => jest.clearAllMocks())

//   it('executes all tasks of each phase', () => {
//     const chop = new ChopVeggiePhase()
//     const saute = new SauteVeggiesPhase()
//     const phases = [chop, saute]
//     actuateLazy(phases)
//     expectAllTasksToHaveBeenExecuted(chop)
//     expectAllTasksToHaveBeenExecuted(saute)
//   })

//   it('starts all tasks of each async phase', () => {
//     const boil = new BoilWaterPhase()
//     const order = new OrderTakeoutPhase()
//     const phases = [boil, order]
//     actuateLazy(phases)
//     expectAllAsyncTasksToHaveBeenStartedOnce(boil)
//     expectAllAsyncTasksToHaveBeenStartedOnce(order)
//   })

//   it('executes all tasks that have been added since last call', () => {
//     const chop = new ChopVeggiePhase()
//     const phases = [chop]
//     actuateLazy(phases)

//     expectAllTasksToHaveBeenExecuted(chop)

//     chop.tasks.push(new ChopVeggieTask())
//     actuateLazy(phases)

//     expectAllTasksToHaveBeenExecuted(chop)
//   })

//   it('starts only all async tasks that have been added since last call', () => {
//     const order = new OrderTakeoutPhase()
//     const phases = [order]
//     actuateLazy(phases)

//     expectAllAsyncTasksToHaveBeenStartedOnce(order)

//     phases[0].fineEstablishments.push(['kfc'], ['chuck e cheese'])
//     actuateLazy(phases)

//     expectAllAsyncTasksToHaveBeenStartedOnce(order)
//   })

//   it('gives each phase a chance to do any necessary clean up', () => {
//     const chop = new ChopVeggiePhase()
//     const boil = new BoilWaterPhase()
//     const phases = [boil, chop]
//     actuateLazy(phases)
//     expect(chop.cleanup).toHaveBeenCalledTimes(1)
//     expect(boil.cleanup).toHaveBeenCalledTimes(1)
//   })
// })
