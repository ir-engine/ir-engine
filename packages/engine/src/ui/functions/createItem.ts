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
    }).add(
      new Text({
        content: title + '\n',
        fontSize: 0.05,
      }),
      new Text({
        content: description,
        fontSize: 0.03,
      })
    );

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

  return button;
}