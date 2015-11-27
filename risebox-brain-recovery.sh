#!/bin/bash
cd /home/risebox/risebox-brain
echo "Risebox Brain recovery program: now starting"

apiServer=rbdev-api.herokuapp.com
timeToWait=10
rollbackVersion=$(sudo cat ./ROLLBACK)
deviceKey=$(sudo cat .env | grep "RISEBOX_DEVICE_KEY=" | xargs echo | cut -f 2 -d '=')
userEmail=$(sudo cat .env | grep "RISEBOX_USER_EMAIL=" | xargs echo | cut -f 2 -d '=')
userSecret=$(sudo cat .env | grep "RISEBOX_USER_SECRET=" | xargs echo | cut -f 2 -d '=')
echo "Your deviceKey is ${deviceKey}"

if [[ $(systemctl is-active risebox-brain.service) == "failed" ]]; then
  echo "Brain service is failed: waiting ${timeToWait} seconds to confirm"
  sleep $timeToWait

  if [[ $(systemctl is-active risebox-brain.service) == "failed" ]]; then
    echo "After ${timeToWait} secs, the Brain is still failed => Will notify server and rollback"
    curl https://$apiServer/api/devices/$deviceKey/brain_rollback --data "version=${rollbackVersion}" -H "Accept: application/json" -H "RISEBOX-USER-EMAIL: ${userEmail}" -H "RISEBOX-USER-SECRET: ${userSecret}"
    sh ./update-brain.sh v$rollbackVersion

    systemctl start risebox-brain.service
  fi
fi
