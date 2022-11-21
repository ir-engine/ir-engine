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
