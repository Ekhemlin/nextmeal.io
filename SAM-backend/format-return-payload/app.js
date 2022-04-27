const AWS = require('aws-sdk');

exports.lambdaHandler = async (event, context) => {
  console.log(event)
  // let body = JSON.parse(event.body);
  let body = event.body;
  const CORS = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };

  var payload = null; 
  var status;
  
  if (!body.hasOwnProperty("status")) {
    payload = {"body" : "Parameter \'status\' is missing in the request body"};
  }
  if (!body.hasOwnProperty("payload")) {
    payload = {"body" : "Parameter \'payload\' is missing in the request body"};
  }
  if(payload){
    // Payload is error message
    status = 509;  
  }
  else{
      payload = body["payload"]
      status = parseInt(body["status"])
  }
  
  var response = {
      headers : CORS,
      body: JSON.stringify(payload),
      statusCode: status
    };
    
    return response;
  };

