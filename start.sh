#!/bin/bash
slotsFile="/sys/devices/bone_capemgr.9/slots"

checkAndLoadOverlay() {
  if [[ -n $(cat $slotsFile | grep $1) ]]; then
    echo "$1 is already loaded"
  else
    echo "$1" > $slotsFile
    echo "$1 loaded"
  fi
}

initSettingsFile() {
  if [[ -n $(ls settings | grep current-settings) ]]; then
    echo "Keeping existing settings file"
  else
    cp settings/default-settings.json settings/current-settings.json
    echo "Initialized a new settings file"
  fi
}

checkAndLoadOverlay "cape-bone-iio"

checkAndLoadOverlay "BB-W1"

checkAndLoadOverlay "hcsr04"

initSettingsFile

node src/main.js
