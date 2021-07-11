import { Block, Text } from '../../assets/three-mesh-ui'
import { TextureLoader, Color } from 'three'

class PurchaseElement {
  constructor(param) {
    this.init(param)
  }

  init(param) {
    const width = param.width
    const height = param.height
    const root = param.root
    const urls = param.thumbnailUrls

    const container = new Block({
      width: width,
      height: height
    })
    root.add(container)
    container.position.set(0, height, 0)

    const topBar = new Block({
      width: width,
      height: 0.2,
      backgroundColor: new Color('green'),
      // backgroundOpacity: 0.0,
      contentDirection: 'row'
    })
    container.add(topBar)

    const closeButton = new Block({
      height: 0.1,
      width: 0.1,
      margin: 0,
      padding: 0.01,
      // fontSize: 0.025,
      alignContent: 'center',
      backgroundColor: new Color('blue'),
      // backgroundOpacity: 0.0,

      fontFamily: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json',
      fontTexture: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png'
    }).add(
      new Text({
        content: 'x',
        fontSize: 0.05
        // fontColor: new THREE.Color(0x96ffba)
      })
    )
    topBar.add(closeButton)

    const title = new Block({
      height: 0.2,
      width: width - 0.2,
      margin: 0,
      padding: 0.07,
      alignContent: 'center',
      backgroundColor: new Color('red'),
      // backgroundOpacity: 0.0,

      fontFamily: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json',
      fontTexture: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png'
    }).add(
      new Text({
        content: 'This video is part of the ',
        fontSize: 0.05
        // fontColor: new THREE.Color(0x96ffba)
      }),
      new Text({
        content: 'Oceania 2021',
        fontSize: 0.07
        // fontColor: new THREE.Color(0x96ffba)
      }),
      new Text({
        content: ' Bundle.',
        fontSize: 0.05
        // fontColor: new THREE.Color(0x96ffba)
      })
    )
    topBar.add(title)

    const middleBar = new Block({
      width: width,
      height: height * 0.7,
      backgroundColor: new Color('blue'),
      // backgroundOpacity: 0.0,
      contentDirection: 'row'
    })
    container.add(middleBar)

    const leftBar = new Block({
      width: width * 0.4 * 1.2,
      height: height * 0.7,
      backgroundColor: new Color('red'),
      // backgroundOpacity: 0.0,
      // padding: 0.1,
      // margin: 0.1,
      alignContent: 'center',
      contentDirection: 'column'
    })
    middleBar.add(leftBar)

    const thumbWidth = width * 0.4 * 0.8
    const overview = new Block({
      width: thumbWidth + 6 * 0.01,
      height: thumbWidth * 0.6,
      backgroundSize: 'cover',
      contentDirection: 'row',
      margin: 0.01,
      alignContent: 'top'
    }) //contain, cover, stretch

    const loader = new TextureLoader()
    loader.load(urls[0], (texture) => {
      overview.set({ backgroundTexture: texture })
    })

    leftBar.add(overview)

    const thumbBar = new Block({
      width: thumbWidth,
      height: (thumbWidth / 6) * 0.6,
      backgroundColor: new Color('red'),
      // backgroundOpacity: 0.0,
      contentDirection: 'row',
      alignContent: 'bottom'
    })
    leftBar.add(thumbBar)

    urls.forEach((u) => {
      const subitem = new Block({
        width: thumbWidth / 6,
        height: (thumbWidth / 6) * 0.6,
        backgroundSize: 'cover',
        margin: 0.005,
        padding: 0
      }) //contain, cover, stretch

      loader.load(u, (texture) => {
        subitem.set({ backgroundTexture: texture })
      })

      thumbBar.add(subitem)
    })

    const description = new Block({
      height: 0.5,
      width: 1,
      margin: 0,
      padding: 0.03,
      fontSize: 0.025,
      alignContent: 'center',
      // backgroundColor: new Color('blue'),
      backgroundOpacity: 0.0,

      fontFamily: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json',
      fontTexture: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png'
    }).add(
      new Text({
        content: 'Complete Bundle',
        fontSize: 0.04
        // fontColor: new THREE.Color(0x96ffba)
      }),
      new Text({
        content: '\nIncludes 12 Experiences',
        fontSize: 0.02
        // fontColor: new THREE.Color(0x96ffba)
      })
    )
    container.add(description)

    const price1 = new Block({
      height: 0.5,
      width: 1,
      margin: 0,
      padding: 0.03,
      fontSize: 0.025,
      alignContent: 'center',
      // backgroundColor: new Color('blue'),
      backgroundOpacity: 0.0,

      fontFamily: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json',
      fontTexture: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png'
    }).add(
      new Text({
        content: '$9.99',
        fontSize: 0.04
        // fontColor: new THREE.Color(0x96ffba)
      })
    )
    container.add(price1)

    const total = new Block({
      height: 0.5,
      width: 1,
      margin: 0,
      padding: 0.03,
      fontSize: 0.025,
      alignContent: 'center',
      // backgroundColor: new Color('blue'),
      backgroundOpacity: 0.0,

      fontFamily: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json',
      fontTexture: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png'
    }).add(
      new Text({
        content: 'Total',
        fontSize: 0.04
        // fontColor: new THREE.Color(0x96ffba)
      })
    )
    container.add(total)

    const price2 = new Block({
      height: 0.5,
      width: 1,
      margin: 0,
      padding: 0.03,
      fontSize: 0.025,
      alignContent: 'center',
      // backgroundColor: new Color('blue'),
      backgroundOpacity: 0.0,

      fontFamily: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json',
      fontTexture: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png'
    }).add(
      new Text({
        content: '$9.99',
        fontSize: 0.04
        // fontColor: new THREE.Color(0x96ffba)
      })
    )
    container.add(price2)

    const buyButton = new Block({
      height: 0.1,
      width: 0.4,
      margin: 0,
      padding: 0.03,
      fontSize: 0.025,
      alignContent: 'center',
      backgroundColor: new Color('blue'),
      backgroundOpacity: 1.0,

      fontFamily: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json',
      fontTexture: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png'
    }).add(
      new Text({
        content: 'Buy',
        fontSize: 0.05
        // fontColor: new THREE.Color(0x96ffba)
      })
    )
    container.add(buyButton)
  }
}

export default PurchaseElement
