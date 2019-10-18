const Bids = require('../models/Bids')
const db = require('../models/relations')
const gsmBids = db.Bids
const Auction = db.Auction
const gsmAuctions = require('../models/gsmauction')
const User = require('../models/User')


// when bids are created it needs to be done with a an auction
const createBidOnAuction = () => { Auction.upsert({bid_amount:60, gsmBids:{
  bid_amount:267
}},
  { 
  where:{auc_id:"947b94bd-a690-4ce6-b99e-2322489fc8ff"},
  include: [{
     association: Auction.Bids,
     model: gsmBids
  }
]})}

const createBid = () => {gsmBids.create({bid_amount:99, Auction:{
  bid_amount: 99
},  
  include: [{
  association: Auction,
  }
]})
newAuction = Auction.create({bid_amount:102})
gsmBids.setGSMAuctions(newAuction)}

const findBidOnAuction = () => {gsmBids.findAll( {where:{bid_id:'2ceb038a-802e-4edd-a2ed-738a0c811d36'},include:[{model:gsmAuctions}]}).then(data => console.log("result", data[0].dataValues))}

//console.log(createBidOnAuction())
console.log(createBid())
//console.log(findBidOnAuction())


// when a new auction is created, a new row in the auction table is created, which also has
// a column for 

// when someone creates a new bid, update the BID table, which is linked to the auction with
// a FK - create a bid with an auction instance everytime