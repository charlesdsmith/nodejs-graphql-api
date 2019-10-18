/**
 * third party libraries
 */
require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const http = require('http');
const mapRoutes = require('express-routes-mapper');
const cors = require('cors');
var graphqlHTTP = require('express-graphql');

const fetch = require('node-fetch');
const connection = require('../config/connection');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express')
const { makeExecutableSchema } = require("graphql-tools");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { execute, subscribe } = require("graphql");
const { PostgresPubSub } = require("graphql-postgres-subscriptions");
const root = require('./schema')
const ejwt = require('express-jwt')
const authorize = require('../api/controllers/AuthController')
const login = require('../api/controllers/LoginController')
const logout = require('../api/controllers/LogoutController')
const registerAuth = require('../api/controllers/registerController')
const pictureUpload = require('../api/controllers/pictureController')
const Creds = require('../models/Credential')
const router = express.Router();
const jwt = require('jsonwebtoken');
const {Server, createServer} = require('http')
const {schema} = require ('./schema');
const RSAKey = require('react-native-rsa');
const rsa = new RSAKey();
var nodemailer = require('nodemailer')

// // graphql
// const pubsub = new PostgresPubSub({
//   user: connection.production.username,
//   host: connection.production.host,
//   database: connection.production.database,
//   password: connection.production.password,
//   port: 5432
// });

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

const typeDefs = `
  type Bid { amount: Int!, createdAt: String!, bid_id: Int! }
  type Query {
    bids(bid_id: Int): Bid
    allBids: [Bid]
  }
  type Mutation { addBid(amount: Int!, createdAt: String!): Int }
  type Subscription { bidAdded: Bid }
`;


/**
 * server configuration
 */
const config = require('../config/');
const dbService = require('./services/db.service');
const auth = require('./policies/auth.policy');

// environment: development, staging, testing, production
const environment = process.env.NODE_ENV;
/**
 * express application
 */

function loggingMiddleware(req, res, next) {
  console.log('ip:', req.ip);
  next();
}
const app = express();
app.use(loggingMiddleware);
const server = http.Server(app);
const DB = dbService(environment, config.migrate).start();

// allow cross origin requests
// configure to only allow requests from certain origins
app.use(cors());

// secure express app
app.use(helmet({
  dnsPrefetchControl: false,
  frameguard: false,
  ieNoOpen: false,
}));

/*const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});*/


// parsing the request bodys
app.use(bodyParser.urlencoded({ limit:'5mb', extended: false }));
app.use(bodyParser.json({ limit:'5mb'}));

//authentication endpoints
app.post('/authentication', authorize().checkUsername) // stores private key and responds with public key
app.post('/login', login().decrypt) // decrypts password
app.post('/logout',logout().logout)
app.post('/register/auth', registerAuth().returnPublicKey)
app.post('/register/create', registerAuth().createAccount)

// upload pictures
// app.post('/upload-picture', pictureUpload().GetManyPictures)


//change password endpoint
app.post('/change-password', (req, res) => {
  const decrypt = () => { 
    var email = req.body.email
    var old_password = req.body.oldPassword
    var new_password = req.body.newPassword
    console.log("PWD",old_password)
    
    Creds.findAll({where: { // use email to lookup private key
        user_email:email,
    }
    }).then(data => {
        privateKey = data[0].dataValues.private_key // retrieve private key
        rsa.setPrivateString(privateKey)
        console.log("PASSWORD BEFORE DECRYPTION: ", old_password)
        var decrypted = rsa.decrypt(old_password) // decrypt the password that was retrieved
        
        decrypted_password = decrypted
        console.log("PASSWORD AFTER DECRYPTION: ", decrypted)
        return decrypted_password
        }).then((decrypted_password) =>  {
          console.log("HERE")
            return Creds.findOne({where: {
            user_email:email,
            password_hash: decrypted_password
    }}).then(data => {
      var decryptedNewPwd = rsa.decrypt(new_password)
        console.log("DATA:", decryptedNewPwd)
        if (data == null){ // check to see if the user email and password are in the database
            return res.status(401).json({message: "That account does not exist" })
        }
        else  { 
            email = data.dataValues.user_email
            // store the secret key and the notification token in the database for the user
            return Creds.update({password_hash: decryptedNewPwd},
                { where: {
                user_email: email,
            }})
            .then(data => { return res.status(201).json({message:"Password has been successfully changed!" })})
          }
      })
    }).catch(err => console.log(err, "HEELO")) 
}
return decrypt()
})
// reset password endpoints
app.set('view engine','ejs');

