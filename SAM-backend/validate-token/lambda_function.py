import requests
import pymysql
import sys
import uuid
import json 
from datetime import datetime, timedelta
import boto3
 
# Define the client to interact with AWS Lambda
client = boto3.client('lambda')
 

def format_and_return(payload, status):
    payload_body = ({ 
        "body" : {
        "payload" : payload,
        "status" : status}
    })
    response = client.invoke(
        FunctionName = 'arn:aws:lambda:us-east-1:889543450939:function:sam-app-FormatReturnPayloadFunction-SXuwV8QL94XO',
        InvocationType = 'RequestResponse',
        Payload = json.dumps(payload_body)
    )
    return json.load(response["Payload"])


def lambda_handler(event, context):
    if not (event and "body" in event):
        return("malformed request")
    
    body = json.loads(event["body"])
    if not "username" in body:
        payload =  {"error" : "Missing username in body"}
        response = format_and_return(payload, "501")
        return(response)       
    username = body["username"]
    token_id = body["token_id"]

    rds_host  = "tokens.cqra1unid8az.us-east-1.rds.amazonaws.com"
    name = "admin"
    password = "8QZ8qQc5GiK"
    db_name = "tokens"

    try:
        conn = pymysql.connect(host=rds_host, user=name, passwd=password, db = db_name, connect_timeout=5)
        print(conn)

    except pymysql.MySQLError as e:
        payload =  {"error" : e}
        response = format_and_return(payload, "501")
        return(response)       
    
    with conn.cursor() as cur:
        query_string = "select username, end_date from session_tokens_test where tokenId=\"{}\"".format(token_id)
        cur.execute(query_string)
        print(query_string)
        conn.commit()

        try:
            result = cur.fetchone()
            if(not result):
                print("could not find result")
                payload =  {"is_token_valid" : False}
                response = format_and_return(payload, "200")
                return(response)    
                
            TTL = result[1]
            queried_username = result[0]
            TTL_timestamp = datetime.fromtimestamp((int(TTL) / 1e3))
            print(username==queried_username)
            token_valid_bool = TTL_timestamp <  datetime.now()
            payload =  {"is_token_valid" : token_valid_bool}
            response = format_and_return(payload, "200")
            return(response)       

        except pymysql.MySQLError as e:
            payload =  {"error" : e}
            response = format_and_return(payload, "501")
            return(response)       
