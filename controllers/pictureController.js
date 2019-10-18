
// const Picture = require('../models/Picture')
// const express = require('express');
// const User = require('../models/User');


const { Storage } = require('@google-cloud/storage');
const gcs = new Storage({
    projectId: 'inventoryapp-1516743070296',
    keyFilename: 'api/utilities/InventoryApp-78a9e4b83c04.json'
});

const bucketName = 'auction-app'
const bucket = gcs.bucket(bucketName);


const PictureController = () => {


    const GetManyPictures = (req, res) => {

        console.log({ query: req.query })
        const range = JSON.parse(req.query.range)
        const page = range[0]
        const limit = range[1]
        const offset = limit * (page - 1)
        let where = JSON.parse(req.query.filter)
        const order = [JSON.parse(`[${req.query.sort}]`) || ['id', 'DESC']]

        if (where.auc_id) {
            where = { auc_id: { $ilike: `%${where.auc_id}%` } }
        }
        return Picture.findAndCountAll({ limit, offset, where, order })
            .then(data => { return res.status(200).json({ data: data.rows, total: data.count }) })
            .catch(err => { console.log(err); return res.status(500).json({ msg: 'Internal server error.' }) })

    }

    const getAllPicturesByauc_id = (req, res) => {

        let lastSixauc_id = req.params.lastSixauc_id
        let order = [['id', 'DESC']]
        console.log(req.params.lastSixauc_id)
        let where = { auc_id: { $ilike: `%${lastSixauc_id}` } }
        return Picture.findAndCountAll({ where, order })
            .then(data => { return res.status(200).json({ data: data.rows, total: data.count }) })
            .catch(err => { console.log(err); return res.status(500).json({ msg: 'Internal server error.' }) })
    }

    const GetOnePicture = (req, res) => {
        console.log(req.params.id)

        return Picture.find({
            where: { id: req.params.id },
            include: [{ model: User, as: 'User' }],
        })
            .then(data => { return res.status(200).json({ data }) })
            .catch(err => {
                console.log(err);
                return res.status(500).json({ msg: 'Internal server error' })
            })
    }



    /*  Expects JSON in form of:
      { pictures: [
          {src:'' ,title:''}
        ] ,
        auc_id:'',       
        authentication_id:'',
       }
      Array holds Pictures objects in the format found in single create
  */
    const BulkCreatePicture = (req, res) => {
        // vin to auc_id and filename to picture angle
        //console.log("MULT PICS", req.pictures)
        //const body = req.body
        //console.log("REQ PICS2", req)
        const pictures = req
        
        let auc_id = pictures.auc_id
        // let comment = body.comment
        let title = pictures.title
        // let purpose = body.purpose
        // let user_id = body.user_id



        let extraData = { auc_id, title }

        let results = []

        // IMPORTANT: This has to be done sequentially, don't use Promise.all
        // b/c vin needs to be checked for uniqueness
        return sequentialCreate(pictures, extraData, results)
            .then((data) => {console.log(data); return data})
            .catch(err => {
                console.log(err);
                return false
            })
    }

    const sequentialCreate = (pictures, extraData, results) => {
        //console.log("REDUCE PICS4", pictures)
        return pictures.pictures.reduce((promise, currentPicture) => {
            var currentPicture = {pictures: currentPicture, auc_id: pictures.auc_id}
            //console.log("CURRENT PIC2", currentPicture)
            //var pictures = pictures.toString()
            //console.log("PIC STRING", pictures)
            return promise
                .then(async () => 
                await CreatePicture(currentPicture, extraData)
                    .then(result => {return result}))
                .catch(console.error)
        }, Promise.resolve())
    }

    const CreatePicture = async (onePicture, extraData) => {
        //console.log("PIC PARSE TEST",onePicture)
        //onePicture = JSON.parse(onePicture)
        const body = onePicture
        //console.log("PICTURES PICTURES", onePicture.pictures)
        const pictures = JSON.parse(onePicture.pictures)
        //console.log("PICS", body)
        let auc_id = onePicture.auc_id
        //console.log("AUC", auc_id)

        // console.log("ONE PICTURE13", onePicture)
        // let {auc_id, title } = extraData
        let base64Data = pictures.src.replace(/^data:image\/(\w+);base64,/, "");
        // const extension = pictures.title.split('.')[1]
        const randomNum = Math.floor(Math.random() * Math.floor(10000))
        const fileName = auc_id + '-' + pictures.title // + '.' + extension
        let fs = require("fs")
        await fs.writeFileSync(fileName, base64Data, 'base64', function (err) { console.log(err); });
        
        // Uploads a local file to the bucket
        const uploadPic = await bucket.upload(fileName, {
            // Support for HTTP requests made with `Accept-Encoding: gzip`
            destination: auc_id + '/' + fileName,
            gzip: true,
            metadata: {
                // Enable long-lived HTTP caching headers
                // Use only if the contents of the file will never change
                // (If the contents will change, use cacheControl: 'no-cache')
                upload_time: new Date(),
                cacheControl: 'public, max-age=31536001',
            },
            public: true,
        },).then((data) => {return true})
        .catch(err => {return null});
        await fs.unlinkSync(fileName, function (err) { console.log(err); });
        
        
        let picDataForDB = {
            auc_id,
            url: 'https://storage.googleapis.com/' + bucketName + '/' + auc_id + '/' + fileName,
            upload_time: new Date(),
        }

        // return Picture.create(picDataForDB)
        //     .then()
        //     .catch(err => { console.log(err); });
        return uploadPic
    }

    const getPicturesFromCloud = async (auc_id) => {
        // retrieve the link URLs for the car's pictures
        const options = {
            prefix: auc_id, // allows for looking in certain folders
          };

        const [files] = await bucket.getFiles({prefix: auc_id})

        //console.log("GOOGLE files", files)
        const fileUrls = []

        for (file=0; file < files.length; file++){
            
            fileUrls.push(files[file].name) // add the name of each file to the array
        }
        
        return fileUrls
    }
    return {
        BulkCreatePicture,
        GetManyPictures,
        getAllPicturesByauc_id,
        GetOnePicture,
        CreatePicture,
        getPicturesFromCloud
    }

}

module.exports = PictureController
