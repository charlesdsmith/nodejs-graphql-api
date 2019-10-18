const { Storage } = require('@google-cloud/storage');
const gcs = new Storage({
    projectId: 'inventoryapp-1516743070296',
    keyFilename: 'api/utilities/InventoryApp-78a9e4b83c04.json'
});

const bucketName = 'auction-app'
const bucket = gcs.bucket(bucketName);
const sharp = require('sharp');

const sizes = [[128,128, "medium"],[64, 64, "small"]]
const base64Image = "{\"title\":\"smileypic3.jpg\", \"src\":\"data:image/jpeg;base64,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\"}"
//var img = new Buffer(imageData, 'base64');

const resizer = async (base64Image) => {
    let parts = base64Image.split(';');
    let mimType = parts[0].split(':')[1];
    let src = mimType.split(',')[1]
    let imageData = parts[1].split(',')[1];
    var img = new Buffer.from(imageData, 'base64');
    const resizedPics = []
    
for (let index = 0; index < sizes.length; index++) {
    const size = sizes[index];
    //console.log("SIZE", size)
    await sharp(img)
          .resize(size[0], size[1])
          .toBuffer()
          .then(resizedImageBuffer => {let resizedImageData = resizedImageBuffer.toString('base64');  
          const fullTitle = mimType.split(',')[0].replace(/['"]+/g, '') // replace the quotes with empty strings
          const extension = "." + fullTitle.split('.')[1]
          const name = fullTitle.split('.')[0] + "_" + size[2]
          const fileName = '"' + name + extension + '"'
          let resizedBase64 = `{"title":${fileName},${src}:"data:image/jpeg;base64,${resizedImageData}"}`
        resizedPics.push(resizedBase64)
        }) 
}
        //console.log("RESIZED PICS", resizedPics)
        return resizedPics
    
    }

//resizer(base64Image)
module.exports = {resizer}
