import { UIBaseElement, UI_ELEMENT_SELECT_STATE } from "./UIBaseElement";
import { createButton } from '../functions/createItem';
import { Block } from "../../assets/three-mesh-ui";
import { Engine } from "../../ecs/classes/Engine";
import {createGallery} from '../components/GalleryPanel';
import {createBuyPanel} from '../components/BuyPanel';
import {createPlayPanel} from '../components/PlayPanel';
import {VideoPlayer} from '../components/VideoPlayer';
import {totalWidth, totalHeight, itemHeight, url, envUrl, videoUrl} from '../constants/Constant';
import {Control} from '../components/Control';

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
  control: Control;

  constructor() {
    super();

    this.init();
  }

  init() {
    // console.log(Engine.scene, Engine.entityMap, Engine.componentsMap);
    // Engine.scene.add;
    
    Engine.scene.children[10].visible = false;      //ground
    Engine.scene.children[12].visible = false;      //character

    let setPurchase = null;
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
    
    const play = createPlayPanel({
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
        this.control.visible = true;
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
    
    this.buyPanel.visible = false;
    this.preview.add(this.buyPanel);

    this.player = new VideoPlayer(this, envUrl);

    this.control = new Control({
      play:(played, paused)=>{
        this.player.playVideo(videoUrl, played, paused);
      },
      back:()=>{
        this.player.stopVideo();
        this.control.visible = false;
        this.library.visible = true;
      },
      seek:(time)=>{
        this.player.seek(time);
      }
    });
    this.add(this.control);

    this.player.control = this.control;

    this.control.visible = false;
  }
}