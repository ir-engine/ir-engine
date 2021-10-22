/**
 * if HMR is reloading this file, decline it, as it will import the globs more than once
 */
//@ts-ignore
if (import.meta.hot) {
  //@ts-ignore
  import.meta.hot.decline()
}

declare global {
  interface ImportMeta {
    globEager: (glob: string) => { [module: string]: any }
  }
}

export const store = {
  stateModules: {} as { [module: string]: any },

  stateModulesMissingReceptor: [],
  receptors: [] as Function[],

  registerStateModules(stateModules: { [module: string]: any }) {
    Object.assign(store.stateModules, stateModules)
    store.receptors.push(
      ...Object.entries(stateModules).map(([k, m]) => {
        if (!m.receptor) {
          console.warn(`${k} is missing a 'receptor' export`)
          return () => {}
        }
        return m.receptor
      })
    )
  },

  dispatch(action: { type: string; [key: string]: any }) {
    // console.log(action)
    for (const r of store.receptors) r(action)
  }
}

export function useDispatch() {
  return store.dispatch
}

const userStateModules = import.meta.globEager('./user/state/*State.ts')
const commonStateModules = import.meta.globEager('./common/state/*State.ts')
const adminStateModules = import.meta.globEager('./admin/state/*State.ts')
const adminSettingStateModules = import.meta.globEager('./admin/state/Setting/*State.ts')
const socialStateModules = import.meta.globEager('./social/state/*State.ts')
const mediaStateModules = import.meta.globEager('./media/state/*State.ts')

store.registerStateModules(userStateModules)
store.registerStateModules(commonStateModules)
store.registerStateModules(adminStateModules)
store.registerStateModules(adminSettingStateModules)
store.registerStateModules(socialStateModules)
store.registerStateModules(mediaStateModules)
