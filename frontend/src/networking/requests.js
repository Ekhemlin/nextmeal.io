async function request_POST(endpoint, body){
    const result = await fetch(process.env.REACT_APP_ENDPOINT + endpoint, {
        method: 'POST',
        body: body,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    const ret = await result.json();
    return(ret)
}


async function request_GET(endpoint){
  const result = await fetch(process.env.REACT_APP_ENDPOINT + endpoint)
  const ret = await result.json();
  return(ret)
}


async function request_GET_any(endpoint){
  const result = await fetch(endpoint)
  const ret = await result.json();
  return(ret)
}

export {request_POST, request_GET, request_GET_any}; 