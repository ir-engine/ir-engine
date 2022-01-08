import { Application } from '../../../declarations'
import { GameServerSetting } from './game-server-setting.class'
import hooks from './game-server-setting.hooks'
import createModel from './game-server-setting.model'

declare module '../../../declarations' {
  interface SerViceTypes {
    GameServer: GameServerSetting
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new GameServerSetting(options, app)
  app.use('game-server-setting', event)

  const service = app.service('game-server-setting')

  service.hooks(hooks)
}
