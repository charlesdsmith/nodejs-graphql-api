const Bids = require('../models/Bids')
const User = require('../models/User')
const { SubscriptionClient } = require("subscriptions-transport-ws");
const ws = require("ws")

const client = new SubscriptionClient(`ws://localhost:8000/subscriptions`, {
    reconnect: true,
    
}, ws);

client.onConnected(() => {
    client.request({
      query: `subscription userInfo($id: String, $auc_id: String) {
        user(id: $id, auc_id: $auc_id) {
          user_id
          name
          auc_id
          ... on Auction2 {
            auc_id
            bid_amount
            winner
          }
        }
      }`,
      operationName: 'userInfo',
      variables: {
        id: "3", 
        auc_id: "2ceb038a-802e-4edd-a2ed-738a0c811d36" // use this as the auction id
      },
    }).subscribe({
      next: (result) => {
        try {
          //client.unsubscribeAll();
          if (result.errors) {
            console.log('something wrong:',result);
          }
          if (result.data) {
            console.log('result.data:',result.data);
            console.log("RESULT", result)
          }
        } catch (e) {
          console.log('exception:',e);
        }
      },
      error: (e) => console.log('error:',e),
    });

  });

// client.onConnected(() => {
//   client.request({
//     query: `subscription userInfo($id: String, $auc_id: String) {
//       user(id: $id, auc_id: $auc_id) {
//         user_id
//         name
//         auc_id
//         ... on Auction2 {
//           auc_id
//           bid_amount
//         }
//       }
//     }`,
//     operationName: 'userInfo',
//     variables: {
//       id: "3", 
//       auc_id: "2ceb038a-802e-4edd-a2ed-738a0c811d36" // use this as the auction id
//     },
//   }).subscribe({
//     next: (result) => {
//       try {
//         //client.unsubscribeAll();
//         if (result.errors) {
//           console.log('something wrong:',result);
//         }
//         if (result.data) {
//           console.log('result.data:',result.data);
//           console.log("RESULT", result)
//         }
//       } catch (e) {
//         console.log('exception:',e);
//       }
//     },
//     error: (e) => console.log('error:',e),
//   });

// });