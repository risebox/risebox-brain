#!/bin/bash
cd /home/risebox/risebox-brain
echo "Risebox Brain recovery program: now starting"

apiServer=rbdev-api.herokuapp.com
timeToWait=10
rollbackVersion=$(sudo cat ./ROLLBACK)
deviceKey=$(sudo cat .env | grep "RISEBOX_DEVICE_KEY=" | xargs echo | cut -f 2 -d '=')
echo "Your deviceKey is ${deviceKey}"

if [[ $(systemctl is-active risebox-brain.service) == "failed" ]]; then
  echo "Brain service is failed: waiting ${timeToWait} seconds to confirm"
  sleep $timeToWait

  if [[ $(systemctl is-active risebox-brain.service) == "failed" ]]; then
    echo "After ${timeToWait} secs, the Brain is still failed => Will notify server and rollback"
    curl http://$apiServer/rollback?device=$deviceKey&version=$rollbackVersion
    pwd
    sh ./update-brain.sh v$rollbackVersion

   # reboot
  fi
fi
