**How to set up a domain which forwards to the front-end app**  

- Ensure react app is running on the EC2 instance 
- Buy domain
-  run `sudo certbot certonly --manual -d <domain.com> -d <www.domain.com> --preferred-challenges=dns`
- Create a TXT DNS record for _acme-challenge.www.domain.com (with hostname `_acme-challenge.www`) with the value of the challenge key  
- Change the A record in the DNS to point to the public IP of the EC2 instance 
- Check for www.domain.com to see if the forwarding works 
- If the domain forwarding doesn’t work without `www.` prefix, add a CNAME entry with `www` as hostname and `domain.com` as target name
