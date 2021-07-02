import { createItem, createCol, createRow, createButton, makeLeftItem } from '../functions/createItem';
import { Block } from "../../assets/three-mesh-ui";
import { UI_ELEMENT_SELECT_STATE } from '../classes/UIBaseElement'
import {totalWidth, totalHeight, itemWidth, itemHeight, gap, url} from '../constants/Constant';

export const createGallery = (param) => {
    const marketPlaceItemClickCB = param.marketPlaceItemClickCB;
    const libraryItemClickCB = param.libraryItemClickCB;

    let urlIndex = 0;

    const ov = createItem({
        title: "Scene Title",
        description: "Scene Description\nSecode line of description",
        imageUrl: url(urlIndex++),
        width: totalWidth,
        height: 0.8,
        selectable: true
    });
    ov.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, ()=>{
        marketPlaceItemClickCB(ov);
    });

    let cols = [];
    cols.push(ov);

    for (let j = 0; j < 2; j++) {
        const rows = [];
        for (let i = 0; i < 3; i++) {
            const panel = createItem({
                title: "Scene Title",
                description: "Scene Description",
                imageUrl: url(urlIndex++),
                width: itemWidth,
                height: itemHeight,
                selectable: true
            });
            rows.push(panel);

            panel.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, ()=>{
                marketPlaceItemClickCB(panel);
            });
        }
        cols.push(createRow(totalWidth, itemHeight, rows, gap));
    }

    const marketPlace = createCol(totalWidth, totalHeight, cols, gap);

    cols = [];
    for (let j = 0; j < 3; j++) {
        const rows = [];
        for (let i = 0; i < 3; i++) {
            const panel = createItem({
                title: "Scene Title",
                description: "Scene Description",
                imageUrl: url(urlIndex++),
                width: itemWidth,
                height: itemHeight,
                selectable: true
            });
            rows.push(panel);

            panel.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, ()=>{
                libraryItemClickCB(panel);
            });
        }
        cols.push(createRow(totalWidth, itemHeight, rows, gap));
    }

    const buttonHeight = 0.1;
    const dummy = new Block({
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
    }
}