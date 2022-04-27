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

    rds_host  = "tokens.cqra1unid8az.us-east-1.rds.amazonaws.com"
    name = "admin"
    password = "8QZ8qQc5GiK"
    db_name = "tokens"

    try:
        conn = pymysql.connect(host=rds_host, user=name, passwd=password, db = db_name, connect_timeout=5)
        print(conn)

    except pymysql.MySQLError as e:
        print(e)
        
  
    item_count = 0
    
    with conn.cursor() as cur:
        token_id = uuid.uuid4()
        tomorrow = datetime.now() + timedelta(hours=24)
        TTL = str(tomorrow.timestamp()).split('.')[0]
        query_string = "select * from session_tokens_test where username=\"{}\"".format(username)
        cur.execute(query_string)
        results = cur.fetchall()
        entries = len(results)

        if(entries==1):
            update_string = "UPDATE session_tokens_test SET end_date = \"{}\" WHERE username=\"{}\"".format(TTL, username)
            print(update_string)
            cur.execute(update_string)
            conn.commit()
        else:
            if(entries>1):
                update_string = "DELETE FROM session_tokens_test WHERE username=\"{}\"".format(username)
                print(update_string)
                cur.execute(update_string)
                conn.commit()                
            insert_string = "insert into session_tokens_test (tokenId, username, end_date) values(\"{}\", \"{}\", \"{}\")".format(token_id, username, TTL) 
            print(insert_string)
            cur.execute(insert_string)
            conn.commit()
    
        cur.execute("select * from session_tokens_test")
        for row in cur:
            item_count += 1
            print(row)
    
    payload_body = ({ 
        "body" : {
        "payload" : {"token_id" : str(token_id), "TTL" : TTL},
        "status" : "200"}
    })
    
 
    response = client.invoke(
        FunctionName = 'arn:aws:lambda:us-east-1:889543450939:function:sam-app-FormatReturnPayloadFunction-SXuwV8QL94XO',
        InvocationType = 'RequestResponse',
        Payload = json.dumps(payload_body)
    )
 
    conn.commit()
    formattedPayload = json.load(response['Payload'])
    return(formattedPayload)       
