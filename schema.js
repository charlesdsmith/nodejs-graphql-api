const Sequelize = require('sequelize');
const User = require('../models/User')
const Creds = require('../models/Credential');
const db = require('../models/relations')
const Bids = db.Bids
const Auction = db.Auction
const Preferences = require('../models/preferences');
var { buildSchema } = require('graphql');
const { resolver } = require('graphql-sequelize');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLNonNull, GraphQLList, GraphQLInputObjectType, GraphQLBoolean, GraphQLInterfaceType } = require('graphql')
const {GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json')
const { subscribe } = require('graphql');
const { PubSub, withFilter } = require('graphql-subscriptions');
const {Expo} = require('expo-server-sdk')
const Op = Sequelize.Op
var nodemailer = require('nodemailer')
const lodash = require('lodash')
const pictureController = require('../api/controllers/pictureController')
const resizeController = require('../api/controllers/resizeController')
const moment = require('moment')
const allMakesJSON = require('../api/allMakes.json')


let transporter = nodemailer.createTransport({
    host: "secure.emailsrvr.com",
    port: 465,
    auth: {
      user: "server@germanstarmotors.ca",
      pass: "R3s34rch&"
    }
  })

var notificationMessage = {
    from: 'server@germanstarmotors.ca',
    to: 'charlesdsmith25@gmail.com',
    subject: 'Message title',
    text: 'Plaintext version of the message',
    html: '<p>HTML version of the message</p>'
};

let expo = new Expo();
const tokens = []
function sendNotification(tokens) {
    let messages = [];
    for (let token of tokens) {
    if (!Expo.isExpoPushToken(token)) {
        console.error(`Push token ${token} is not a valid Expo push token`);
        continue;
    }
    messages.push({
        to: token,
        sound: 'default',
        body: 'This is a test notification',
        data: { auction_id: '2ceb038a-802e-4edd-a2ed-738a0c811d36' },
    })
    }


    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    (async() => {
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log("TICKET CHUNK", ticketChunk);
            tickets.push(...ticketChunk);
            // NOTE: If a ticket contains an error code in ticket.details.error, you
            // must handle it appropriately. The error codes are listed in the Expo
            // documentation:
            // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
        } catch (error) {
            console.error(error);
        }
        }
    })();
    }
                        
const currentAuc = async (id) => {
     var auc_id = id
     const getAuction = await Auction.findOne({where:{
        auc_id: auc_id
    }})
     let auc = getAuction.dataValues
     return auc
    //  callback(bid=bid)
     
}
// currentBid('2ceb038a-802e-4edd-a2ed-738a0c811d36', function(bid=None){
//     console.log("CURRENT BID", bid)
// })

// define types
const subcriptionType = new GraphQLObjectType({
    name: "Link",
    description:"test link",
    //subscribe:

})

const resultType = new GraphQLObjectType({
    name: "Result",
    fields: {
        id: {
            type: new GraphQLNonNull(GraphQLString)
        }
    }
})

const auctionType2 = new GraphQLInterfaceType({
    name: "Auction2",
    fields: {
        auc_id: 
        {type: GraphQLString},
        bid_amount: 
        {type: GraphQLString},
        winner:
        {type: GraphQLBoolean},
        year: {
        type: GraphQLString
        },
        make: {
        type: GraphQLString
        },
        model: {
        type:GraphQLString
        },
        user_id: {
            type:GraphQLString
        }

        //   bid_amount: {
        //       type: new GraphQLNonNull(GraphQLString),
        //       description: "The amount of the current highest bid"
        //   }
    }
})

