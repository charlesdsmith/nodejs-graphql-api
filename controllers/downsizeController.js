/* globals exports, require */
//jshint strict: false
//jshint esversion: 6
"use strict";

const crc32 = require("fast-crc32c");
const gcs = require("@google-cloud/storage")();
const imagemagick = require("imagemagick-stream");

const root = "[[REPLACE: ${ROOT}]]";
// const bucketName = {
//     src: `${root}-trigger`,
//     dst: `${root}-thumbnails`
//  };

 const bucketName = 'auction-app'

const srcBucket = gcs.bucket(bucketName.src);
const dstBucket = gcs.bucket(bucketName.dst);

const sizes = ["256x256","128x128","64x64"];

exports.thumbnail = (event, callback) => {
    const file = event.data;
    const pictures = JSON.parse(event.pictures)
    let auc_id = event.auc_id
    const srcFilename = auc_id + '-' + pictures.title
    
    //console.log(`Processing Original: gs://${bucketName.src}/${srcFilename}`);

    //const gcsSrcObject = srcBucket.file(srcFilename);
    
    Promise.all(sizes.map((size) => {

        let dstFilename = `${srcFilename}_${size}`;
        let gcsDstObject = dstBucket.file(dstFilename);
    
        console.log(`Thumbnail ${size}: gs://${bucketName}/${dstFilename}`);
    
        //let srcStream = gcsSrcObject.createReadStream();
        let dstStream = gcsDstObject.createWriteStream();
        
        let resize = imagemagick().resize(size).quality(90);
        // may have to already upload the picture to gcloud in order to put in resize object
        
        console.log("Pipe");
        srcStream.pipe(resize).pipe(dstStream);
    
        return new Promise((resolve, reject) => {
            dstStream
            .on("error", (err) => {
                console.log(`Error: ${err}`);
                reject(err);
            })
            .on("finish", () => {
                console.log(`Success: ${srcFilename} → ${dstFilename}`);
                resolve();
            });
        });
    })).then(function() {
        console.log("All successful");
        callback();
    }).catch(function(err) {
        console.log("At least one failure");
        callback(err);
    });
};