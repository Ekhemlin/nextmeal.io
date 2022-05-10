# Debugging RDS connections 


## My DB instance is in a public subnet, and I can't connect to it over the internet from my local computer

This issue can occur when the **Publicly Accessible** property of the DB instance is set to **No**. To check whether a DB instance is publicly accessible, you can use the Amazon RDS Console or the AWS CLI.

To change the **Publicly Accessible** property of the Amazon RDS instance to **Yes**:

1. Verify that your [VPC has an internet gateway attached to it](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html#Add_IGW_Attach_Gateway). Make sure that the inbound rules for the security group allow connections.

2. Open the [Amazon RDS console](https://console.aws.amazon.com/rds/).

3. Choose **Databases** from the navigation pane, and then select the DB instance.

4. Choose **Modify**.

5. Under **Connectivity**, extend the **Additional configuration** section, and then choose **Publicly accessible**.

6. Choose **Continue**.

7. Choose **Modify DB Instance**.

  

## More steps:  

[https://aws.amazon.com/premiumsupport/knowledge-center/rds-cannot-connect/](https://aws.amazon.com/premiumsupport/knowledge-center/rds-cannot-connect/)

  

- Add rules in inbound for TCP all ipv4 and v6
- Set a database name through the configuration. Its not the same as instance identifier
- You can connect without db_name, but then you'll need to run `cur.execute("CREATE DATABASE < db name>")`

 
