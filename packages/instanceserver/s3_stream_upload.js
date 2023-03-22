import { CreateMultipartUploadCommand, UploadPartCommand, S3Client, CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import {IncomingForm} from "formidable";
const fs = require('fs');
const s3 = new S3Client({ region: 'us-west-2' })
const path = require("path");



const initParams = {
  Key: S3_KEY,
  Bucket: S3_BUCKET_NAME,
};

// Initiate the multipart upload
async function initiateMultipartUpload() {
  try {
    await s3.send(new CreateMultipartUploadCommand(initParams));
  } catch (err) {
    console.log(err);
  }
}

// upload parts of the file once at a time. 
async function UploadPart(body, UploadId, partNumber) {
  const partParams = {
    ...initParams,
    Body: body,
    UploadId: UploadId,
    PartNumber: partNumber,
  };
  return new Promise(async (resolve, reject) => {
    try {
      let part = await s3.send(new UploadPartCommand(partParams));
      resolve({ PartNumber: partNumber, ETag: part.ETag });
    } catch (error) {
      reject({ partNumber, error });
    }
  });
}

const form = new IncomingForm({ multiples: true });


form.parse(req, async (err, fields) => {
    const files = './files/*'
  const key = path.join(
    "customstream/",
    String(files.payload?.newFilename).trim() +
      "_" +
      path
        .basename(String(files.payload?.originalFilename).trim())
        .replace(/ /gi, "_")
  );

  const file = fs.readFileSync(files.payload?.filepath); // file to upload

  const fileSize = files.payload?.size; // total size of file
  const chunkSize = 1024 * 1024 * 5; // 5MB defined as each parts size
  const numParts = Math.ceil(fileSize / chunkSize); // number of parts based on the chunkSize specified
  const promise = []; // array to hold each async upload call
  const slicedData = []; // array to contain our sliced data
  let Parts = []; //  to hold all Promise.allSettled resolve and reject response
  let MP_UPLOAD_ID = null; // contain the upload ID to use for all processes
  let FailedUploads = []; // array to populate failed upload
  let CompletedParts = []; //array to hold all completed upload even from retry upload as will be seen later
  try {
    //Initialize multipart upload to S3
    const initResponse = await initiateMultipartUpload(); // in real life senerio handle error with an if_else
    MP_UPLOAD_ID = initResponse["UploadId"];

    //Array to create upload objects for promise
    for (let index = 1; index <= numParts; index++) {
      let start = (index - 1) * chunkSize;
      let end = index * chunkSize;

      promise.push(
        uploadPart(
          index < numParts ? file.slice(start, end) : file.slice(start),
          MP_UPLOAD_ID,
          index,
          key
        )
      );

      slicedData.push({
        PartNumber: index,
        buffer: Buffer.from(file.slice(start, end + 1)),
      });
    }

    // promise to upload
    Parts = await Promise.allSettled(promise);

    //check if any upload failed
    FailedUploads = Parts.filter((f) => f.status == "rejected");
  } catch (error) {
    // Handle error 
    try {
      if (!FailedUploads.length) {
        for (let i = 0; i < FailedUploads.length; i++) {
          let [data] = slicedData.filter(
            (f) => f.PartNumber == FailedUploads[i].value.PartNumber
          );
          let s = await uploadPart(
            data.buffer,
            MP_UPLOAD_ID,
            data.PartNumber,
            key
          );
          RetryPromise.push(s);
        }
      }

      CompletedParts = Parts.map((m) => m.value);
      CompletedParts.push(...RetryPromise);
    } catch (error) {
      // handle error
      await cancelMultipartUpload(initParams);
    }
  }
});

const s3ParamsComplete = {
  ...initParams,
  UploadId: MP_UPLOAD_ID,
  MultipartUpload: {
    Parts: CompletedParts,
  },
};

// complete the multipart upload
const result = await s3.send(
  new CompleteMultipartUploadCommand(s3ParamsComplete)
);
