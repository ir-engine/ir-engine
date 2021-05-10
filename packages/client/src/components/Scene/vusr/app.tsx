import { UIBlock, UIText, UIBaseElement, UI_ELEMENT_SELECT_STATE } from '@xrengine/engine/src/ui/classes/UIBaseElement';
import { VideoPlayer } from '@xrengine/engine/src/ui/classes/VideoPlayer';
import { Control } from '@xrengine/engine/src/ui/classes/Control';
import { Color, Vector3, Quaternion, Euler, Object3D, TextureLoader } from 'three';
import { createItem, createCol, createRow, createButton, makeLeftItem } from '@xrengine/engine/src/ui/functions/createItem';

let gap = 0.02;
let itemWidth = 1;
let itemHeight = 0.5;
let totalWidth = itemWidth * 3 + gap * 4;
let totalHeight = itemHeight * 3 + gap * 4;

export class VUSR360Player extends UIBaseElement {
  marketPlace: UIBlock;
  library: UIBlock;
  purchasePanel: UIBlock;
  oldPanel: UIBlock;
  playButton: UIBlock;
  purchaseButton: UIBlock;
  buttonMarket: UIBlock;
  buttonLibrary: UIBlock;
  preview: UIBlock;
//   buyPanel: UIBlock;
  isPurchase: Boolean;
  player: VideoPlayer;
  control: Control;

  constructor(param) {
    super();
    this.init(param);
  }

  init(param) {
    const envUrl = param.envUrl;
    gap = param.uiConfig.gap;
    itemWidth = param.uiConfig.panelWidth;
    itemHeight = param.uiConfig.panelHeight;
    totalWidth = itemWidth * 3 + gap * 4;
    totalHeight = itemHeight * 3 + gap * 4;

    let setPurchase = null;
    const marketPlaceItemClickCB = (panel) => {
      if (this.purchasePanel) {
        this.purchasePanel.visible = true;
        this.marketPlace.visible = false;
        this.oldPanel = this.marketPlace;
        this.isPurchase = true;
        setPurchase(true);
        this.buttonMarket.visible = false;
        this.buttonLibrary.visible = false;
        this.preview.set({
          backgroundTexture: panel.backgroundTexture
        });
      }
    };

    const libraryItemClickCB = (panel) => {
      if (this.purchasePanel) {
        this.purchasePanel.visible = true;
        this.library.visible = false;
        this.oldPanel = this.library;
        this.isPurchase = false;
        setPurchase(false);
        this.buttonMarket.visible = false;
        this.buttonLibrary.visible = false;
        this.preview.set({
          backgroundTexture: panel.backgroundTexture
        });
      }
    };

    const gallery = createGallery({
      marketPlaceItemClickCB: marketPlaceItemClickCB,
      libraryItemClickCB: libraryItemClickCB,
      data: param
    });
    this.marketPlace = gallery.marketPlace;
    this.library = gallery.library;
    this.add(this.marketPlace);
    this.add(this.library);

    this.buttonMarket = createButton({ title: "Marketplace" });
    this.buttonLibrary = createButton({ title: "Library" });

    this.add(this.buttonMarket);
    this.add(this.buttonLibrary);

    this.buttonMarket.position.set(-0.5, 1, 0);
    this.buttonLibrary.position.set(-0.05, 1, 0);

    this.buttonMarket.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.library.visible = false;
      this.marketPlace.visible = true;
    });

    this.buttonLibrary.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.library.visible = true;
      this.marketPlace.visible = false;
    });

    this.library.visible = false;
    this.position.set(0, 1, 0);
    this.rotation.y = Math.PI;

    const play = createPlayPanel({
      width: totalWidth,
      height: itemHeight * 2.5,
      backCB: () => {
        this.purchasePanel.visible = false;
        this.oldPanel.visible = true;
        this.buttonMarket.visible = true;
        this.buttonLibrary.visible = true;
        // this.buyPanel.visible = false;
      },
      playCB: () => {
        this.purchasePanel.visible = false;
        this.control.visible = true;
      },
      purchaseCB: () => {
        if (this.isPurchase) {
        //   this.buyPanel.visible = true;
        }
        else {

        }
      }
    });

    this.preview = play.preview;
    this.purchasePanel = play.panel;
    setPurchase = play.setPurchase;
    this.purchasePanel.visible = false;

    this.add(this.purchasePanel);

    // this.buyPanel = createBuyPanel({
    //   width: totalWidth * 0.5,
    //   height: totalHeight * 0.5,
    //   thumbnailUrls: [this.url(0), this.url(1), this.url(2), this.url(3), this.url(4), this.url(5)]
    // });

    // this.buyPanel.visible = false;
    // this.preview.add(this.buyPanel);

    this.player = new VideoPlayer(this, envUrl);

    this.control = new Control({
      play: (played, paused) => {
        this.player.playVideo(param.galleryItems[0].streamUrl, played, paused);
      },
      back: () => {
        this.player.stopVideo();
        this.control.visible = false;
        this.library.visible = true;
      },
      seek: (time) => {
        this.player.seek(time);
      }
    });
    this.add(this.control);

    this.player.control = this.control;

    this.control.visible = false;
  }
}



