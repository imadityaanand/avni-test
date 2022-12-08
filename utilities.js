const https = require('https');
const crypto = require('crypto');
const secretKey = "6269c2f199c669d345ccfcbdf89674ecd15fc2d0f1a45f1924f5b4e67a9f604b05e0b90f9a1c1e7b";
const accessKey = "072051E801013D84C6C3";
const log = false;

const axios = require('axios');

//////////////

const CryptoJS = require("crypto-js");

async function makeRequest(amount) {
    const salt_value = CryptoJS.lib.WordArray.random(12);                              // Randomly generated for each request.
    const timestamp_value = (Math.floor(new Date().getTime() / 1000) - 10).toString(); // Current Unix time (seconds).
    const access_key = accessKey;                                                       // The access key from Client Portal.
    const secret_key = secretKey;                                                       // Never transmit the secret key by itself.
    const url_path = "/v1/checkout";                                       // Portion after the base URL.
                                                                                    // Hardkeyed for this example.
    const http_method = "post";                                                   // get|put|post|delete - must be lowercase.
    //  const data = "";   
    const data = JSON.stringify({
        amount: amount,
        complete_checkout_url: 'http://example.com/complete',
        country: "SG",
        currency: 'SGD',
        requested_currency: "USD",
        merchant_reference_id: '950ae8c6-76',
        payment_method_types_include: ["sg_credit_mastercard_card", "sg_credit_visa_card"]
      }); 
                                                               // Stringified JSON without whitespace.
                                                                                    // Always empty string for GET;

    const getSignature = () => {
    const to_sign =
        http_method + url_path + salt_value + timestamp_value + access_key + secret_key + data;
    let signature = CryptoJS.enc.Hex.stringify(
        CryptoJS.HmacSHA256(to_sign, secret_key)
    );

    signature = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(signature));

    return signature;
    };

    const headers = {
    "access_key": accessKey,
    "signature": getSignature(),
    "salt": salt_value,
    "timestamp": timestamp_value,
    "Content-Type": `application/json`,
    };

    const request = {
    baseURL: "https://sandboxapi.rapyd.net",
    headers,
    url: url_path,
    method: http_method,
    data,
    };


    // You can use any HTTP request library to make the request. Example: Axios
    const response = await axios(request);
    const resURL = response.data.data.redirect_url;
    console.log(resURL)
    return resURL;
}


/////////////

// const testBody = {
//     "amount": "100",
//     "country": "SG",
//     "currency": "SGD",
//     "requested_currency": "USD",
    
// }

// async function makeRequest(method, urlPath, body = testBody) {

//     try {
//         httpMethod = method;
//         httpBaseURL = "sandboxapi.rapyd.net";
//         httpURLPath = urlPath;
//         salt = generateRandomString(8);
//         idempotency = new Date().getTime().toString();
//         timestamp = Math.round(new Date().getTime() / 1000).toString();
//       //  signature = sign(httpMethod, httpURLPath, salt, timestamp, body)
//       const getSignature = () => {
//         const to_sign =
//         method + urlPath + salt + timestamp + accessKey + secretKey + "";
//         let signature = CryptoJS.enc.Hex.stringify(
//             CryptoJS.HmacSHA256(to_sign, secretKey)
//         );
    
//         signature = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(signature));
    
//         return signature;
//         };
//         const options = {
//             hostname: httpBaseURL,
//             port: 443,
//             path: httpURLPath,
//             method: httpMethod,
//             headers: {
//                 'Content-Type': 'application/json',
//                 salt: salt,
//                 timestamp: timestamp,
//                 signature: getSignature(),
//                 access_key: accessKey,
//                 idempotency: idempotency
//             }
//         }

//         return await httpRequest(options, body, log);
//     }
//     catch (error) {
//         console.error("Error generating request options");
//         console.log(error);
//     }
// }

function sign(method, urlPath, salt, timestamp, body) {

    try {
        let bodyString = "";
        if (body) {
            bodyString = JSON.stringify(body);
            bodyString = bodyString == "{}" ? "" : bodyString;
        }

        let toSign = method.toLowerCase() + urlPath + salt + timestamp + accessKey + secretKey + bodyString;
        log && console.log(`toSign: ${toSign}`);

        let hash = crypto.createHmac('sha256', secretKey);
        hash.update(toSign);
        const signature = Buffer.from(hash.digest("hex")).toString("base64")
        log && console.log(`signature: ${signature}`);

        return signature;
    }
    catch (error) {
        console.error("Error generating signature");
        throw error;
    }
}

function generateRandomString(size) {
    try {
        return crypto.randomBytes(size).toString('hex');
    }
    catch (error) {
        console.error("Error generating salt");
        throw error;
    }
}

async function httpRequest(options, body) {

    return new Promise((resolve, reject) => {

        try {
            
            let bodyString = "";
            if (body) {
                bodyString = JSON.stringify(body);
                bodyString = bodyString == "{}" ? "" : bodyString;
            }

            log && console.log(`httpRequest options: ${JSON.stringify(options)}`);
            const req = https.request(options, (res) => {
                let response = {
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: ''
                };

                res.on('data', (data) => {
                    response.body += data;
                });

                res.on('end', () => {

                    response.body = response.body ? JSON.parse(response.body) : {}
                    log && console.log(`httpRequest response: ${JSON.stringify(response)}`);

                    if (response.statusCode !== 200) {
                        return reject(response);
                    }

                    return resolve(response);
                });
            })
            
            req.on('error', (error) => {
                return reject(error);
            })
            
            req.write(bodyString)
            req.end();
        }
        catch(err) {
            return reject(err);
        }
    })

}

exports.makeRequest = makeRequest;