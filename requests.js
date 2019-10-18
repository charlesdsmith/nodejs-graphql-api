const fetch = require('node-fetch')
const RSAKey = require('react-native-rsa');
const rsa = new RSAKey();
const jwt = require('jsonwebtoken')

// fetch('http://localhost:8000/authentication', {
//   method: 'post', 
//   headers: {
//     "Content-Type": "application/json"
//   },
//   body: JSON.stringify({
//     email:'charles@gmail.com'
//   }),
  

// }).then(data => {
//   data.json().then(json => console.log(json))
// }).catch(err => {
//   console.log(err)
// })
const authTest = async () => { // gets the public key from authcontroller
  let response = await fetch('http://localhost:8080/authentication', {
    method: 'post', 
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email:'charles@germanstarmotors.ca'
    }),
  })

  let jsonResponse = await response.json()
  console.log(jsonResponse)
 
  return jsonResponse
}

const changePwdTest = async () => {
  var publicKey = '{"n":"885b85eb64aa476b5f9412a7307a2b5ba1a735d8d4e94d63ac4bb17077a80777b2601e5285de528ef8cf48efbeea1bdd2136bf8be3a19e5011d0016fa4783b5b7c0f2e7eabda1eb8f190a65dfcfd93aa4c83bafdfdbdce082fe88a7be5e83731b95bec360bb800d8d973465c988d833f8ae45614393a4bd9db44efe0351465af","e":"10001"}'
  rsa.setPublicString(publicKey)
  let response = await fetch('http://localhost:8080/change-password', {
    method: 'post',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: "charles@germanstarmotors.ca",
      oldPassword: rsa.encrypt("charles5"),
      newPassword: rsa.encrypt("charles6")
    })
  })
  let jsonResponse = await response.text()
  console.log(jsonResponse)
  return jsonResponse
  }



//send encrypted password to loginTest()
const loginTest = async () => {
var publicKey = '{"n":"d076f55c59539fa20c3d34f6c69889f6085b7e268f3f08ce8ed4f4ab9431a785940644b58d5f1fa454a8175f30c8202ab41ded6d70ff9bb4ec50a5611e83656c15690d91b4979fa78b4cb06dd8403822c0a46769f722d7d6e33538dee70727db842163e31acb83ffe3fe9fe1f03d7d4adcc1e640500fec7f967286c91cfd364d","e":"10001"}'
rsa.setPublicString(publicKey)
let response = await fetch('http://localhost:8080/login', {
  method: 'post',
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email: "charlesdsmith25@gmail.com",
    password: rsa.encrypt("caleb")
  })
})
let jsonResponse = await response.text()
console.log(jsonResponse)
}

const logoutTest = async () => {
  let response = await fetch('http://localhost:8080/logout', {
    method:'post',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: "charles@germanstarmotors.ca"
    })
  })

  let jsonResponse = await response.text()
  console.log(jsonResponse)
}


const registerauthTest =  async () => {
  let response = await fetch('http://localhost:8000/register/auth', {
    method: 'post',
    headers: {
      "Content-Type": "application/json",
      "user": "public@gsm.com"
    },
  })
  let jsonResponse = await response.text()
  console.log(jsonResponse)
}

const registerCreateTest =  async () => {
  var publicKey = "{\"n\":\"efbd8fa29996d1556a6ba4ff358bc9428718fb5c4a12a9ecf1d63934f780d5c8de3d259c7c88e0a3356185462f18060efbbd6eeb1a1e52791a375334b0219cda3b497d902b0b3cd9c3ccdf36eaf59c3c357be034f3e1a9bb2ccd14b136d6e7b61a37bd6e446db27279bc3e581ed43e29c1622bb47ceb0f78f7fec5cab8ac5a4f\",\"e\":\"10001\"}"
  rsa.setPublicString(publicKey)
  let response = await fetch('http://localhost:8000/register/create', {
    method: 'post',
    headers: {
      "Content-Type": "application/json",
      "user": "public@gsm.com"
    },
    body:
      JSON.stringify({
        email: "caleb261@gmail.com",
        password: rsa.encrypt("caleb")
      })
  })
  let jsonResponse = await response.text()
  console.log(jsonResponse)
}


