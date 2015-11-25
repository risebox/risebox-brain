#!/bin/bash
echo "Risebox Brain recovery program: now starting"

apiServer=rbdev-api.herokuapp.com
timeToWait=60
rollbackVersion=$(sudo cat ./ROLLBACK)
deviceKey=$(sudo cat .env | grep "RISEBOX_DEVICE_KEY=" | xargs echo | cut -f 2 -d '=')
echo "Your deviceKey is ${deviceKey}"

if [[ $(systemctl is-failed risebox-brain.service) == "failed" ]]; then
  echo "Brain service is failed: waiting ${timeToWait} minute to confirm"
  sleep $timeToWait

  if [[ $(systemctl is-failed risebox-brain.service) == "failed" ]]; then
    echo "After ${timeToWait} secs, the Brain is still failed => Will notify server and rollback"
    curl http://$apiServer/api/rollback?device=$deviceKey&version=$rollbackVersion

    ./update_brain.sh rollbackVersion

    reboot
  fi
fi