const createGallery = (param) => {
  const marketPlaceItemClickCB = param.marketPlaceItemClickCB;
  const libraryItemClickCB = param.libraryItemClickCB;

  let urlIndex = 0;

  const ov = createItem({
    title: param.data.galleryItems[urlIndex].title,
    description: param.data.galleryItems[urlIndex].description,
    imageUrl: param.data.galleryItems[urlIndex].thumbUrl,
    width: totalWidth,
    height: 0.8,
    selectable: true
  });
  urlIndex++
  ov.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
    marketPlaceItemClickCB(ov);
  });

  let cols = [];
  cols.push(ov);

  for (let j = 0; j < 2; j++) {
    const rows = [];
    for (let i = 0; i < 3; i++) {
      const panel = createItem({
        title: param.data.galleryItems[urlIndex].title,
        description: param.data.galleryItems[urlIndex].description,
        imageUrl: param.data.galleryItems[urlIndex].thumbUrl,
        width: itemWidth,
        height: itemHeight,
        selectable: true
      });
      urlIndex++
      rows.push(panel);

      panel.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
        marketPlaceItemClickCB(panel);
      });
    }
    cols.push(createRow(totalWidth, itemHeight, rows, gap));
  }

  const marketPlace = createCol(totalWidth, totalHeight, cols, gap);

  urlIndex = 0
  cols = [];
  for (let j = 0; j < 3; j++) {
    const rows = [];
    for (let i = 0; i < 3; i++) {
      const panel = createItem({
        title: param.data.libraryItems[urlIndex].title,
        description: param.data.libraryItems[urlIndex].description,
        imageUrl: param.data.libraryItems[urlIndex].thumbUrl,
        width: itemWidth,
        height: itemHeight,
        selectable: true
      });
      urlIndex++
      rows.push(panel);

      panel.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
        libraryItemClickCB(panel);
      });
    }
    cols.push(createRow(totalWidth, itemHeight, rows, gap));
  }

  const buttonHeight = 0.1;
  const dummy = new UIBlock({
    width: itemWidth,
    height: buttonHeight,
    backgroundOpacity: 0.0,
  });
  const buttonNext = createButton({ title: "Next" });
  const buttonBar = createRow(totalWidth, buttonHeight, [dummy, buttonNext], 0);
  buttonBar.set({
    alignContent: 'center',
    justifyContent: 'end',
  });
  cols.push(buttonBar);

  const library = createCol(totalWidth, totalHeight, cols, gap);

  buttonNext.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
    library.visible = false;
    marketPlace.visible = true;
  });

  return {
    marketPlace: marketPlace,
    library: library,
  };
};


const createPlayPanel = (param) => {
  const width = param.width;
  const height = param.height;

  const backButton = createButton({
    title: "Back"
  });

  const preview = createItem({
    width: width,
    height: height,
    texture: param.texture,
  });
  preview.set({
    alignContent: 'center',
    justifyContent: 'center',
  });

  const text = createItem({
    width: width - 0.8 - 0.025 * 4,
    height: 0.1,
    title: "SceneTitle",
    description: "Scene Description",
  });
  text.set({
    backgroundOpacity: 0.0,
  });

  const purchaseButton = createButton({
    title: "Purchase"
  });

  const playButton = createButton({
    title: "Play"
  });

  const bottomBar = createRow(
    width, 0.2,
    [
      text,
      playButton,
      purchaseButton
    ],
    0.025);

  playButton.visible = false;

  const panel = createCol(
    width, height,
    [
      makeLeftItem({ item: backButton, containerWidth: width }),
      preview,
      bottomBar
    ],
    0.01);

  backButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, param.backCB);
  playButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, param.playCB);
  purchaseButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, param.purchaseCB);

  return {
    preview: preview,
    panel: panel,
    setPurchase: (isPurchase) => {
      if (isPurchase) {
        playButton.visible = false;
        purchaseButton.children[1].set({
          content: "Purchase"
        });
      }
      else {
        playButton.visible = true;
        purchaseButton.children[1].set({
          content: "Download"
        });
      }
    }
  };
};


