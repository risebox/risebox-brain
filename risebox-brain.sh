#!/bin/bash
slotsFile="/sys/devices/bone_capemgr.9/slots"
PWMPolarityFiles="/sys/devices/ocp.*/bs_pwm_test_P*/polarity"

checkAndLoadOverlay() {
  if [[ -n $(cat $slotsFile | grep $1) ]]; then
    echo "$1 is already loaded"
  else
    echo "$1" > $slotsFile
    echo "$1 loaded"
  fi
}

waitUntilPWMisLoaded() {
  while [ $(find $PWMPolarityFiles | wc -l) -lt 3 ]
  do
    sleep 1
  done
}

initSettingsFile() {
  if [[ -n $(ls settings | grep current-settings) ]]; then
    echo "Keeping existing settings file"
  else
    cp settings/default-settings.json settings/current-settings.json
    echo "Initialized a new settings file"
  fi
}

cd /home/risebox/risebox-brain

checkAndLoadOverlay "cape-bone-iio"

checkAndLoadOverlay "BB-W1"

checkAndLoadOverlay "hcsr04"

#activate pwm
checkAndLoadOverlay "am33xx_pwm"

#register pwm pins
#state led
checkAndLoadOverlay "bspwm_P8_34"
#upper leds
checkAndLoadOverlay "bspwm_P9_29"
checkAndLoadOverlay "bspwm_P9_31"
checkAndLoadOverlay "bspwm_P9_42"
#lower leds
checkAndLoadOverlay "bspwm_P8_36"
checkAndLoadOverlay "bspwm_P8_45"
checkAndLoadOverlay "bspwm_P8_46"

#waitUntilPWMisLoaded

initSettingsFile

exec node src/main.js
