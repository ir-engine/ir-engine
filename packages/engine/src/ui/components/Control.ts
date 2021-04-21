import { Block } from '../../assets/three-mesh-ui';
import { createButton, createItem } from '../functions/createItem';

export const createSeekbar = () => {
    let bar = new Block({
      height: 0.5,
      width: 0.2,
      alignContent: "center",
      justifyContent: 'center',
    });

    let backButton = createButton({
      title: "Library"
    });

    let playButton = createItem({
      title: null,
      description: null,
      imageUrl: "360/playbtn.png",
      width: 0.1,
      height: 0.1,
      selectable: true
    });

    bar.add(backButton, playButton);
    return bar;
  }