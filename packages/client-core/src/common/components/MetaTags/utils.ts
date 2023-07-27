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

const camelCaseProps = ['itemProp']
const uniqueIdentifiersI = ['property', 'name', 'itemprop']

/**
 * This code is taken from https://github.com/s-yadav/react-meta-tags
 * Here we fixed breaking changes introduced due to react 18
 **/

function filterOutMetaWithId(metas) {
  metas = Array.prototype.slice.call(metas || [])
  return metas.filter((meta) => !meta.id)
}

export function getDuplicateTitle() {
  return document.head.querySelectorAll('title')
}

export function getDuplicateCanonical() {
  return document.head.querySelectorAll('link[rel="canonical"]')
}

export function getDuplicateElementById({ id }) {
  return id && document.head.querySelector(`#${id}`)
}

export function getDuplicateMeta(meta) {
  const head = document.head

  //for any other unique identifier check if metas already available with same identifier which doesn't have id
  return uniqueIdentifiersI.reduce((duplicates, identifier) => {
    const identifierValue = meta.getAttribute(identifier)
    return identifierValue
      ? duplicates.concat(filterOutMetaWithId(head.querySelectorAll(`[${identifier} = "${identifierValue}"]`)))
      : duplicates
  }, [])
}

//function to append childrens on a parent
export function appendChild(parent, childrens) {
  if (childrens.length === undefined) childrens = [childrens]

  const docFrag = document.createDocumentFragment()

  //we used for loop instead of forEach because childrens can be array like object
  for (let i = 0, ln = childrens.length; i < ln; i++) {
    docFrag.appendChild(childrens[i])
  }

  parent.appendChild(docFrag)
}

export function removeChild(parent, childrens) {
  if (childrens.length === undefined) childrens = [childrens]
  for (let i = 0, ln = childrens.length; i < ln; i++) {
    parent.removeChild(childrens[i])
  }
}
