- Running the encoder

`cd three-volumetric/src/encoder`
`node SingleEncoder.js`

- In case there are import errors, install the esm library and run

`node -r esm SingleEncoder.js`

sample.drcs is created in three-volumetric/src/encoder/assets

- To decode this and convert to .drc
`node draco_nodejs_example.js`

sample_converted.drc file gets created. Currently it is 0 bytes and there is an issue in decoding the data