import { Color, TextureLoader } from "three";
import { Block, Text } from "../../assets/three-mesh-ui";

export const createBuyPanel = (param) => {
    const width = param.width;
    const height = param.height;
    const urls = param.thumbnailUrls;

    const container = new Block({
      width: width,
      height: height,
      fontFamily: "https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json",
      fontTexture: "https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png",
      backgroundOpacity: 1.0,
    });

    const topBar = new Block({
      width: width,
      height: 0.2,
      backgroundOpacity: 0.0,
      contentDirection: 'row'
    });
    container.add(topBar);
    
    const closeButton = new Block({
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

    const title = new Block({
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
    
    const middleBar = new Block({
      width: width,
      height: height*0.7,
      backgroundOpacity: 0.0,
      contentDirection: 'row'
    });
    container.add(middleBar);

    const leftBar = new Block({
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
    const overview = new Block({
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
      
    const thumbBar = new Block({
      width: thumbWidth,
      height: thumbWidth/6*0.6,
      backgroundOpacity: 0.0,
      contentDirection: 'row',
      alignContent: "center",
      margin: 0.005,
    });
    leftBar.add(thumbBar);  
  
    urls.forEach(u => {
        const subitem = new Block({
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

    const leftTextCol = new Block({
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

    const rightTextCol = new Block({
      width: width*0.25,
      height: height*0.7,
      backgroundOpacity: 0.0,
      padding: 0.1,
      alignContent: "right",
      justifyContent: "start",
      contentDirection: 'column',
    });
    middleBar.add(rightTextCol);

    const buyButton = new Block({
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