const auctionType = new GraphQLObjectType({
    name: 'Auction',
    description:'An auction',
    fields: {
      auc_id: {
        type: GraphQLString,
        description:"The id of the offering",
      },
      user_id: {
          type: GraphQLString,
      },
      features: {
        type: GraphQLString,
        description: "Features of the the car being offered"
      },

      bid_amount: 
        {type: GraphQLString},

      start_time: {
        type: new GraphQLNonNull(GraphQLString),
        description: "The start time of the auction"
      },
      end_time: {
          type: GraphQLString
      },
      initial_price: {
        type: new GraphQLNonNull(GraphQLString),
        },
      duration: {
        type: new GraphQLNonNull(GraphQLString),
        description: "How long the auction will last"
      },
      location: {
        type: new GraphQLNonNull(GraphQLString),
        description: "Where the auction is located"
      },
      sellerFirstName: {
        type: new GraphQLNonNull(GraphQLString),
      },
      sellerLastName: {
        type: new GraphQLNonNull(GraphQLString),
      },
      quickStart: {
          type: new GraphQLNonNull(GraphQLBoolean)
      },
      pictures: {
        type: new GraphQLNonNull(GraphQLString)
    },
      misc: {
        type: new GraphQLList(GraphQLString)
        },
      mileage: {
        type:GraphQLString,
        },
      year: {
      type: GraphQLString
      },
      make: {
      type: GraphQLString
      },
      model: {
      type:GraphQLString
      },
      trim: {
          type: GraphQLString
      },
      vin: {
          type:GraphQLString
      },
      winner: {
          type:GraphQLBoolean
      }

    }
  })

const bidType = new GraphQLObjectType({
    name: 'Bids',
    description: 'Bids',
    fields: {
        bid_id: 
            {type: GraphQLString},
        createdAt: 
            {type: GraphQLString},
        bid_amount: 
            {type: GraphQLString},
        auc_id:
        {type: GraphQLString},
        user_id: 
        { type: GraphQLString },
        success:
        {type: GraphQLBoolean},
        name:
        {type: GraphQLString}
    }
})

const userType = new GraphQLObjectType({
    name: 'User',
    description: 'Users',
    //interfaces: [auctionType2,], // interface with auctionType2 to see to see if users can subcribe to the auction
    fields: {
        user_id: 
            { type: GraphQLString },   

        name: 
            {type: GraphQLString},

        email: 
            {type: GraphQLString},

        phone_number: 
            {type: GraphQLString},

        address: 
            {type: GraphQLString},

        company_name: 
            {type: GraphQLString},

        auc_id: 
            {type: GraphQLString},
        
        bid_amount: 
            {type: GraphQLString},
        
        preferences:
            {type: GraphQLString},
        
        winner:
        {type:GraphQLBoolean}
    }
})

const preferencesType = new GraphQLObjectType({
    name: "preferencesType",
    fields: {
        preferences:
        {type: GraphQLJSON},

        user_id:
        {type: GraphQLString},

        email:
        {type: GraphQLString},

        fromYear:
        {type: GraphQLString},

        toYear:
        {type: GraphQLString},

        make:
        {type: GraphQLString},

        model:
        {type: GraphQLString},

        preference_id:
        {type:GraphQLInt}

    }
})

const logoutType = new GraphQLObjectType ({
    name: "logoutType",
    fields: {
        logout:
        {type: GraphQLBoolean},
    }
})

const passwordType = new GraphQLObjectType ({
    name: "passwordType",
    fields: {
        oldPassword: 
        {type: GraphQLString}
    }
})

const resetPasswordType = new GraphQLObjectType ({
    name: "passwordType",
    fields: {
        email: 
        {type: GraphQLString},

        code:
        {type:GraphQLString}
    }
})

const bidInputType = new GraphQLInputObjectType({
    name: "bidInputType",
    fields: {
        bid: { type: new GraphQLNonNull(GraphQLString)}
    }
});

