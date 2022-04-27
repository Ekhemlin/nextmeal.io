import requests
import pymysql
import sys
import uuid
import json 
from datetime import datetime, timedelta
import boto3
 
# Define the client to interact with AWS Lambda
client = boto3.client('lambda')
 

def lambda_handler(event, context):
    if not (event and "body" in event):
        return("malformed request")
    
    body = event["body"]
    if not "username" in body:
        return("missing username")
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
        print(e)
        return(e)
    
    with conn.cursor() as cur:
        query_string = "select username, end_date from session_tokens_test where tokenId=\"{}\"".format(token_id)
        cur.execute(query_string)
        conn.commit()


        try:
            result = cur.fetchone()
            TTL = result[1]
            queried_username = result[0]
            TTL_timestamp = datetime.fromtimestamp((int(TTL) / 1e3))
            print(username==queried_username)
            token_valid_bool = TTL_timestamp <  datetime.now()
            payload_body = ({ 
               "body" : {
                "payload" : {"is_token_valid" : token_valid_bool},
                "status" : "200"}
            })
        
            response = client.invoke(
                FunctionName = 'arn:aws:lambda:us-east-1:889543450939:function:sam-app-FormatReturnPayloadFunction-SXuwV8QL94XO',
                InvocationType = 'RequestResponse',
                Payload = json.dumps(payload_body)
            )
            formattedPayload = json.load(response['Payload'])
            return(formattedPayload)       
         

        except pymysql.MySQLError as e:
            payload_body = ({ 
               "body" : {
                "payload" : {"error" : e},
                "status" : "501"}
            })
        
            response = client.invoke(
                FunctionName = 'arn:aws:lambda:us-east-1:889543450939:function:sam-app-FormatReturnPayloadFunction-SXuwV8QL94XO',
                InvocationType = 'RequestResponse',
                Payload = json.dumps(payload_body)
            )
            formattedPayload = json.load(response['Payload'])
            return(formattedPayload)       
