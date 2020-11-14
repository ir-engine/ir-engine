# Instruction to create .drcs
- Put .obj, .ply and .png into /assets/ folder
- Run
bash:
```
for FILE in *.ply; do ../corto $FILE; done
```
fish:
```
for file in *.ply
../corto $file
end
```
This will create .crt file for each .obj. Usually runs really fast. 1 minute for 3k frames;
- Run 
`node -r esm SingleEncoderCORTO.js`
This will create sequence in .drcs. Important: in the end of this file, there is number of frames and file names to be set. Good idea to try 50-100 frames first, to check its ok.
Approx time on my machine: 1 hour for 3k frames.


# Old instructions

- Running the encoder

`cd three-volumetric/src/encoder`
`node SingleEncoder.js`

- In case there are import errors, install the esm library and run


`node -r esm SingleEncoderCORTO.js`

sample.drcs is created in three-volumetric/src/encoder/assets

- To decode this and convert to .drc
`node draco_nodejs_example.js`

sample_converted.drc file gets created. Currently it is 0 bytes and there is an issue in decoding the data