import { Object3D, Color, TextureLoader, VideoTexture, Mesh, SphereGeometry, MeshBasicMaterial, BackSide } from "three";
import { UIOverview } from "./UIOverview";
import { UIPanel } from './UIPanel';
import { UIButton } from "./UIButton";
import { UIBaseElement, UI_ELEMENT_SELECT_STATE } from "./UIBaseElement";
import {createItem, createCol, createRow, createButton, makeLeftItem} from '../functions/createItem';
import { Block, Text } from "../../assets/three-mesh-ui";
import shaka from 'shaka-player';

export class UIGallery extends UIBaseElement {
  marketPlace: Block;
  library: Block;
  purchasePanel: Block;
  oldPanel: Block;
  playButton: Block;
  purchaseButton: Block;
  buttonMarket: Block;
  buttonLibrary: Block;
  preview: Block;
  buyPanel: Block;

  constructor() {
    super();

    this.init();
  }

  init() {
    // const url = "360/ITN_Wrecks_FOR_REVIEW_4kx2k_360_h264_40Mbps.mp4";
    // const videoElement = new VideoElement(3.2, 0.8, 0.1, 1.35, url);
    const urls = [
      "360/VR THUMBNAIL/ARCTIC/_DSC5882x 2.JPG",
      "360/VR THUMBNAIL/CUBA/DSC_9484.jpg",
      "360/VR THUMBNAIL/GALAPAGOS/20171020_GALAPAGOS_5281.jpg",
      "360/VR THUMBNAIL/GREAT WHITES/_K4O2342PIX2.jpg",
      "360/VR THUMBNAIL/HAWAII/20171020_GALAPAGOS_4273.jpg",
      "360/VR THUMBNAIL/INTO THE NOW/20171020_GALAPAGOS_0782.jpg",
      "360/VR THUMBNAIL/SHARKS OF THE WORLD/_DSC3143.jpg",
      "360/VR THUMBNAIL/WILD COAST AFRICA/_MG_8949.jpg",
      "360/VR THUMBNAIL/WRECKS AND CAVES/_DSC2512.JPG",
    ];
    
    let url = (index)=>{
      let i = index % urls.length;
      return urls[i];
    }

    let urlIndex = 0;
    const gap = 0.02;
    const itemWidth = 1;
    const itemHeight = 0.5;
    const totalWidth = itemWidth*3+gap*4;
    const totalHeight = itemHeight*3+gap*4;

    let ov = createItem({
      title: "Scene Title", 
      description: "Scene Description\nSecode line of description", 
      imageUrl: url(urlIndex++),
      width: totalWidth,
      height: 0.8,
      selectable: true
    });
    ov.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.purchasePanel.visible = true;
      this.marketPlace.visible = false;
      this.oldPanel = this.marketPlace;
      this.buttonMarket.visible = false;
      this.buttonLibrary.visible = false;
      this.purchasePanel
      this.preview.set({
        backgroundTexture: ov.backgroundTexture
      });
    })

    let cols = [];
    cols.push(ov);

    for(let j=0;j<2;j++){
      let rows = [];
      for(let i = 0 ; i < 3;i++)
      {
        const panel = createItem({
          title: "Scene Title", 
          description: "Scene Description", 
          imageUrl: url(urlIndex++),
          width: itemWidth,
          height: itemHeight,
          selectable: true
        });
        rows.push(panel);

        panel.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
          this.purchasePanel.visible = true;
          this.marketPlace.visible = false;
          this.oldPanel = this.marketPlace;
          this.setPurchase(true);
          this.buttonMarket.visible = false;
          this.buttonLibrary.visible = false;
          this.preview.set({
            backgroundTexture: panel.backgroundTexture
          });
        })
      }
      cols.push(createRow(totalWidth, itemHeight, rows, gap));
    }

    this.marketPlace = createCol(totalWidth, totalHeight, cols, gap);
    this.add(this.marketPlace);

    cols = [];
    for (let j = 0; j < 3; j++) {
      let rows = [];
      for(let i = 0 ; i < 3;i++)
      {
        const panel = createItem({
          title: "Scene Title", 
          description: "Scene Description", 
          imageUrl: url(urlIndex++),
          width: itemWidth,
          height: itemHeight,
          selectable: true
        });
        rows.push(panel);

        panel.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
          this.purchasePanel.visible = true;
          this.library.visible = false;
          this.oldPanel = this.library;
          this.setPurchase(false);
          this.buttonMarket.visible = false;
          this.buttonLibrary.visible = false;
          this.preview.set({
            backgroundTexture: panel.backgroundTexture
          });
        })
      }
      cols.push(createRow(totalWidth, itemHeight, rows, gap));
    }
    let le = createCol(totalWidth, totalHeight, cols, gap);
    this.library.add( le );

    const marketPlacePanels = [];
    // marketPlacePanels.push(ov);

   

    //     const x = 1.1 * i - 1;
    //     const y = j * 0.6;

    //     const panel = new UIPanel({
    //       title: "Scene Title", 
    //       description: "Scene Description", 
    //       url: null
    //     });
    //     panel.position.set(x, y, 0);

    //     panel.oldPosX = panel.position.x;
    //     panel.oldPosY = panel.position.y;
    //     panel.oldPosZ = panel.position.z;

    //     this.marketPlace.add(panel);

       // this.elements.push(panel.container);
        this.elements.push(panel.button1);
        this.elements.push(panel.button2);
        this.elements.push(panel.button3);

    //     marketPlacePanels.push(panel);

    this.library = createCol(totalWidth, totalHeight, cols, gap);
    this.add(this.library);

    const marketPlacePanels = [];
    const libraryPanels = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {

        const x = 1.1 * i - 1;
        const y = j * 0.6 + 0.2;

        const panel = new UIPanel("Scene Title", "Scene Description", null);
        panel.position.set(x, y, 0);

        panel.oldPosX = panel.position.x;
        panel.oldPosY = panel.position.y;
        panel.oldPosZ = panel.position.z;

        this.library.add(panel);

      //  this.elements.push(panel.container);
        this.elements.push(panel.button1);
        this.elements.push(panel.button2);
        this.elements.push(panel.button3);

        libraryPanels.push(panel);
        // panel.pick = (state) => {
        //   if(state){
        //     // this.library.visible = false;
        //     // this.marketPlace.visible = false;  
        //   }
        //   panel.picked(state);
        // }
      }
    }

    this.add(this.buttonMarket);
    this.add(this.buttonLibrary);

    this.buttonMarket.position.set(-0.5, 1, 0);
    this.buttonLibrary.position.set(-0.05, 1, 0);

    this.buttonMarket.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.library.visible = false;
      this.marketPlace.visible = true;
    })

    this.buttonLibrary.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.library.visible = true;
      this.marketPlace.visible = false;
    })

    buttonNext.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.library.visible = false;
      this.marketPlace.visible = true;
    })

    this.library.visible = false;

    this.position.set(0, 1, 0);
    this.rotation.y = Math.PI;
    
    this.purchasePanel = this.createPurchaseSession({
      width: totalWidth,
      height: itemHeight*2.5,
    });
    this.purchasePanel.visible = false;

    this.add(this.purchasePanel);

    this.buyPanel = this.createBuyPanel({
        width: totalWidth*0.5,
        height: totalHeight*0.5,
        thumbnailUrls: [url(0), url(1), url(2), url(3), url(4), url(5)]
    });
    // this.add(this.buyPanel);
    // this.buyPanel.position.set(0, 0, 0.1);
    this.preview.add(this.buyPanel);

    this.createPlayer();
  }

  setPurchase(isPurchase){
    if(isPurchase){
      this.playButton.visible = false;
      this.purchaseButton.children[1].set({
        content: "Purchase"
      });
    }
    else{
      this.playButton.visible = true;
      this.purchaseButton.children[1].set({
        content: "Download"
      });
    };
  }

  createPurchaseSession(param){
    const width = param.width;
    const height = param.height;

    let backButton = createButton({
      title: "Back"
    });

    this.preview = createItem({
      width: width,
      height: height,
      texture: param.texture,
    });
    this.preview.set({
      alignContent: 'center',
      justifyContent: 'center',
    });

    let text = createItem({
      width: width-0.8-0.025*4,
      height: 0.1,
      title: "SceneTitle",
      description: "Scene Description",
    });
    text.set({
      backgroundOpacity: 0.0,      
    })

    this.purchaseButton = createButton({
      title: "Purchase"
    });

    this.playButton = createButton({
      title: "Play"
    });

    let bottomBar = createRow(
      width, 0.2, 
      [
        text, 
        this.playButton,
        this.purchaseButton
      ], 
      0.025);

    this.playButton.visible = false;

    backButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.purchasePanel.visible = false;
      this.oldPanel.visible = true;
      this.buttonMarket.visible = true;
      this.buttonLibrary.visible = true;
    });

    this.playButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      // this.library.visible = false;
      // this.marketPlace.visible = true;
    });

    this.purchaseButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      // this.library.visible = false;
      // this.marketPlace.visible = true;
    });
    
    return createCol(
      width, height, 
      [
        makeLeftItem({item: backButton, containerWidth: width}), 
        this.preview, 
        bottomBar
      ], 
      0.01);
  }

  initShaka(video, url){
    shaka.polyfill.installAll();
    const player = new shaka.Player(video);
    var promise = player.load(url);
    if (promise !== undefined) {
      promise.then(_ => {
        }).catch(error => {
      });
    }
  }

  createPlayer(){
    const url = "360/ITN_Wrecks_FOR_REVIEW_4kx2k_360_h264_40Mbps.mp4";
    let video = document.createElement( 'video' );
    document.documentElement.append( video );
    // video.setAttribute('crossorigin', 'anonymous');
    video.style.display = 'none';
    // video.loop = "loop";
    // video.src = url;
    // video.muted = true;
    // video.volume = 0.5;
    // video.controls = true;
    // video.autoplay = true;
    const texture = new VideoTexture(video);
    
    document.addEventListener("click", function(){
      var promise = video.play();
      console.log('playing');
      if (promise !== undefined) {
        promise.then(_ => {
        }).catch(error => {
        });
      }
    });

    this.initShaka(video, url);

    let material = new MeshBasicMaterial( { 
      map: texture
    } );
    material.side = BackSide;

    let mesh = new Mesh( 
      new SphereGeometry( 10, 60, 40 ), 
      material);
      
    // mesh.scale.x = -1;
    mesh.rotation.y = Math.PI*1.5;
    this.add( mesh );
  }

  createBuyPanel(param){
    const width = param.width;
    const height = param.height;
    const urls = param.thumbnailUrls;

    let container = new Block({
      width: width,
      height: height,
      fontFamily: "https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json",
      fontTexture: "https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png",
      backgroundOpacity: 1.0,
    });

    let topBar = new Block({
      width: width,
      height: 0.2,
      backgroundOpacity: 0.0,
      contentDirection: 'row'
    });
    container.add(topBar);
    
    let closeButton = new Block({
      height: 0.1,
      width: 0.1,
      margin: 0,
      padding: 0.01,
      alignContent: "center",
      backgroundOpacity: 0.0,
    }).add(
      new Text({
        content: "x",
        fontSize: 0.05
      })
    );
    topBar.add(closeButton);

    let title = new Block({
      height: 0.2,
      width: width-0.2,
      margin: 0,
      padding: 0.07,
      alignContent: "center",
      backgroundOpacity: 0.0,
    }).add(
      new Text({
        content: "This video is part of the ",
        fontSize: 0.05,
      }),
      new Text({
          content: "Oceania 2021",
          fontSize: 0.07,
        }),
        new Text({
          content: " Bundle.",
          fontSize: 0.05,
        })
    );
    topBar.add(title);
    
    let middleBar = new Block({
      width: width,
      height: height*0.7,
      backgroundOpacity: 0.0,
      contentDirection: 'row'
    });
    container.add(middleBar);

    let leftBar = new Block({
      width: width*0.4*1.2,
      height: height*0.7,
      backgroundOpacity: 0.0,
      padding: 0.1,
      // margin: 0.1,
      alignContent: "left",
      justifyContent: "start",
      contentDirection: 'column'
    });
    middleBar.add(leftBar);

    const thumbWidth = width*0.4*0.8;
    let overview = new Block({
          width: thumbWidth+6*0.01,
          height: thumbWidth*0.6,
          backgroundSize: 'cover',
          contentDirection: 'row',
          margin: 0.005,
          alignContent: "center",
        });//contain, cover, stretch
    
    const loader = new TextureLoader();
    loader.load(
        urls[0],
        (texture) => {
            overview.set({backgroundTexture: texture});
        }
    );
    
    leftBar.add(overview);
      
    let thumbBar = new Block({
      width: thumbWidth,
      height: thumbWidth/6*0.6,
      backgroundOpacity: 0.0,
      contentDirection: 'row',
      alignContent: "center",
      margin: 0.005,
    });
    leftBar.add(thumbBar);  
  
    urls.forEach(u => {
        let subitem = new Block({
            width: thumbWidth/6,
            height: thumbWidth/6*0.6,
            backgroundSize: 'cover',
            margin: 0.005,
            padding: 0,
            alignContent: "center",
        });//contain, cover, stretch
      
        loader.load(
            u,
            (texture) => {
                subitem.set({backgroundTexture: texture});
            }
        );                

        thumbBar.add(subitem);
    });

    let leftTextCol = new Block({
      width: width*0.25,
      height: height*0.7,
      backgroundOpacity: 0.0,
      padding: 0.1,
      alignContent: "left",
      justifyContent: "start",
      contentDirection: 'column',
    });
    middleBar.add(leftTextCol);

    leftTextCol.add(
      new Text({
        content: "Complete Bundle",
        fontSize: 0.04,
      }),
      new Text({
          content: "\nIncludes 12 Experiences",
          fontSize: 0.03,
      }),
      new Text({
        content: "\n\n\n\n            Total",
        fontSize: 0.04,
      })
    );

    let rightTextCol = new Block({
      width: width*0.25,
      height: height*0.7,
      backgroundOpacity: 0.0,
      padding: 0.1,
      alignContent: "right",
      justifyContent: "start",
      contentDirection: 'column',
    });
    middleBar.add(rightTextCol);

    let buyButton = new Block({
      height: 0.1,
      width: 0.2,
      backgroundColor: new Color('blue'),
      backgroundOpacity: 1.0,
      alignContent: "center",
      justifyContent: "center",
    }).add(
      new Text({
        content: "Buy",
        fontSize: 0.05,
      })
    );

    rightTextCol.add( 
      new Block({
        height: 0.4,
        width: 0.2,
        backgroundOpacity: 0.0,
        alignContent: "right",
        justifyContent: "start",
        contentDirection: 'column',
      }).add(
        new Text({
          content: "$9.99",
          fontSize: 0.04,
        }),
        new Text({
          content: "\n\n\n\n\n$9.99",
          fontSize: 0.04,
        })
      ),
      buyButton
    );

    return container;
  }
}