import requests
import pymysql
import sys
import uuid
import json 
from datetime import datetime, timedelta

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
        return(e)
    
    item_count = 0
    
    with conn.cursor() as cur:
        token_id = uuid.uuid4()
        tomorrow = datetime.now() + timedelta(hours=24)
        TTL = str(tomorrow.timestamp()).split('.')[0]
        query_string = "insert into session_tokens_test (tokenId, username, end_date) values(\"{}\", \"{}\", \"{}\")".format(token_id, username, TTL) 
        print(query_string)
        cur.execute(query_string)
        conn.commit()
        cur.execute("select * from session_tokens_test")
        for row in cur:
            item_count += 1
            print(row)
    conn.commit()
