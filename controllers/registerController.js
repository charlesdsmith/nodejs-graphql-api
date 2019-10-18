const Creds = require('../../models/Credential');
const RSAKey = require('react-native-rsa');
const rsa = new RSAKey();
const getPublicKey = require('../requests')
const jwt = require('jsonwebtoken')
const ejwt = require('express-jwt')
const secretKey = require('secret-key');
const keygen = require("keygenerator");
const User = require('../../models/User');

// check database for private key related to user then retrieve and use it to decrypt password

const registerController = () => {
    const returnPublicKey = (req, res) => { 
        console.log("BODY TEXT----: ", req.body)
        var public_email = req.headers.user // should be 'public@gsm.com'

        Creds.findAll({where: { // use email to lookup public key
            user_email:public_email,
        }
        }).then(data => {
            publicKey = data[0].dataValues.static_public // retrieve public key
            console.log("PUBLIC KEY ", publicKey)
            return res.status(200).json({public_key: publicKey})
            }).catch((err) => {
                console.log(err);
                return res.status(403).json({message: "You are unauthorized to access this endpoint"})
            })
    }; 

    const createAccount = (req, res) => {
        console.log("BODY TEXT----: ", req.body)
        
        var email = req.body.email
        var password = req.body.password
        var public_email = req.headers.user
        var company_name = req.body.company_name
        var name = req.body.name
        var address = req.body.address
        var phone_number = req.body.phone_number


        Creds.findOne({where: {
            user_email:public_email
        }}).then(data => {
            privateKey = data.dataValues.static_private // retrieve the static private key
            rsa.setPrivateString(privateKey)
            var decrypted_password = rsa.decrypt(password) // decrypt the password sent by the user
            console.log("DECRYPTED PASSWORD", decrypted_password)
            return decrypted_password
        }).then(decrypted_password => {
            User.create({email:email, password_hash:decrypted_password, name:name, company_name:company_name, address:address, phone_number:phone_number}).then(data => {
                console.log("NEW USER DATA", data)
                Creds.create({user_email:email, password_hash:decrypted_password, credential_id:data.dataValues.user_id}).then(data => {
                    res.status(201).json({message: "Account created"})}).catch(err => res.status(400).json({message: "That account already exists!"}))
            })
            
            // .catch(err => res.status(400).json({message: "That account already exists!"}))
        })
    } 
    return {
        returnPublicKey, createAccount
    }
}

module.exports = registerController;

// { Creds.create({user_email:email, password_hash:decrypted_password}).then(data => {
    //res.status(201).json({message: "Account created"})}).catch(err => res.status(503).json({message: err}))})