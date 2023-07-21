/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

/* eslint-disable no-console */

import { EventEmitter } from '../Events/EventEmitter.js'

export class Logger {
  public static readonly onVerbose = new EventEmitter<string>()
  public static readonly onInfo = new EventEmitter<string>()
  public static readonly onWarn = new EventEmitter<string>()
  public static readonly onError = new EventEmitter<string>()

  static {
    const prefix = () => {
      return new Date().toLocaleTimeString().padStart(11, '0')
    }
    Logger.onVerbose.addListener((text: string) => {
      console.log(prefix() + ` VERB:  ${text}`)
    })
    Logger.onInfo.addListener((text: string) => {
      console.log(prefix() + ` INFO:  ${text}`)
    })
    Logger.onWarn.addListener((text: string) => {
      console.warn(prefix() + ` WARN:  ${text}`)
    })
    Logger.onError.addListener((text: string) => {
      console.error(prefix() + ` ERR:  ${text}`)
    })
  }

  static verbose(text: string) {
    this.onVerbose.emit(text)
  }

  static info(text: string) {
    this.onInfo.emit(text)
  }

  static warn(text: string) {
    this.onWarn.emit(text)
  }

  static error(text: string) {
    this.onError.emit(text)
  }
}
