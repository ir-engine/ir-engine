/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

export type Category = {
  name: string
  object: object
  collapsed: boolean
  isLeaf: boolean
  depth: number
}

const ASSET_PANEL_CATEGORIES = Object.freeze({
  'Default Prefab': {},

  Model: {
    // NPC: {},
    // Avatar: {},
    // Animal: {},
    Template: {
      // Backdrop: {},
      // Stage: {}
    },
    Architectural: {
      Floor: {},
      Ceiling: {},
      Wall: {}
    },
    // 'Basic Shape': {
    //   Artistic: {},
    //   Primitive: {
    //     'Platonic Solid': {},
    //     Fractal: {}
    //   }
    // },
    Kit: {
      Gothic: {},
      Cottage: {},
      Scifi: {},
      Modern: {},
      Nature: {},
      Ecommerce: {},
      Noir: {}
    },
    Prop: {
      // Furniture: {
      //   Chairs: {},
      //   Showcase: {},
      //   Displays: {}
      // }
    }
    // Terrain: {}
  },
  Material: {
    // Standard: {
    //   Plastic: {},
    //   Glass: {},
    //   'Rough glass': {},
    //   Metal: {},
    //   Glow: {},
    //   Rubber: {},
    //   Water: {},
    //   Bubble: {},
    //   Diamond: {},
    //   Clay: {},
    //   'Car Paint': {},
    //   Wood: {},
    //   Stone: {},
    //   Dirt: {},
    //   Grass: {},
    //   Cloth: {},
    //   Bark: {},
    //   Snow: {}
    // },
    // Advanced: {
    //   Static: {},
    //   Animated: {}
    // }
  },
  Image: {
    // Background: {},
    // Texture: {
    //   Diffuse: {},
    //   'Normal Maps': {},
    //   Occlusion: {},
    //   Metalness: {},
    //   Roughness: {}
    // },
    // Tiling: {
    //   Diffuse: {},
    //   'Normal Map': {},
    //   Occlusion: {},
    //   Metalness: {},
    //   Roughness: {}
    // },
    // Sprite: {}
  },
  // Light: {},
  Video: {},
  Audio: {
    // Music: {},
    // 'Sound FX': {}
  },
  Particle: {
    // Smoke: {},
    // Fire: {},
    // Lightning: {},
    // Portal: {},
    // Sparkle: {}
  },
  Skybox: {
    // 'Time of Day': {
    //   Morning: {},
    //   Noon: {},
    //   Evening: {},
    //   Night: {}
    // },
    // Abstract: {},
    // 'Low Contrast': {},
    // 'High Contrast': {}
  },
  'Post Processing': {
    // Fog: {},
    // Cinematic: {}
  }
  // Agent: {},
  // Genre: {
  //   Office: {},
  //   Gothic: {},
  //   Scifi: {},
  //   Cottage: {},
  //   Modern: {},
  //   Luxury: {},
  //   Noir: {},
  //   Nature: {
  //     Jungle: {},
  //     Arctic: {},
  //     Boreal: {},
  //     Desert: {}
  //   },
  //   Holiday: {
  //     Passover: {},
  //     'St Patrick’s Day': {},
  //     'Yam Kippur': {},
  //     'Veteran’s Day': {}
  //   },
  //   Abstract: {},
  //   Fantasy: {}
  // }
})

export function iterativelyListTags(obj: object): string[] {
  const tags: string[] = []
  for (const key in obj) {
    tags.push(key)
    if (typeof obj[key] === 'object') {
      tags.push(...iterativelyListTags(obj[key]))
    }
  }
  return tags
}

export const ASSETS_PAGE_LIMIT = 10

export const calculateItemsToFetch = () => {
  const parentElement = document.getElementById('asset-panel')?.getBoundingClientRect()
  const containerHeight = parentElement ? parentElement.width : 0
  const containerWidth = parentElement ? parentElement.height : 0
  const item = document.getElementsByClassName('resource-file')[0]?.getBoundingClientRect()

  const defaultSize = 160
  const itemHeight = Math.floor((item ? item.height : defaultSize) * window.devicePixelRatio)
  const itemWidth = Math.floor((item ? item.width : defaultSize) * window.devicePixelRatio)

  const itemsInRow = Math.ceil(containerWidth / itemWidth)
  const numberOfRows = Math.ceil(containerHeight / itemHeight)
  return itemsInRow * numberOfRows
}

export function mapCategoriesHelper(collapsedCategories: { [key: string]: boolean }) {
  const result: Category[] = []
  const generateCategories = (node: object, depth = 0) => {
    for (const key in node) {
      const isLeaf = Object.keys(node[key]).length === 0
      const category: Category = {
        name: key,
        object: node[key],
        collapsed: collapsedCategories[key] ?? true,
        depth,
        isLeaf
      }
      result.push(category)
      if (typeof node[key] === 'object' && !category.collapsed) {
        generateCategories(node[key], depth + 1)
      }
    }
  }
  generateCategories(ASSET_PANEL_CATEGORIES)
  return result
}

export function getParentCategories(categories: readonly Category[], target: string) {
  const findNestingCategories = (nestedCategory: Record<string, any>, parentCategory: string): Category[] => {
    for (const key in nestedCategory) {
      if (key === target) {
        const foundCategory = categories.find((c) => c.name === parentCategory)
        if (foundCategory) {
          return [foundCategory]
        }
        return []
      } else if (typeof nestedCategory[key] === 'object' && nestedCategory[key] !== null) {
        const nestedCategories = findNestingCategories(nestedCategory[key], key)
        if (nestedCategories.length) {
          return [categories.find((c) => c.name === parentCategory)!, ...nestedCategories]
        }
      }
    }
    return []
  }

  for (const category of categories) {
    const parentCategories = findNestingCategories(category.object, category.name)
    if (parentCategories.length) {
      return parentCategories
    }
  }
  return []
}
