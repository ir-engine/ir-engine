exports.load = function (command: any) {
  command.videoCodec('libx264')
    .format('mp4')
    .outputOptions('-movflags frag_keyframe+empty_moov+faststart')
    .outputOptions('-crf 18')
}
