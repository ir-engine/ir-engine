import { AudioLoader } from "three/src/loaders/AudioLoader";
import { Engine, PositionalAudio } from "../../ecs/classes/Engine";



const audioLoader = new AudioLoader();

const listener = Engine.audioListener;
// camera.add( listener );

//lists different audio video tracks to play
const soundList = ["/audio/SantaClauseJollyLaugh.mp3", "/audio/party-crowd-daniel_simon.mp3", "/audio/Outdoor-Festival-Crowd.mp3"];
// const videoList = [ "resources/jazz-video.mp4", "resources/piano-video.mp4", "resources/singing-bird.mp4", "resources/cicada.webm" ];

//uses audio video list and adds a screen in scene for each, works only for 4 tracks
for (let i = 0; i < soundList.length; i++) {

    const positionalAudio = new PositionalAudio(listener);
    audioLoader.load(soundList[i], (buffer) => {

        positionalAudio.setBuffer(buffer);
        positionalAudio.setRefDistance(20);
        positionalAudio.loop = true;
        positionalAudio.play();
        positionalAudio.setDirectionalCone(180, 230, 0.1);
        positionalAudio.position.y = 2;
        positionalAudio.position.z = 30;

        // const soundHelper = new PositionalAudioHelper( positionalAudio );
        // soundHelper.scale.set( 5, 5, 5 );
        // positionalAudio.add( soundHelper );

    });
}