jwtTest = async () => {
  var data = {
    query: `mutation create($features:String, $pictures:String!)
    {
    createAuctionOffering(features:$features, start_time:"2019-03-15 19:05:45.109+00", duration:"2019-03-15 19:05:45.109+00", initial_price:"100", location:"Toronto", sellerFirstName:"Charles", sellerLastName:"Smith", quickStart:true, pictures:$pictures){
      auc_id
    }
  }
  `,
  variables: {
    features: "{\"year\": \"2002\", \"model\":{\"make\":\"honda\", \"selectedModel\":\"civic\"}}",
    pictures: "{\"title\":\"smileypic3.jpg\", \"src\":\"data:image/jpeg;base64,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\"}",

  }

  }

  var data2 = {
    query: `mutation {
      updateUserPreferences(preferences:"'{\"yearSpans\":{\"start\": \"2002\", \"end\":\"2006\"}, \"models\":{\"make\":\"honda\", \"selectedModels\":[\"civic\"]}}, {\"yearSpans\":{\"start\": \"2002\", \"end\":\"2006\"}, \"models\":{\"make\":\"honda\", \"selectedModels\":[\"prelude\"]}}'", 
        user_id:"09f0c007-6a69-458b-897f-d5f153a6c3d1"){
        email
      }
      }
  `
  }

  let data3 = {
    query:
      `mutation update($preferences:[String]){
        updateUserPreferences(preferences:$preferences){
          email
        }
      }`,
    variables: {
      preferences:["{\"yearSpans\":{\"start\": \"2000\", \"end\":\"2006\"}, \"models\":{\"make\":\"honda\", \"selectedModels\":[\"civic\", \"PRElude\"]}}", "{\"yearSpans\":{\"start\": \"2000\", \"end\":\"2010\"}, \"models\":{\"make\":\"honda\", \"selectedModels\":[\"civic\", \"PRElude\"]}}"],
    }
  }

let data4 = {
  query: 
  `query {
    getAllPreferences{
      user_id
    }
  }`
}

let data5 = {
  query:
  `query getPrefandUserInfo {
    getPref: getAllPreferences {
       preferences
      email
    }
    
    getUserInfo: findUserByEmail{
      email
      preferences
    }
  }
  `
}

let data6 = {
  query:
  `mutation {
    updateUserInfo(name:"name2", phone_number:"new", address:"new", email:"charlesdsmith25@gmail.com", company_name:"new")
    {
      email
    }
    
  }
  `
}

let data7 = {
  query: 
    `mutation update($pictures:String!){
      updateAuctionWithPic(auc_id:"36b319bf-ca3e-42be-9c79-9244de90d6cf", pictures:$pictures){
        auc_id
      }
        
      }
    `,
    variables:{
        pictures: "{\"title\":\"smileypic4.jpg\", \"src\":\"data:image/jpeg;base64,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\"}"

    }
}
  // data = await JSON.stringify(data)
  var token = jwt.sign(data7, 'a3gV6beZ3PKy9xSljeYXW3ZavqSHVNdA', {expiresIn: '10s'});

  // https://gsmauctionapp.herokuapp.com/graphql
  let response = await fetch('http://localhost:8080/graphql', {
    method: 'post',
    headers: {
      "User": "charles@germanstarmotors.ca",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({content:token})
  })
  let jsonResponse = await response.json()
 
  //console.log("res",jsonResponse)

}

const resetPasswordTest1 =  async () => {
  let response = await fetch('http://localhost:8080/reset-password', {
    method: 'post',
    headers: {
      "Content-Type": "application/json",
    },
    body:
        JSON.stringify({user:"charlesdsmith25@gmail.com"})
  })
  let jsonResponse = await response
  console.log("hello",jsonResponse)
}

const resetPasswordTest2 =  async () => {
  // charlesdsmith25@gmail.com1563396022434bww18jt0xec
  let response = await fetch('http://localhost:8080/reset-form?token=charlesdsmith25@gmail.com1563396022434bww18jt0xec', {
    method: 'post',
    headers: {
      "Content-Type": "application/json",
    },
    body: 
      JSON.stringify({code:"200707"})
  })

  let jsonResponse = await response.text()
  console.log(jsonResponse)
}

const resetPasswordTest3 =  async () => {
  const publicKey = "{\"n\":\"87c36009c7fb164d9edda597ed51f930f00a29ae350d7c47a2890aaea43da70754e3093b1d3bcd133c97622aafce3dd6e2f98ec7fac636959853e5ec1294ab9fc0e917f68d5bb102f2db34210500787a886f11a29b60da8561dbbf66353cc92907c8b97f5e07397f65772c4f9e4e1a1beeca07780838da523ecce4674fdc8d65\",\"e\":\"10001\"}"
  rsa.setPublicString(publicKey)
  // charlesdsmith25@gmail.com1563396022434bww18jt0xec
  // {\"n\":\"784cc3c516c4cbc9e438d80bf2fc33ef8617317b883e3a78e23d956eda4b3dd4008a788b8e2e0a4aec141c43a2c6c7883df96c8ee1abe002cd7ff183d98f263a805b6ab0fcc2e10a042f69adb7becce45ffd9252ade67489992d2a97af06e82e48a451c32a4631c6c6a847445bff63044ac22d4e8fa380be80c97117b0a7be33\",\"e\":\"10001\"}"}
  let response = await fetch('http://localhost:8080/password/charlesdsmith25@gmail.com1563396022434bww18jt0xec', {
    method: 'post',
    headers: {
      "Content-Type": "application/json",
    },
    body:
        JSON.stringify({
          password: rsa.encrypt("newpwd2")})
        })

  let jsonResponse = await response.text()
  console.log(jsonResponse)
}

//loginTest()
//logoutTest()
//authTest()
//jwtTest()
registerauthTest()
//registerCreateTest()
//resetPasswordTest1()
//resetPasswordTest2()
//resetPasswordTest3()
//changePwdTest()


module.exports = {authTest, loginTest}