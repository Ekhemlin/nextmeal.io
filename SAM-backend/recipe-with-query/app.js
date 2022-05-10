// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const AWS = require('aws-sdk');
const https = require('https');
const querystring = require('querystring');


/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
  let body = JSON.parse(event.body);
  const CORS = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };
  var errorMessage = null;
  if (!body.hasOwnProperty("id")) {
    errorMessage = "Parameter \'id\' is missing in the request body";
  }
  if (!body.hasOwnProperty("query")) {
    errorMessage = "Parameter \'query\' is missing in the request body";
  }
  if (errorMessage) {
    var response = {
      statusCode: 509,
      headers : CORS,
      body: errorMessage
    };
    return response;
  }
  

  let dataString = '';

  const spoon_response = await new Promise((resolve, reject) => {
    var url = "https://api.spoonacular.com/recipes/complexSearch?" + querystring.stringify({
      "apiKey": "d41161c9f9e8416cb1f41f655ea69192",
      "query": body["query"],
      "cuisine": body["cuisine"],
      "excludeCuisine": body['excludeCuisine'],
      "diet": body["diet"]
    });
    console.log(url);
    const req = https.get(url, function (res) {
      res.on('data', chunk => {
        dataString += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: 200,
          body: JSON.stringify({"recipes" : dataString})
        });
      });
    });

    req.on('error', (e) => {
      reject({
        statusCode: 500,
        body: 'Something went wrong!'
      });
    });
  });

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({ "recipes": dataString })
  };
};

