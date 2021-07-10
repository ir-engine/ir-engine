import { createItem, createCol, createRow, createButton, makeLeftItem } from '../functions/createItem'
import { UI_ELEMENT_SELECT_STATE } from '../classes/UIBaseElement'

export const createPlayPanel = (param) => {
  const width = param.width
  const height = param.height

  const backButton = createButton({
    title: 'Back'
  })

  const preview = createItem({
    width: width,
    height: height,
    texture: param.texture
  })
  preview.set({
    alignContent: 'center',
    justifyContent: 'center'
  })

  const text = createItem({
    width: width - 0.8 - 0.025 * 4,
    height: 0.1,
    title: 'SceneTitle',
    description: 'Scene Description'
  })
  text.set({
    backgroundOpacity: 0.0
  })

  const purchaseButton = createButton({
    title: 'Purchase'
  })

  const playButton = createButton({
    title: 'Play'
  })

  const bottomBar = createRow(width, 0.2, [text, playButton, purchaseButton], 0.025)

  playButton.visible = false

  const panel = createCol(
    width,
    height,
    [makeLeftItem({ item: backButton, containerWidth: width }), preview, bottomBar],
    0.01
  )

  backButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, param.backCB)
  playButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, param.playCB)
  purchaseButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, param.purchaseCB)

  return {
    preview: preview,
    panel: panel,
    setPurchase: (isPurchase) => {
      if (isPurchase) {
        playButton.visible = false
        purchaseButton.children[1].set({
          content: 'Purchase'
        })
      } else {
        playButton.visible = true
        purchaseButton.children[1].set({
          content: 'Download'
        })
      }
    }
  }
}
