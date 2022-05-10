import Cookies from "universal-cookie";
import 'dotenv/config'
require('dotenv').config()

const cookies = new Cookies();

async function request_POST(endpoint, body) {
  const result = await fetch(process.env.REACT_APP_ENDPOINT + endpoint, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const ret = await result.json();
  return (ret)
}


async function validate_token(token, username) {
  var requst_body = {"token": `\"${token}\"` , "username": `\"${username}\"` }
  const result = await fetch(process.env.REACT_APP_ENDPOINT + "/validateToken", {
    method: 'POST',
    body: requst_body,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const ret = await result.json();
  return (ret["is_token_valid"])
}


async function request_token(username) {
  console.log("username");
  console.log(username);
  var requst_body = { "username": `\"${username}\"` }
  const result = await fetch(process.env.REACT_APP_ENDPOINT + "/createToken", {
    method: 'POST',
    body: requst_body,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const ret = await result.json();
  console.log("setting token");
  console.log(ret);
  // cookies.set('token', ret["token_id"]);
  // cookies.set('token_TTL', ret["TTL"]);
  return (ret)
}


async function request_GET_with_token(endpoint) {
  console.log("ping 2")
  var attempt = 0;
  const username = cookies.get("id");
  // let maxAttempts = process.env.MAX_ATTEMPTS_VALIDATION; 
  let maxAttempts = 5 
  console.log("ping 2.5")
  while (attempt < maxAttempts) {
    console.log("ping 2.6")
    console.log(cookies.get("token"));
    if (cookies.get("token")) {
      console.log("token");
      console.log(cookies.get("token"));
      var url = new URL(endpoint)
      console.log(url.toString())
      url.searchParams.append('token', cookies.get("token"));
      console.log(url.toString())
      const result = await fetch(url.toString())
      const ret = await result.json();
      if(ret.statusCode == 401){
        console.log("1");
        request_token(username);
        attempt+=1;
      }
      else{
        console.log("2");
        return(ret)
      }
    }
    else {
      console.log("3");
      request_token(username);
    }
  }
  console.log("ping 3");
}


async function request_GET(endpoint) {
  console.log("ping")
  console.log(process.env)
  console.log(process.env.SHOULD_USE_TOKENS)
  let should_validate_token = process.env.SHOULD_USE_TOKENS=="true";
  console.log("should_validate_token")
  console.log(should_validate_token);
  let url_endpoint = process.env.REACT_APP_ENDPOINT + endpoint;
  if (should_validate_token) {
    console.log("pong")
    return request_GET_with_token(url_endpoint);
  }
  const result = await fetch(url_endpoint)
  const ret = await result.json();
  return (ret)
}


async function request_GET_any(endpoint) {
  const result = await fetch(endpoint)
  const ret = await result.json();
  return (ret)
}


export { request_POST, request_GET, request_GET_any }; 