const createBuyPanel = (param) => {
  const width = param.width;
  const height = param.height;
  const urls = param.thumbnailUrls;

  const container = new UIBlock({
    width: width,
    height: height,
    fontFamily: "https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json",
    fontTexture: "https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png",
    backgroundOpacity: 1.0,
  });

  const topBar = new UIBlock({
    width: width,
    height: 0.2,
    backgroundOpacity: 0.0,
    contentDirection: 'row'
  });
  container.add(topBar);

  const closeButton = new UIBlock({
    height: 0.1,
    width: 0.1,
    margin: 0,
    padding: 0.01,
    alignContent: "center",
    backgroundOpacity: 0.0,
  }).add(
    new UIText({
      content: "x",
      fontSize: 0.05
    })
  );
  topBar.add(closeButton);

  const title = new UIBlock({
    height: 0.2,
    width: width - 0.2,
    margin: 0,
    padding: 0.07,
    alignContent: "center",
    backgroundOpacity: 0.0,
  }).add(
    new UIText({
      content: "This video is part of the ",
      fontSize: 0.05,
    }),
    new UIText({
      content: "Oceania 2021",
      fontSize: 0.07,
    }),
    new UIText({
      content: " Bundle.",
      fontSize: 0.05,
    })
  );
  topBar.add(title);

  const middleBar = new UIBlock({
    width: width,
    height: height * 0.7,
    backgroundOpacity: 0.0,
    contentDirection: 'row'
  });
  container.add(middleBar);

  const leftBar = new UIBlock({
    width: width * 0.4 * 1.2,
    height: height * 0.7,
    backgroundOpacity: 0.0,
    padding: 0.1,
    // margin: 0.1,
    alignContent: "left",
    justifyContent: "start",
    contentDirection: 'column'
  });
  middleBar.add(leftBar);

  const thumbWidth = width * 0.4 * 0.8;
  const overview = new UIBlock({
    width: thumbWidth + 6 * 0.01,
    height: thumbWidth * 0.6,
    backgroundSize: 'cover',
    contentDirection: 'row',
    margin: 0.005,
    alignContent: "center",
  });//contain, cover, stretch

  const loader = new TextureLoader();
  loader.load(
    urls[0],
    (texture) => {
      overview.set({ backgroundTexture: texture });
    }
  );

  leftBar.add(overview);

  const thumbBar = new UIBlock({
    width: thumbWidth,
    height: thumbWidth / 6 * 0.6,
    backgroundOpacity: 0.0,
    contentDirection: 'row',
    alignContent: "center",
    margin: 0.005,
  });
  leftBar.add(thumbBar);

  urls.forEach(u => {
    const subitem = new UIBlock({
      width: thumbWidth / 6,
      height: thumbWidth / 6 * 0.6,
      backgroundSize: 'cover',
      margin: 0.005,
      padding: 0,
      alignContent: "center",
    });//contain, cover, stretch

    loader.load(
      u,
      (texture) => {
        subitem.set({ backgroundTexture: texture });
      }
    );

    thumbBar.add(subitem);
  });

  const leftTextCol = new UIBlock({
    width: width * 0.25,
    height: height * 0.7,
    backgroundOpacity: 0.0,
    padding: 0.1,
    alignContent: "left",
    justifyContent: "start",
    contentDirection: 'column',
  });
  middleBar.add(leftTextCol);

  leftTextCol.add(
    new UIText({
      content: "Complete Bundle",
      fontSize: 0.04,
    }),
    new UIText({
      content: "\nIncludes 12 Experiences",
      fontSize: 0.03,
    }),
    new UIText({
      content: "\n\n\n\n            Total",
      fontSize: 0.04,
    })
  );

  const rightTextCol = new UIBlock({
    width: width * 0.25,
    height: height * 0.7,
    backgroundOpacity: 0.0,
    padding: 0.1,
    alignContent: "right",
    justifyContent: "start",
    contentDirection: 'column',
  });
  middleBar.add(rightTextCol);

  const buyButton = new UIBlock({
    height: 0.1,
    width: 0.2,
    backgroundColor: new Color('blue'),
    backgroundOpacity: 1.0,
    alignContent: "center",
    justifyContent: "center",
  }).add(
    new UIText({
      content: "Buy",
      fontSize: 0.05,
    })
  );

  rightTextCol.add(
    new UIBlock({
      height: 0.4,
      width: 0.2,
      backgroundOpacity: 0.0,
      alignContent: "right",
      justifyContent: "start",
      contentDirection: 'column',
    }).add(
      new UIText({
        content: "$9.99",
        fontSize: 0.04,
      }),
      new UIText({
        content: "\n\n\n\n\n$9.99",
        fontSize: 0.04,
      })
    ),
    buyButton
  );

  return container;
};
