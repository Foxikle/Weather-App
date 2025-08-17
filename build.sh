docker build --no-cache --network host --progress plain -t weather-frontend .
docker save -o weather-frontend.tar weather-frontend:latest

## shellcheck disable=SC2087
#ssh mancave <<EOF
#echo "$sudo_password" | sudo -S docker stop \$(echo "$sudo_password" | sudo -S docker ps -a -q --filter "ancestor=weather-frontend:latest")
#echo "$sudo_password" | sudo -S docker rm \$(echo "$sudo_password" | sudo -S docker ps -a -q --filter "ancestor=weather-frontend:latest")
#echo "$sudo_password" | sudo -S docker rmi weather-frontend:latest
#
#scp weather-frontend.tar tristan@ManCave:~/
#echo "$sudo_password" | sudo -S docker load -i weather-frontend.tar
#./startWeatherFrontend.sh
#rm weather-frontend.tar
#EOF
#
## Clean up local files
#rm weather-frontend.tar