// make another endpoint for storing the token and six-digit code in the DB row for the email sent by user
// email the user the URL (email+token)

app.post('/reset-password', (req, res) => {
  console.log("HEEERRREE")
  let email = req.body.user // store the token and code for this user account
  const token = email + Date.now() + Math.random().toString(36).substr(2)
  const url = "https://gsmauctionapp.herokuapp.com/reset-token?token=" + token
  const new_code = Math.ceil(Math.random() * (900000 - 100000) + 100000)

  let transporter = nodemailer.createTransport({
    host: "secure.emailsrvr.com",
    port: 465,
    auth: {
      user: "server@germanstarmotors.ca",
      pass: "R3s34rch&"
    }
    })
  
  
  var Message = {
    from: '"German Star Motors" <server@germanstarmotors.ca>',
    to: `${email}`, // send to users email
    subject: 'Password Reset Link',
    text: `Click this link to reset your password: ${url}`,
    html: `Click this link to reset your password: ${url} and enter the code: ${new_code}`
  };
  
  Creds.update({
    resetToken: token,
    code: new_code
    }, {where:{
      user_email:email
    }}).then((data) => { 
      transporter.sendMail(Message, (err, info) => {
      if(err){
          console.log(err)
          // return res.status(500).json({message:"Internal server error!"})
      }})
      return res.status(200).json({message: "token and code stored succesfully"})})
    .catch((err => res.status(401).json({message: "failed to store token and code for that user"})))


  // for testing make sure the token and code are the same as in the database

})
// get the webpage where you enter the new password and six-digit number
// also respond with public key when they visit this page
// use the token to create new key-pair for that account
app.post('/reset-form', (req, res) => {
    console.log(req.query)
    //let token = req.query.token || 'noToken';
    //res.sendFile(path.join(__dirname, './', 'reset.html'));
    const code = req.body.code
    const token = req.query.token
    const bits = 1024;
    const exponent = '10001'; // must be a string

    // create key-pair
    rsa.generate(bits, exponent)
    const publicKey = rsa.getPublicString()
    const privateKey = rsa.getPrivateString() // create new key-pair

    // check the token/code and return the public key
    Creds.findOne({
      where: {
        resetToken: token,
        code: code
    }}).then(data => { if (data == null){
      console.log('INCORRECT CODE')
      res.status(401).json({message: "Incorrect code"})
    } else {
      // if a match is found store new private key
      Creds.update({private_key:privateKey,},
        {where: {resetToken: token,}}).then((data) => { 
       res.status(200).json({data, publicKey})})
       .then(Creds.update({code: ''},
       {where:{resetToken: token}}
       )) // after the public is delivered to the user set the code to an empty string
       .catch((err) => { // respond with a public key to encrypt password with
        return res.status(500).json({message: "Internal Server Error!!!"})
      }) }
    } 
    )})

// use the token to look up the email and compare 
// the six digit code to the one sent in the form
// then create new password

app.post('/password/:token', function (req, res) {
    console.log("params:",req.params.token);
    console.log('req',req.body);
    res.send('Got a POST request');

    // get the 7-digit code
    //const code = req.body.code
    const token = req.params.token
    
    // make sure the account with the same token and code exists

    Creds.findOne({
      where: {
        resetToken: token,
    }}).then(data => { // after the account is found decrypt the new password and store it
      privateKey = data.dataValues.private_key // retrieve private key
      const password = req.body.password
      rsa.setPrivateString(privateKey)
      console.log("PASSWORD BEFORE DECRYPTION: ", password)
      var decrypted = rsa.decrypt(password) // decrypt the password that was retrieved
      const decrypted_password = decrypted
      console.log("PASSWORD AFTER DECRYPTION: ", decrypted)
      return decrypted_password
      }).then(decrypted_password => { // update with the new password for the account with the provided token
        Creds.update({password_hash:decrypted_password}, {where:{resetToken:token}})
        .then(data => res.status(201).json({message:true}))
        .then(Creds.update({resetToken:''}, {where: {resetToken:resetToken}})) // after the pwd is changed set the resetToken to an empty string
        .catch(err => res.status(500).json({message: "Internal Server Error"}))
    })
})
// app.listen(port, () => console.log(`Example app listening on port ${port}!`))


