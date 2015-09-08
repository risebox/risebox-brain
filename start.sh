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

checkAndLoadOverlay "cape-bone-iio"

checkAndLoadOverlay "BB-W1"

checkAndLoadOverlay "hcsr04"

node main.js