const allMakesType = new GraphQLObjectType({
    name: "allMakesType",
    fields: { makes: { type: new GraphQLList(GraphQLJSON) },
    }
})
const bidPubsub = new PubSub();

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'root',
        fields: {
        
        logout: {
            type: logoutType,
            args: {
                logout:{
                    type: GraphQLBoolean
                }
            },
            resolve: (root, logout_info, req) => {
                    var email = req.headers.user
                    console.log("EMAIL", email)
                    Creds.update({secret:" "}, // when the user logs out update their secret key with an empty string
                        { where: {
                        user_email:"charles@germanstarmotors.ca",
                    }}).then(data => {
                        console.log("LOGOUT")
                        return {"message": "You have been logged out"}}
                        )
            }
        },

        allMakes: {
            type: new GraphQLList(allMakesType),
            resolve: (root, info, req) => {
                return [{makes: allMakesJSON }]
            }
        },

        allAuctions: { // this is the endpoint/resolver
            type: new GraphQLList(auctionType),
            args:{
                page_no:{
                    description: "Current page to be loaded",
                    type: GraphQLInt
                },
                page_size:{
                    description: "How many auctions should be displayed",
                    defaultValue:15,
                    type: GraphQLInt
                },
                filterByYear: {
                    description: "Filter auctions by year",
                    type:new GraphQLList(GraphQLString)
                },
                filterByMileage: {
                    description: "Filter auctions by mileage",
                    type:new GraphQLList(GraphQLString)
                },
                filterByMake: {
                    description: "Filter auctions by make",
                    type:new GraphQLList(GraphQLString)
                },
                filterByModel: {
                    description: "Filter auctions by model",
                    type:new GraphQLList(GraphQLString)
                },
                sortBy: {
                    description: "Why the auctions should be sorted by",
                    type:GraphQLString
                },
                order: {
                    description: "Ascending or descending order",
                    type:GraphQLString
                },
                current_state: {
                    description: "boolean if the auction has finished",
                    type:GraphQLString
                },
                wonAuctions: {
                    description: "boolean for is the user wants to return only the auctions they won",
                    type:GraphQLBoolean
                }
            },
            resolve: async (root, page_info, req) => {
                const sortBy = page_info.sortBy
                const order = page_info.order
                const filterByYear = page_info.filterByYear
                const filterByMileage = page_info.filterByMileage
                console.log("FILTER MAKE", page_info.filterByMake)
                const filterByMake = page_info.filterByMake
                const filterByModel = page_info.filterByModel
                const currentState = page_info.current_state
                const wonAuctions = page_info.wonAuctions
                const user_id = req.headers.user_id
                
                
                // alterAuc adds a list of picture URLs to the auctions misc column
                const alterAuc = async (allAuctions) => {
                    // loop through all the auctions and get each auction's auc_id
                    for (auc=0; auc < allAuctions.length; auc++){
                        console.log("AUC VALUES", allAuctions[auc])
                        const auc_id = allAuctions[auc].dataValues.auc_id
                        // then get a list of each pic for each auc_id
                        const picturesOfCar = await pictureController().getPicturesFromCloud(auc_id)
                        for (url=0; url < picturesOfCar.length; url++){
                            // then loop through the list and make it into an URL 
                            cloudUrl = "https://console.cloud.google.com/storage/browser/_details/auction-app/" + picturesOfCar[url] + "?project=inventoryapp-1516743070296"
                            // finally add each URL to the "misc" array in each Auction
                            allAuctions[auc].dataValues.misc.push(cloudUrl)    
                        }
                    }
                    return allAuctions
                }

                // fill in this skeleton based on the users options
                const sequelizeSkeleton = {
                    where:{
                        status: "ready",
                    },
                    order:['createdAt'],
                    offset:page_info.page_no*page_info.page_size,limit:page_info.page_size
                }

                currentTime = moment().format()

                const occurenceCalculator = {
                    'finished':  function () {
                        console.log("found")
                    sequelizeSkeleton.where.end_time = {
                        // end_time is behind current time
                        [Op.lt]:currentTime
                        }
                    },
                    "active": function () {
                        sequelizeSkeleton.where.start_time = {
                            // current time is ahead of start_time but behind end_time
                            [Op.lte]:currentTime
                        },
                        sequelizeSkeleton.where.end_time = {
                            [Op.gte]:currentTime
                        }
                    },

                    "upcoming": function () {
                        sequelizeSkeleton.where.start_time = {
                            // start_time is ahead of current time
                            [Op.gte]:currentTime
                        }
                    }
                }

                const filterOptions = [sortBy, filterByYear, filterByMileage, filterByMake, filterByModel, currentState, wonAuctions]

                const allAuctions = async () => {
                    // loop through filterOptions, search for null values then remove corresponding filter from sequelizeSkeleton
                    
                        if (filterOptions[0] != undefined){ // if filterByYear is not null add it to the skeleton
                            sequelizeSkeleton.order = [[sortBy, order]]
                        }
                        if (filterOptions[1] != undefined){ // if filterByYear is not null add it to the skeleton
                            sequelizeSkeleton.where.year = {
                                [Op.gte]:filterByYear[0],
                                [Op.lte]:filterByYear[1],
                            }   
                        } 
                        if (filterOptions[2] != undefined){ // if filterByMileage is not null add it to the skeleton
                            sequelizeSkeleton.where.mileage = {
                                [Op.gte]:filterByMileage[0],
                                [Op.lte]:filterByMileage[1],
                            }   
                        } 
                        if (filterOptions[3] != undefined){ // if filterByMake is not null add it to the skeleton
                            sequelizeSkeleton.where.make = {
                                [Op.in]:filterByMake
                            }   
                        } 
                        if (filterOptions[4] != undefined){ // if filterByModel is not null add it to the skeleton
                            sequelizeSkeleton.where.model = {
                                [Op.in]:filterByModel
                            }   
                        } 
                        if (filterOptions[5] != undefined){ // if filterByModel is not null add it to the skeleton
                            occurenceCalculator[currentState]()   
                        } 

                        if (filterOptions[6] == true){ // if filterByModel is not null add it to the skeleton
                            sequelizeSkeleton.where.winner = user_id
                        } 
                    
                        console.log("SKELETON", sequelizeSkeleton)
                    const Auctions = await Auction.findAll(sequelizeSkeleton)
                    return alterAuc(Auctions) // send to alterAuc for be processed
                }

                return allAuctions()
        }},
        findByAuctionId: {
            type: auctionType,
            args:{
            auc_id:{
                description: "ID of the auction",
                type: new GraphQLNonNull(GraphQLString)
            },   
        }, 
        // also return a list of images from google cloud for that auc_id
        resolve: async (root, auc_id, req) => {
            console.log(auc_id.auc_id)
            const oneAuction = await Auction.findOne({where:{
                auc_id:auc_id.auc_id
            }})
            console.log("ONE AUCTION", oneAuction)
            if (oneAuction.winner === req.headers.user_id){
                oneAuction.winner = true
                return oneAuction
            }
            oneAuction.winner = false
            return oneAuction
        }
        
    },
        findByAuctionId2: {
            type: auctionType,
            args:{
            auc_id:{
                description: "ID of the auction",
                type: new GraphQLNonNull(GraphQLString)
            },   
        }, 
        resolve: (root, auc_id, info) => {
            console.log(auc_id.auc_id)
            return Auction.findOne({where:{
                auc_id:auc_id.auc_id
            }}).catch(err => {
                return Promise.reject(err)}
                )
        }},

        allWonAuctions: {
            type: new GraphQLList(auctionType),
            resolve: async (root, user_info, req) =>{
                return Auction.findAll({where:{
                    winner:req.headers.user_id
                }})
            }
        },
        
        allBids: {
            type: new GraphQLList(bidType),
            resolve: resolver(Bids)
        },
        findByBidId: {
            type: bidType,
            args: {
                bid_id:
                {type: GraphQLString}            
            },    
            resolve: (root, bid_id, info) => 
            { return Bids.findOne({where:{
                bid_id:bid_id.bid_id
            }}).catch(err => {
                return Promise.reject(err)}
                )
        }},
        allUsers: {
            type: new GraphQLList(bidType),
            resolve: resolver(Bids)
        },
        findUserByEmail: {
            type: userType,
            resolve: (root, user_id, req) => 
            { return User.findOne({where:{
                email: req.headers.user
            }}).catch(err => {
                return Promise.reject(err)}
                )
        }
        },
        getAllPreferences: {
            type: new GraphQLList(preferencesType),
            resolve: (root, user_info, req) => { 
                return Preferences.findAll({
                    where: {
                        user_id: req.headers.user_id,
                    }  
                })
            }
        },
        }
    }),

    // create a mutation, to allow for creating, updating and deleting
    mutation: new GraphQLObjectType({
        name: 'create',
        fields: {
            resetPassword: {
                type: resetPasswordType

            },
            createUser: { // this is the endpoint
                type: userType,
                args: {
                    name: { 
                        type: new GraphQLNonNull(GraphQLString),
                        description: "The name to be used when creating"
                    },
                    email: {
                        type: new GraphQLNonNull(GraphQLString),
                        description: "The email to be used when creating the user"
                    },
                    phone_number: {
                        type: new GraphQLNonNull(GraphQLString),
                        description: "The phone number to be used when creating the user"
                    },
                    address: {
                        type: new GraphQLNonNull(GraphQLString),
                        description: "The address to be used when creating the user"
                    },
                    company_name: {
                        type: new GraphQLNonNull(GraphQLString),
                        description: "The company name to be used when creating the user"
                    },
                    
                },
                resolve: (root, name, info) => {
                    return User.create(name).catch(err => {
                        return Promise.reject(err)}
                        )
                }
            },
            updateUserInfo: {
                type: userType,
                args: {
                    name:
                    {type: GraphQLString},

                    phone_number:
                    {type: GraphQLString},
                    
                    address:
                    {type: GraphQLString},

                    email:
                    {type: GraphQLString},

                    company_name:
                    {type: GraphQLString}

                },
                resolve: async (root, user_info, req) => {                
                    User.update({
                        name: user_info.name,
                        phone_number: user_info.phone_number,
                        address: user_info.address,
                        email: user_info.email,
                        company_name:user_info.company_name,
                    },
                    { 
                    where: { user_id:req.headers.user_id }
                })
                
                return {name: user_info.name,
                    phone_number: user_info.phone_number,
                    address: user_info.address,
                    email: req.headers.user,
                    company_name:user_info.company_name}
                }
            },
            
            updateUserMethod: {
                type: preferencesType,
                args: {
                    preferences:
                    {type: new GraphQLList(GraphQLString)},
                    
                    email:
                    {type: new GraphQLNonNull(GraphQLString)}
                },
                resolve: (root, user_info, req) => { 
                    console.log(user_info.preferences, user_info.email)
                    return Preferences.update({method: user_info.preferences}, {
                        where: {user_id: user_info.user_id}
                    })
                }
            },

            updateUserPreferences: {
                type: preferencesType,
                args: {
                    preferences:
                    {type: new GraphQLList(GraphQLString)},

                    // user_id:
                    // {type: new GraphQLNonNull(GraphQLString)}

                },
                resolve: (root, user_info, req) => { 
                    // console.log(user_info.preferences, user_info.email)
                    Preferences.destroy({where: {
                        user_id:req.headers.user_id
                    }}).then(data => console.log("DELETE DATA", data)).catch(err => console.log(err))
                    
                    for (i=0; i < user_info.preferences.length; i++){
                       
                        user_preferences = JSON.parse(user_info.preferences[i]) // convert every JSON-like string to actual JSON

                        // delete all the records that belong to the user with the user_id
                        // then insert all the preferences provided by the client 
                         
                        
                        for (j=0; j < user_preferences.models.selectedModels.length; j++){
                            
                            Preferences.create({
                                user_id: req.headers.user_id,
                                fromYear:user_preferences.yearSpans.start,
                                toYear: user_preferences.yearSpans.end,
                                make: user_preferences.models.make,
                                model: user_preferences.models.selectedModels[j],
                                email: req.headers.user,
                                preferences: user_preferences
                            }).then(data => console.log("DATA", data)).catch(err => console.log(err))
                            } 
                    }

                    return {preferences: user_preferences}
                }
            },

            createBid: {
                type: bidType,
                args: { // only name and email are required, the user_id is created automatically
                    bid_id: {type: GraphQLString},

                    createdAt: {type: GraphQLString},
                    
                    bid_amount: {type: GraphQLString},
                    
                    GSMAuctionAucId: {type: GraphQLString}
                },
                resolve: (root, bid_info, info) => {
                    // we make use of the publish() from the pubsub object, which accepts two arguments: the channel
                    // to publish to and an object containing the event 
                    // to be fired and the data (in this case the new bid) to pass along with it. 

                    // bidPubsub.publish('user', {user: amount})
                    // console.log("record ADDED")
                    // return Bids.create(amount).catch(err => {
                    //     return Promise.reject(err)
                    // }
                    //     )

                    Bids.create(bid_info).catch(err => {
                        Promise.reject(err)
                    })
                }    
            },
            createAuctionOffering: {
                type: auctionType,
                args: {
                    year: {
                    type: GraphQLString
                    },
                    make: {
                    type: GraphQLString
                    },
                    model: {
                    type:GraphQLString
                    },
                    vin: {
                    type:GraphQLString
                    },
                    user_id: {
                        type:GraphQLString
                    }
                },            
                resolve: async (root, auc_info, req) => {

                    auc_info.user_id = req.headers.user_id
                    
                    // look up user first and last name in user table with email from headers
                    // then update auctions table columns with those values
                    const createAuction = await Auction.create(auc_info).then(data => {
                        auc_info.auc_id = data.dataValues.auc_id // add auc_info to the object that is sent by the user
                        req.body = auc_info // after the new auction has been created with auc_info, set the req object equal to it so it can be passed to pictureController().BulkCreatePicture(req)
                        // pictureController().BulkCreatePicture(req) // for bulk uploading
                        // pictureController().CreatePicture(req) // for single upload
                        return data
                        
                    })
                    .catch(err => {
                        Promise.reject(err) }) 

                    // Get picture information from the auc_id and send it to the picture controller

                    // after the auction is created check the preferences table to see
                    // if there are any user preferences that match the auction offering
                    // try searching for matching makes and models first and return the list 
                    // then search the auction year in the range of fromyear to toyear for each element in the list 
                    
                    return createAuction
                    
                },
                
            },
            updateAuctionWithPic: {
                type: auctionType,
                args:{
                    auc_id:{
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    pictures: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    },
                resolve: async (root, auc_info, req) => {
                        multiplePicsBody = auc_info
                        //auc_info.auc_id = data.dataValues.auc_id // add auc_info to the object that is sent by the user
                        onePicBody = auc_info // after the new auction has been created with auc_info, set the req object equal to it so it can be passed to pictureController().BulkCreatePicture(req)
                        const updateAuctionWithPic = await pictureController().CreatePicture(onePicBody).catch(err => {
                        Promise.reject(err) })
                        const resizePic = await resizeController.resizer(req.body.variables.pictures)
                        // change the req structure for the three new pictures to be passed to bulk upload
                        multiplePicsBody.pictures = resizePic
                        const uploadResizedPics = await pictureController().BulkCreatePicture(multiplePicsBody) // for bulk uploading
                        

                    if (updateAuctionWithPic && uploadResizedPics ){ // the the picture is uploaded succesfully return the auction id
                        return {auc_id: auc_info.auc_id}
                    }
                    else {
                        return {auc_id:null}
                    }            
                }               
            },

            finalizeAuction: {
                type: auctionType,
                args:{
                    auc_id:{
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    features: {
                        type: GraphQLString,
                        description: "A JSON object of the features of the car"
                    },
                    initial_price: {
                        type: GraphQLString,
                    },
                    duration: {
                        type: GraphQLString,
                        description: "How long the auction will last"
                    },
                    location: {
                        type:GraphQLString,
                        description: "Where the auction is located"
                      },
                    sellerFirstName: {
                    type: GraphQLString,
                      },
                    sellerLastName: {
                    type: GraphQLString,
                      },
                    quickStart: {
                        type: GraphQLBoolean
                      },
                    start_time: {
                        type: GraphQLString,
                        description: "The start time of the auction"
                    },
                    status: {
                        type:GraphQLString
                    }, 
                    trim: {
                        type:GraphQLString
                    },
                    mileage: {
                        type:GraphQLString,
                        },
                    year: {
                        type: GraphQLString
                    },
                    make: {
                        type: GraphQLString
                    },
                    model: {
                        type:GraphQLString
                    }
                    },
                    
                resolve: async (root, auc_info, req) => {
                        auc_info.bid_amount = auc_info.initial_price
                        year = Number(auc_info.year)
                        make = auc_info.make.toLowerCase()
                        model = auc_info.model.toLowerCase()
                        var duration = Number(auc_info.duration)
                        var startTimeToDate = moment(auc_info.start_time)
                        var end_time = startTimeToDate.add(duration, 'm').toString() // add 30 minutes to the start time to create the end time automatically
                        auc_info.end_time = end_time 
                        console.log("END TIME2", auc_info.end_time)
                        //auc_info.auc_id = data.dataValues.auc_id // add auc_info to the object that is sent by the user
                        req.body = auc_info // after the new auction has been created with auc_info, set the req object equal to it so it can be passed to pictureController().BulkCreatePicture(req)
                        // pictureController().BulkCreatePicture(req) // for bulk uploading
                        const updateAuction = await Auction.update(
                            {features:auc_info.features,
                            initial_price:auc_info.initial_price,
                            bid_amount: auc_info.bid_amount,
                            duration: auc_info.duration,
                            location: auc_info.location,
                            sellerFirstName: auc_info.sellerFirstName,
                            sellerLastName: auc_info.sellerLastName,
                            quickStart: auc_info.quickStart,
                            start_time: auc_info.start_time,
                            status: auc_info.status,
                            mileage: auc_info.mileage,
                            trim: auc_info.trim,
                            end_time: end_time }, 
                            {where: {auc_id:auc_info.auc_id}}).catch(err => {
                        Promise.reject(err) }) 

                    //console.log("feat", auc_info)

                    await Preferences.findAll({
                        where:{
                        from_year: {
                            [Op.lte]:
                            // replace this with parameter instead
                            year, // determine if fromyear - toyear contains the contains the year of the offering
                        },
                        to_year: {
                            [Op.gte]:year
                        },
                        make: make,
                        model: model // determine if auction model is in preferences models
                    }
                    
                }).then( async data =>  {

                         // this will store all the notifyTokens
                        console.log("DATA", data.length)
                        var i
                        for (i=0; i < data.length; i++){
                            const notifyMethods = data[i].dataValues.method
                            const fromYear = data[i].dataValues.fromYear
                            const toYear = data[i].dataValues.toYear
                            const make = data[i].dataValues.make
                            const user_id = data[i].dataValues.user_id

                        // after the matching preference is found, fetch the user id
                        // and look it up in the 'users' table
                        // then fetch the email from that table and use it to notify the user of the new auction
                        const get_email_and_token = async () => { // beacuse you deleted the user table you need to add back some users(09f0c007-6a69-458b-897f-d5f153a6c3d1') for testing
                            const creds = await Creds.findOne({ where:{
                                credential_id:user_id
                             }
                            })

                            return creds
                        } 

                        const user_email_and_token = async () => {
                            const email_and_token = await get_email_and_token()
                            return email_and_token
                        }
                        
                        const userEmail = await user_email_and_token()
                        const userNotifyToken = await user_email_and_token()
                        // console.log("NOTIFY TOKEN!!", userNotifyToken.notifyToken)
                        // console.log('HERE EMAIL', userEmail.user_email)
                        // if texting is one of the users notification options
                        
                        var Message = {
                            from: '"German Star Motors" <server@germanstarmotors.ca>',
                            to: `${userEmail.user_email}`, // send to users email
                            subject: 'New auction posted!',
                            text: `A new auction matching your preferences was posted! 
                            Details:
                            Minimum Year: ${fromYear}
                            Maximum Year: ${toYear}
                            Make: ${make},
                            Start time: ${startTimeToDate},
                            End time: ${duration}`,
                            html: `A new auction matching your preferences was posted! 
                            Details:
                            Minimum Year: ${fromYear},
                            Maximum Year: ${toYear},
                            Make: ${make},
                            Start time: ${startTimeToDate},
                            End time: ${duration}`
                        };

                        // if (notifyMethods.includes('text')){
                        //     // text the user
                        //     console.log("SEND TEXT")
                        // }
                        
                        if (notifyMethods != null) {
                            console.log("NOT NULL")
                        if (notifyMethods.includes("email")){  
                            transporter.sendMail(Message, (err, info) => {
                                if(err){
                                    console.log(err)
                                    // return res.status(500).json({message:"Internal server error!"})
                                }
                            })
                        }
                        
                        if (notifyMethods.includes("notification")){
                            // send the user a notification on their phone
                            // add their notifytoken to the array of tokens
                            tokens.push(userNotifyToken.notifyToken)
                        }
                        }
                        }
                        await Promise.all(tokens);
                        sendNotification(tokens) // send the array of tokens to the expo server
                        
                    }).catch(err => console.log("error", err))

                    if (updateAuction){ // the the picture is uploaded succesfully return the auction id
                        return {auc_id: auc_info.auc_id}
                    }
                    else {
                        return {auc_id:null}
                    }   
                    
                }
                      
            },

            updateAuctionWithBid: {
                type: bidType,
                args:{
                    auc_id:{
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    bid_id:{
                        type: GraphQLString
                    },
                    bid_amount: {
                        type: new GraphQLNonNull(GraphQLString)
                    }, 
                    },
                resolve: async (root, auc_info, req) => {
                    auc_info.user_id = req.headers.user_id

                    const getAuc = async () => {
                        let highestBid = await currentAuc(auc_info.auc_id)
                    return highestBid
                    }
                    
                    
                    const currentHighestBid = (await getAuc()).bid_amount
                    const auctionStart = moment((await getAuc()).start_time).format()
                    const auctionEnd = moment((await getAuc()).end_time).format()
                    currentTime = moment().format()
                    const active = auctionStart <= currentTime && currentTime <= auctionEnd

                    if (parseInt(auc_info.bid_amount) > parseInt(currentHighestBid) && active == true){
                        // when the auction is updated with a new bid, also create a new 
                    // entry in the Bids database
                    console.log("BID TRUE!")
                    await Auction.update({bid_amount:auc_info.bid_amount, winner:auc_info.user_id},
                        {where: {
                            auc_id: auc_info.auc_id
                        }})
                    
                    await Bids.create(auc_info).catch(err => {
                        Promise.reject(err)
                    })  

                    const year = (await getAuc()).year
                    const make = (await getAuc()).make
                    const model = (await getAuc()).model
                    console.log("AUC_INFO", auc_info)

                    auc_info.year = year
                    auc_info.make = make
                    auc_info.model = model
                    bidPubsub.publish('user', {user: auc_info})
                    
                    return {success: true,
                            bid_amount: auc_info.bid_amount
                        }
                    }

                    else {
                        return {success: false}
                    }
                    
                }
                      
            }

        }
    }),
    subscription: new GraphQLObjectType({
        name: "Subscription",
        fields: {
          user: {
            type: auctionType,
            args: {
                user_id: {type: GraphQLString},
                auc_id: {type: GraphQLString} // these args will be used to determine which published data reaches the user
            },
             // The resolve function describes how to 'resolve' or fulfill
            // the incoming query.
            resolve: async (payload, { id, auc_id, name }, context, info) => { // id and auc_id are the variables passed from the client query
                // use helper function to retrieve the current highest bid
                const getBid = async () => {
                    let highestBid = await currentAuc(auc_id)
                return highestBid.bid_amount
                }   
                const currentHighestBid = await getBid()
                console.log("PAYLOAD HERE", payload)
                return {auc_id:auc_id, bid_amount:currentHighestBid, winner:payload.user.winner, year:payload.user.year, make:payload.user.make, model:payload.user.model}
                //return payload.user
              },
            subscribe: withFilter(() => bidPubsub.asyncIterator('user'), (payload, variables) => {
                // here we check the variables described in the subscription against the 
                // payload in the publish function and return it if it passes
                if (payload.user.user_id == variables.user_id){
                    // check to see if the bid notifiation belongs to the current user
                    // this is so frontend can display current highest bid by notification alone
                    // instead of also using the response from updateAuctionWithBid
                    payload.user.winner = true
                }

                else {
                    payload.user.winner = false
                }
                
                return payload.user.auc_id === variables.auc_id

                
            }
            )
            // subscribe: () => {
            //     console.log('SUBSCRIBE')
            //     return bidPubsub.asyncIterator('user')
            // }
        },
        userFiltered: {
            type: userType,
            args: {
              id: { type: GraphQLString },
            },
            resolve: (publishInfo, { id }) => {
              console.log('published:', publishInfo)
              return {id, name: publishInfo['auctionId']};
            },
            subscribe: withFilter(() => bidPubsub.asyncIterator('userFiltered'),
              (user, args) => {
                //return !args['id'] || user.id === parseInt(args['id'], 10);
                console.log("FILTER")
                console.log(user,args)
                return user.auctionId === parseInt(args['id'], 10);
              }),
          },
        },    
    })

    })

    // setInterval(() => {
    //     console.log('publish')
    //     bidPubsub.publish('user', {data:"Auction Info"}) // sends published data to subscribe func
    //     console.log('after publish')
    // }, 1000)


module.exports = {auctionType, schema}