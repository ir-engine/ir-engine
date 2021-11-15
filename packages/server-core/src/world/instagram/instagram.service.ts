import { Application } from '../../../declarations'
// import {getCubemapBake } from './scene-helper'
import { login, getPhotosByUsername } from './instagram-helper'

export default (app: Application) => {
  /**
   * Initialize our service with any options it requires and docs
   *
   * @author David Whiting
   */
  app.use('/instagram/login', login(app))
  app.use('/instagram/getPhotosByUsername', getPhotosByUsername(app))
}
