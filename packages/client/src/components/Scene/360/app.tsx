import {
  UIBlock,
  UIText,
  UIBaseElement,
  UI_ELEMENT_SELECT_STATE
} from '@xrengine/engine/src/ui-old/classes/UIBaseElement'
import { VideoPlayer } from './VideoPlayer'
import { Control } from '@xrengine/engine/src/ui-old/classes/Control'
import {
  createItem,
  createCol,
  createRow,
  createButton,
  makeLeftItem
} from '@xrengine/engine/src/ui-old/functions/createItem'

export class XR360Player extends UIBaseElement {
  marketPlace: UIBlock
  library: UIBlock
  purchasePanel: UIBlock
  oldPanel: UIBlock
  playButton: UIBlock
  purchaseButton: UIBlock
  buttonMarket: UIBlock
  buttonLibrary: UIBlock
  preview: UIBlock
  isPurchase: Boolean
  player: VideoPlayer
  control: Control

  constructor(param) {
    super()
    this.init(param)
  }

  init(param) {
    const envUrl = param.envUrl

    const gap = param.uiConfig.gap
    const itemWidth = param.uiConfig.panelWidth
    const itemHeight = param.uiConfig.panelHeight
    const totalWidth = itemWidth * 3 + gap * 4
    const totalHeight = itemHeight * 3 + gap * 4

    let setPurchase = null
    const marketPlaceItemClickCB = (panel) => {
      if (this.purchasePanel) {
        this.purchasePanel.visible = true
        this.marketPlace.visible = false
        this.oldPanel = this.marketPlace
        this.isPurchase = true
        setPurchase(true)
        this.buttonMarket.visible = false
        this.buttonLibrary.visible = false
        this.preview.set({
          backgroundTexture: panel.backgroundTexture
        })
      }
    }

    const libraryItemClickCB = (panel) => {
      if (this.purchasePanel) {
        this.purchasePanel.visible = true
        this.library.visible = false
        this.oldPanel = this.library
        this.isPurchase = false
        setPurchase(false)
        this.buttonMarket.visible = false
        this.buttonLibrary.visible = false
        this.preview.set({
          backgroundTexture: panel.backgroundTexture
        })
      }
    }

    const gallery = createGallery({
      marketPlaceItemClickCB: marketPlaceItemClickCB,
      libraryItemClickCB: libraryItemClickCB,
      data: param,
      gap: gap,
      itemWidth: itemWidth,
      itemHeight: itemHeight,
      totalWidth: totalWidth,
      totalHeight: totalHeight
    })
    this.marketPlace = gallery.marketPlace
    this.library = gallery.library
    this.add(this.marketPlace)
    this.add(this.library)

    this.buttonMarket = createButton({ title: 'Marketplace' })
    this.buttonLibrary = createButton({ title: 'Library' })

    this.add(this.buttonMarket)
    this.add(this.buttonLibrary)

    this.buttonMarket.position.set(-0.5, 1, 0)
    this.buttonLibrary.position.set(-0.05, 1, 0)

    this.buttonMarket.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.library.visible = false
      this.marketPlace.visible = true
    })

    this.buttonLibrary.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.library.visible = true
      this.marketPlace.visible = false
    })

    this.library.visible = false
    this.position.set(0, 1, 0)
    this.rotation.y = Math.PI

    const play = createPlayPanel({
      gap: gap,
      itemWidth: itemWidth,
      itemHeight: itemHeight,
      totalWidth: totalWidth,
      totalHeight: totalHeight,
      width: totalWidth,
      height: itemHeight * 2.5,
      backCB: () => {
        this.purchasePanel.visible = false
        this.oldPanel.visible = true
        this.buttonMarket.visible = true
        this.buttonLibrary.visible = true
      },
      playCB: () => {
        this.purchasePanel.visible = false
        this.control.visible = true
      },
      purchaseCB: () => {
        if (this.isPurchase) {
        } else {
        }
      }
    })

    this.preview = play.preview
    this.purchasePanel = play.panel
    setPurchase = play.setPurchase
    this.purchasePanel.visible = false

    this.add(this.purchasePanel)

    this.player = new VideoPlayer(this, envUrl)

    this.control = new Control({
      play: (played, paused) => {
        this.player.playVideo(param.galleryItems[0].streamUrl, played, paused)
      },
      back: () => {
        this.player.stopVideo()
        this.control.visible = false
        this.library.visible = true
      },
      seek: (time) => {
        this.player.seek(time)
      }
    })
    this.add(this.control)

    this.player.control = this.control

    this.control.visible = false
  }
}

const createGallery = (param) => {
  const marketPlaceItemClickCB = param.marketPlaceItemClickCB
  const libraryItemClickCB = param.libraryItemClickCB

  let urlIndex = 0

  const ov = createItem({
    title: param.data.galleryItems[urlIndex].title,
    description: param.data.galleryItems[urlIndex].description,
    imageUrl: param.data.galleryItems[urlIndex].thumbUrl,
    width: param.totalWidth,
    height: 0.8,
    selectable: true
  })
  urlIndex++
  ov.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
    marketPlaceItemClickCB(ov)
  })

  let cols = []
  cols.push(ov)

  for (let j = 0; j < 2; j++) {
    const rows = []
    for (let i = 0; i < 3; i++) {
      const panel = createItem({
        title: param.data.galleryItems[urlIndex].title,
        description: param.data.galleryItems[urlIndex].description,
        imageUrl: param.data.galleryItems[urlIndex].thumbUrl,
        width: param.itemWidth,
        height: param.itemHeight,
        selectable: true
      })
      urlIndex++
      rows.push(panel)

      panel.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
        marketPlaceItemClickCB(panel)
      })
    }
    cols.push(createRow(param.totalWidth, param.itemHeight, rows, param.gap))
  }

  const marketPlace = createCol(param.totalWidth, param.totalHeight, cols, param.gap)

  urlIndex = 0
  cols = []
  for (let j = 0; j < 3; j++) {
    const rows = []
    for (let i = 0; i < 3; i++) {
      const panel = createItem({
        title: param.data.libraryItems[urlIndex].title,
        description: param.data.libraryItems[urlIndex].description,
        imageUrl: param.data.libraryItems[urlIndex].thumbUrl,
        width: param.itemWidth,
        height: param.itemHeight,
        selectable: true
      })
      urlIndex++
      rows.push(panel)

      panel.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
        libraryItemClickCB(panel)
      })
    }
    cols.push(createRow(param.totalWidth, param.itemHeight, rows, param.gap))
  }

  const buttonHeight = 0.1
  const dummy = new UIBlock({
    width: param.itemWidth,
    height: buttonHeight,
    backgroundOpacity: 0.0
  })
  const buttonNext = createButton({ title: 'Next' })
  const buttonBar = createRow(param.totalWidth, buttonHeight, [dummy, buttonNext], 0)
  buttonBar.set({
    alignContent: 'center',
    justifyContent: 'end'
  })
  cols.push(buttonBar)

  const library = createCol(param.totalWidth, param.totalHeight, cols, param.gap)

  buttonNext.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
    library.visible = false
    marketPlace.visible = true
  })

  return {
    marketPlace: marketPlace,
    library: library
  }
}

const createPlayPanel = (param) => {
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
