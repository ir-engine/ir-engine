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

import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { merge } from 'lodash-es'
import { initReactI18next } from 'react-i18next'

import getClientCoreI18nConfigs from '@etherealengine/client-core/src/i18n'
import { getI18nConfigs } from '@etherealengine/client-core/src/i18nImporter'

//@ts-ignore
const projects = import.meta.glob('../../projects/projects/**/i18n/**/*.json', { eager: true })
//@ts-ignore
const clientI18nConfigs = import.meta.glob('../i18n/**/*.json', { eager: true })

export const initializei18n = () => {
  const modules = merge(clientI18nConfigs, getClientCoreI18nConfigs(), projects)

  const { namespace, resources } = getI18nConfigs(modules)

  i18n.use(LanguageDetector).use(initReactI18next).init({
    fallbackLng: 'en',
    ns: namespace,
    defaultNS: 'translation',
    lng: 'en',
    resources
  })
}

// TODO: support typed translations #7253
// declare module 'react-i18next' {
//   // and extend them!
//   interface CustomTypeOptions {
//     // custom namespace type if you changed it
//     defaultNS: 'en';
//     // custom resources type
//     resources: ReturnType<typeof getI18nConfigs>['resources'];
//   }
// }
