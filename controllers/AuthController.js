const jwt = require('express-jwt')
//const { generateKeyPair } = require('crypto');

var prime_length = 60;

const Creds = require('../../models/Credential');
const User = require('../../models/User')

var RSAKey = require('react-native-rsa');
const bits = 1024;
const exponent = '10001'; // must be a string


//getPublicString/getPrivateString creates publicKey/privateKey
//setPublicString and setPrivateString declares the public or private key for encypting or decrypting

 const AuthController = () => {
     console.log("hello")
     const checkUsername = (req, res) => {
         console.log(req)
         var rsa = new RSAKey();
         var r = rsa.generate(bits, exponent);
         var publicKey = rsa.getPublicString(); // return json encoded string
         var privateKey = rsa.getPrivateString(); // return json encoded string
         var user_email = req.body.email
         return Creds.update({private_key:privateKey,},
            {
             where: {
                user_email: user_email,
             }
         }).then((data) => {console.log(data);
            if (data[0] == 0){
                return res.status(403).json({message:"That account does not exist"})
            }
            else {
                return res.status(200).json({data, publicKey})
            }
        })
     }
    return {
        checkUsername,
    }
}

module.exports = AuthController;