//helper function to verify requests with JWT
const jwtVerify = async (name, secret, callback) => {
  // try removing asyncronous
 let verification = await jwt.verify(name, secret, (err, data) => {

    if(err){
      callback(status=false)
    } else {
      console.log("THIS SUCCESS", data)
      callback(status=true, data=data)
    }
  })
}

// protected route
app.post('/test', async (req, res) => {

  // retrieve the secret key from the user's record in the DB
  user_info = await Creds.findOne({where: {
    user_email: req.headers.user
  }})

  userName = req.body.name.query
  userSecret = user_info.dataValues.secret
  console.log("SECRET", userSecret)

  const callback = function(status=false, data=undefined) {
    if (status == true) {
      console.log("THIS IS TRUE")
      // res.json({
      //   message: "Successful login",
      //   //data
      // }) // can't send this message because headers are already set
      res.status(200).send({data})
      
    }
    else{
      console.log("UNAUTHORIZED")
      res.status(403).send("UNAUTHORIZED")
    }
  }
  //verify that the request is properly encoded
  await jwtVerify(userName, userSecret, callback ) 
}
);

//middleware
const getEmail = async (email) => {
  email = req.headers.user 
  console.log("EMAIL", email)
  
  user_info = await Creds.findOne({where: {
    user_email: email // lookup the users secret key
  }}).catch(err => {
    console.log(err)
    return err
  })
}


app.use('/graphql', async (req, res, next) => {
  console.log("GRAPHQL")
  // retrieve the secret key with the user_id in the request, if the hashes match
  // modify the email in the graphql request with the one in the header

  email = req.headers.user
  user_id = req.headers.user_id
  console.log("EMAIL", email)
  
  user_info = await Creds.findOne({where: {
    credential_id: user_id // lookup the users secret key
  }}).catch(err => {
    console.log(err)
    return err
  })

  const userName = req.body.content // this will be the encoded body
  
  const callback = function(status=false, data=undefined) {
    if (status == true) {
      console.log("THIS IS TRUE", data)
      // res.json({
      //   message: "Successful login",
      //   //data 
      // }) // can't send this message because headers are already set
      // res.status(200).send({data})
      
      //req.body.query = data.name.query
      //req.body.variables = data.name.variables

      req.body = data
      console.log("THE QUERY", req.body.query)
      console.log("THE BODY", req.body)
      next()
      
      
    }
    else {
      console.log("UNAUTHORIZED")
      res.status(403).send("UNAUTHORIZED")
    }
  }

  try {
    const userSecret = await user_info.dataValues.secret // this is the users secret key
    //verify that the request is properly encoded
    await jwtVerify(userName, userSecret, callback)
     
  } catch (err){
    console.log(err)
  }

} ,
graphqlHTTP({
  schema: root.schema,
  rootValue: root,
  graphiql: true,
}));

app.use('/graphqlui',
graphqlHTTP({
  schema: root.schema,
  rootValue: root,
  graphiql: true,
}
))

const WS_PORT = 3000;
const websocketServer = createServer((request, response) => {
  response.writeHead(200);
  response.end();
});

// Bind it to port and start listening
// websocketServer.listen(config.port, () => {
//   console.log("Websocket Server is now running on http://localhost:${config.port}")
//   if (environment !== 'production' &&
//     environment !== 'development' &&
//     environment !== 'testing'
//   ) {
//     console.error(`NODE_ENV is set to ${environment}, but only production and development are valid.`);
//     process.exit(1);
//   }
  /*new SubscriptionServer(
    {
      execute,
      subscribe,
      schema
    },
    {
      server,
      path: "/subscriptions"
    }
  );*/
//   return DB;
//  });


// Making plain HTTP server for Websocket usage
//const server = Server(app);

/** GraphQL Websocket definition **/
const subscriptionServer = SubscriptionServer.create({
  schema,
  execute,
  subscribe,
}, {
  server: server,
  path: '/subscriptions',
}, );

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: "ws://localhost:8000/subscriptions",
}));

server.listen(config.port, () => {
  if (environment !== 'production' &&
    environment !== 'development' &&
    environment !== 'testing'
  ) {
    console.error(`NODE_ENV is set to ${environment}, but only production and development are valid.`);
    process.exit(1);
  }
  return DB;
});


