echo "Deploying files to server...."

scp -r * root@192.241.134.19:/var/www/192.241.134.19/


echo "Done"


server {
    listen 0.0.0.0:80;
    server_name 165.227.202.2;

    location / {
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $http_host;
      proxy_set_header X-NginX-Proxy true;

      proxy_pass http://165.227.202.2:8080/;
      proxy_redirect off;
    }

    location /overview {
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $http_host;
      proxy_set_header X-NginX-Proxy true;

      proxy_pass http://165.227.202.2:8080/overview;
      proxy_redirect off;
    }

    location /api {
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $http_host;
      proxy_set_header X-NginX-Proxy true;

      proxy_pass http://165.227.202.2:8080/api;
      proxy_redirect off;
    }
 }




