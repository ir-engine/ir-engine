import { Block, Text } from "../../assets/three-mesh-ui";
import { TextureLoader, Color } from "three";

export const createItem = (param) =>{
    const title = param.title;
    const description = param.description;
    const imageUrl = param.imageUrl;
    const width = param.width;
    const height = param.height;

    let container = new Block({
      width: width,
      height: height,
      backgroundSize: 'cover',
      contentDirection: 'column',
      padding: 0.03,
      alignContent: 'left',
      justifyContent: 'end',
      fontFamily:
        "https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json",
      fontTexture:
        "https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png"
    });

    if(title){
      container.add(new Text({
        content: title + '\n',
        fontSize: 0.05,
      }));    
    }
      
    if(description){
      container.add(new Text({
        content: description,
        fontSize: 0.03,
      }));
    }

    const loader = new TextureLoader();
    loader.load(
          imageUrl,
          
          // onLoad callback
          (texture) => {
            container.set({backgroundTexture: texture});
          },

          // onProgress callback currently not supported
          undefined,

          // onError callback
          ( err ) => {
              console.error( 'An error happened.' );
          }
    );

    return container;
}

export const createRow = (width, height, elements, gap) => {
  let container = new Block({
    width: width,
    height: height,
    contentDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundOpacity: 0.0,
  });

  elements.forEach(element => {
    container.add(element);
    element.set({margin: gap});
  });

  return container;
}

export const createCol = (width, height, elements, gap) => {
  let container = new Block({
    width: width,
    height: height,
    contentDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundOpacity: 0.0,
  });

  elements.forEach(element => {
    container.add(element);
    element.set({margin: gap});
  });

  return container;
}

export const makeLeftItem = (param) => {
  const item = param.item;
  const containerWidth = param.containerWidth;
  const itemWidth = item.width;
  const itemHeight = item.height;

  let dummy = new Block({
    width: itemWidth,
    height: itemHeight,
    backgroundOpacity: 0.0,
  });
 
  let bar = createRow(containerWidth, itemHeight, [item, dummy], 0);
  bar.set({
    alignContent: 'center',
    justifyContent: 'start',
  });

  return bar;
}

export const makeRightItem = (param) => {
  const item = param.item;
  const containerWidth = param.containerWidth;
  const itemWidth = item.width;
  const itemHeight = item.height;

  let dummy = new Block({
    width: itemWidth,
    height: itemHeight,
    backgroundOpacity: 0.0,
  });
 
  let bar = createRow(containerWidth, itemHeight, [dummy, item], 0);
  bar.set({
    alignContent: 'center',
    justifyContent: 'end',
  });

  return bar;
}

export const createButton = (param) => {
  const title = param.title;

  let button = new Block({
    height: 0.1,
    width: 0.4,
    alignContent: "center",
    justifyContent: 'center',
    backgroundColor: new Color('blue'),
    backgroundOpacity: 1.0,
    fontFamily:
      "https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json",
    fontTexture:
      "https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png"
  }).add(
    new Text({
      content: title,
      fontSize: 0.05,
    })
  );

  makeSelectable(button);

  return button;
}

export const makeSelectable = (block) => {
  
  const hoveredStateAttributes = {
    state: "hovered",
    attributes: {
      // offset: 0.035,
      backgroundColor: new Color(0x999999),
      backgroundOpacity: 1,
      fontColor: new Color(0xffffff)
    },
  };

  const idleStateAttributes = {
    state: "idle",
    attributes: {
      // offset: 0.035,
      backgroundColor: new Color(0x666666),
      backgroundOpacity: 0.3,
      fontColor: new Color(0xffffff)
    },
  };

  const selectStateAttributes = {
    state: "selected",
    attributes: {
      // offset: 0.02,
      backgroundColor: new Color(0x777777),
      fontColor: new Color(0x222222)
    },
    onSet: () => {
      console.log('seleteced');
    }
  };

  block.setupState(hoveredStateAttributes);
  block.setupState(idleStateAttributes);
  block.setupState(selectStateAttributes);

  block.setSelectState = (state) => {
    block.dispatchEvent({ type: state });
    block.setState(state);
  }
}