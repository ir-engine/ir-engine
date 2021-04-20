import { Object3D, Color, TextureLoader, VideoTexture, Mesh, SphereGeometry, MeshBasicMaterial, BackSide } from "three";
import { UIOverview } from "./UIOverview";
import { UIPanel } from './UIPanel';
import { UIButton } from "./UIButton";
import { UIBaseElement, UI_ELEMENT_SELECT_STATE } from "./UIBaseElement";
import {createItem, createCol, createRow, createButton, makeLeftItem} from '../functions/createItem';
import { Block, Text } from "../../assets/three-mesh-ui";
import { Engine } from "../../ecs/classes/Engine";
import {createGallery} from '../components/GalleryPanel';
import {createBuyPanel} from '../components/BuyPanel';
import {createPlayPanel} from '../components/PlayPanel';
import {VideoPlayer} from '../components/VideoPlayer';
import {totalWidth, totalHeight, itemWidth, itemHeight, gap, url, envUrl, videoUrl} from '../constants/Constant';
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
  isPurchase: Boolean;
  player: VideoPlayer;

  constructor() {
    super();

    this.init();
  }

  init() {
    // console.log(Engine.scene, Engine.entityMap, Engine.componentsMap);
    // Engine.scene.add;
    
    Engine.scene.children[10].visible = false;      //ground
    Engine.scene.children[12].visible = false;      //character

    // const url = "360/ITN_Wrecks_FOR_REVIEW_4kx2k_360_h264_40Mbps.mp4";
    // const videoElement = new VideoElement(3.2, 0.8, 0.1, 1.35, url);
    let setPurchase;

    const marketPlaceItemClickCB = (panel) => {
      if(this.purchasePanel){
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
      if(this.purchasePanel){
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
      libraryItemClickCB: libraryItemClickCB
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
    })

    this.buttonLibrary.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      this.library.visible = true;
      this.marketPlace.visible = false;
    })

    this.library.visible = false;
    this.position.set(0, 1, 0);
    this.rotation.y = Math.PI;
    
    let play = createPlayPanel({
      width: totalWidth,
      height: itemHeight*2.5,
      backCB: () => {
        this.purchasePanel.visible = false;
        this.oldPanel.visible = true;
        this.buttonMarket.visible = true;
        this.buttonLibrary.visible = true;
        this.buyPanel.visible = false;
      },
      playCB: () => {
        this.purchasePanel.visible = false;
        this.player.playVideo(videoUrl);
      },
      purchaseCB: () => {
        if (this.isPurchase){
          this.buyPanel.visible = true;
        }
        else{

        }
      }
    });
    
    this.preview = play.preview;
    this.purchasePanel = play.panel;
    setPurchase = play.setPurchase;
    this.purchasePanel.visible = false;

    this.add(this.purchasePanel);

    this.buyPanel = createBuyPanel({
        width: totalWidth*0.5,
        height: totalHeight*0.5,
        thumbnailUrls: [url(0), url(1), url(2), url(3), url(4), url(5)]
    });
    // this.add(this.buyPanel);
    // this.buyPanel.position.set(0, 0, 0.1);
    this.buyPanel.visible = false;
    this.preview.add(this.buyPanel);

    this.player = new VideoPlayer(this, envUrl);
  }
}