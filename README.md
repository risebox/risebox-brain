# risebox-brain
The brain of the Risebox

### Contents
- [Installation](#install)
- [Board wiring](#wiring)
- [Extras](#extras)
- [Run](#run)

##<a name="install"></a> Installation
0. SSH access to the board
  * Go to http://beagleboard.org/getting-started and do first 3 steps:
    * Step #1: Plug in your Beagle via USB
    * Step #2: Install drivers
    * Step #3: Browse to your Beagle
  see also https://learn.adafruit.com/ssh-to-beaglebone-black-over-usb/next-steps
  
  then use IP adress to connect in SSH
```
ssh 192.x.x.x -l root
```

  by default no home for root user, so create one and assign it to RISEBOX_HOME var:
```
cd /home
sudo mkdir risebox
export RISEBOX_HOME=/home/risebox
```

1. Network

Check Ethernet is working and that you have Internet connection by following [this](https://learn.adafruit.com/beaglebone/ethernet) tutorial.


2. Update system & Kernel
```
sudo apt-get update
```
also update Kernel to latest 3.8 linux (more info [here](http://elinux.org/Beagleboard:BeagleBoneBlack_Debian#Kernel_Upgrade))
```
cd /opt/scripts/tools/
git pull
sudo ./update_kernel.sh
sudo reboot
```

3. Setup Date & Time
```
date -s "August 24 10:00 UTC 2015"
```

4. Install temperature probe DS18B20

Create a folder  __/home/risebox/w1.dts__ with the following content:

```bash
/*
* Copyright (C) 2012 Texas Instruments Incorporated - http://www.ti.com/
*
* This program is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License version 2 as
* published by the Free Software Foundation.
* 
* Modified  by Russell Senior from the weather cape's DTS file.
* Minor formatting by C W Rose.
*/
/dts-v1/;
/plugin/;
 
/ {
    compatible = "ti,beaglebone", "ti,beaglebone-black";
    part-number = "BB-W1";
    version = "00A0";
 
    exclusive-use = "P9.12", "gpio1_28";
 
    fragment@0 {
        target = <&am33xx_pinmux>;
        __overlay__ {
             bb_w1_pins: pinmux_bb_w1_pins {
                 pinctrl-single,pins =  <0x078 0x37>; /* gpmc_ad13.gpio1_13, OMAP_PIN_INPUT_PULLUP | OMAP_MUX_MODE7 - w1-gpio */
             };
        };
    };
 
    fragment@1 {
        target = <&ocp>;
        __overlay__ {
            onewire@0 {
                status          = "okay";
                compatible      = "w1-gpio";
                pinctrl-names   = "default";
                pinctrl-0       = <&bb_w1_pins>;
 
                gpios = <&gpio2 28 0>;
            };
        };
    };
};
```

Taper la commande suivante: qui va créer le fichier __ BB-W1-00A0.dtbo__ dans le répertoire
```
dtc -O dtb -o BB-W1-00A0.dtbo -b 0 -@ w1.dts
```

Copier le fichier dtbo dans /lib/firmware
```
cp BB-W1-00A0.dtbo /lib/firmware
```

Activer le chargement de l’overlay par le capmanager
```
echo BB-W1 > /sys/devices/bone_capemgr.9/slots
```

Vérifier 
exécuter dmesg et vérifier que le chargement se fait correctement

```
[  255.761072] bone-capemgr bone_capemgr.9: part_number 'BB-W1', version 'N/A'
[  255.761258] bone-capemgr bone_capemgr.9: slot #7: generic override
[  255.761308] bone-capemgr bone_capemgr.9: bone: Using override eeprom data at slot 7
[  255.761359] bone-capemgr bone_capemgr.9: slot #7: 'Override Board Name,00A0,Override Manuf,BB-W1'
[  255.761616] bone-capemgr bone_capemgr.9: slot #7: Requesting part number/version based 'BB-W1-00A0.dtbo
[  255.761668] bone-capemgr bone_capemgr.9: slot #7: Requesting firmware 'BB-W1-00A0.dtbo' for board-name 'Override Board Name', version '00A0'
[  255.772149] bone-capemgr bone_capemgr.9: slot #7: dtbo 'BB-W1-00A0.dtbo' loaded; converting to live tree
[  255.774000] bone-capemgr bone_capemgr.9: slot #7: #2 overlays
```

Vérifier qu’un répertoire 28-* se trouve dans __/sys/devices/w1_bus_master1__
```
ls /sys/devices/w1_bus_master1/
```

Tutos interessants sur cette partie (1Wire, Device Tree, Kernel, Capemanager...)
http://www.beerfactory.org/beaglebone-black-releve-de-temperature-sur-bus-1-wire/
http://derekmolloy.ie/gpios-on-the-beaglebone-black-using-device-tree-overlays/
https://github.com/derekmolloy/boneDeviceTree/tree/master/docs
https://groups.google.com/forum/#!topic/beagleboard/9mr7pXepmss
https://learn.adafruit.com/introduction-to-the-beaglebone-black-device-tree/exporting-and-unexporting-an-overlay
http://www.bonebrews.com/temperature-monitoring-with-the-ds18b20-on-a-beaglebone-black/

4. Humdity & Temp Probe

Follow this [tutorial](https://learn.adafruit.com/dht-humidity-sensing-on-raspberry-pi-with-gdocs-logging/software-install-updated) Adafruit

5. PH Meter Pro Probe

Alimenter la sonde en 5v (P9_7 SYS 5V)
Raccorder la terre sonde à la terre de l’adc (PIN 9_34)
et faire un pond diviseur de tension à la sortie de la sonde et raccorder le point médian à une entrée analogique (P9_36 par ex).

Dans Bone script : Faire un analogRead(“P9_36”, callback());

X.value permet d’avoir une décimale entre 0 et 1. (0= 0v 1= la tension maximale, =5v en sortie de la sonde).
la formule est Ph = x.value * 5 * 3,5 + offset (mesuré avec la sonde bleu à 0,15).

6. Light control using PWM 

http://www.blaess.fr/christophe/2013/07/06/beaglebone-black-et-pwm/

var b = require('bonescript');
b.analogWrite('P9_14', 0.1, 2000, printJSON);
b.analogWrite('P9_16', 0.1, 2000, printJSON);
function printJSON(x) { console.log(JSON.stringify(x)); }

Le fait de lancer le script JS charge les overlays BSPWM sur les pins utilisée (ici P9_14 et P9_16) suivants dans le capemanager 
```
8: ff:P-O-L Override Board Name,00A0,Override Manuf,bspwm_P9_14_6
9: ff:P-O-L Override Board Name,00A0,Override Manuf,bspwm_P9_16_6
```

Dans __/sys/devices/ocp.x/bspwm_test_P9_16.yy__ on trouve :
le fichier polarity qui doit être à 0.
le fichier period qui est par défaut à 500 000 (unité est nanoseconde)
le fichier duty (la durée des impulsions entre 0 et 500 000. 0 tout le temps étient et 500 000 tout le temps allumé).

NB : Si on teste au moyen de l'interface web beagleboard.org, attention, il faut supprimer la line qui appelle pinMode, et rebooter apres avoir changé polarity.

7. SN-HC-SR04 Ultrasonic Distance Sensor

https://github.com/luigif/hcsr04

Pas besoin de désactiver le HDMI: it works.

8. Water overflow & level probe

Branchement classique. On utilise des pins GPIO libres (ex : P8_7 et P8_8), et on met une resistance 10KOhm entre le 3.3V et la GPIO.

Code example du site beagleboard : 

9. Setup Dev environment
 * Copy public & private rsa keys for brain-dev (available in vault)
 
 * Follow Github Tutorial about [ssh-keys](https://help.github.com/articles/generating-ssh-keys/) starting at step 3
 
 * Clone Risebox-brain project
```bash
cd /var/lib/cloud9
git clone git@github.com:risebox/risebox-brain.git
```

 * Change commiter username & email for risebox-brain project
```bash
git config --global user.name "Brain Dev"
git config --global user.email "brain-dev@risebox.co"
```

 * Run cloud9 IDE 
 Open browser at address xxx:xxx:xxx:xxx:3000
 
##<a name="wiring"></a>Current BBB wiring
```
P9_12 : retour de la sonde ds18b20
P9_15 : retour de la sonde DHT22
P9_14 : pwm leds bleues upper
P9_16 : pwm leds rouges upper
P8_13 : pwm leds blanches upper
P?_?? : pwm leds bleues lower
P?_?? : pwm leds rouges lower
P?_?? : pwm leds blanches lower
P9_34 : AGND - masse de l’ADC relié à la masse de la sonde PH
P9_36 : retour analogique de la sonde Ph (milieu du pont diviseur de tension)
P9_8  : alim de la sonde PH
P8_12 : Trigger sonde ultrason
P8_11 : eco sonde ultrasons
P8_7  : niveau d’eau upper - cycle (fil noir)
P8_8  : niveau d’eau upper - débordement (fil rouge)
P8_9  : niveau d’eau lower - cycle (fil noir)
P8_10 : niveau d’eau lower - débordement (fil rouge)
P8_15 : déclenchement des ventilos
P8_16 : arret de la pompe
```

10. Setup Wifi

Get this [PDF](https://learn.adafruit.com/downloads/pdf/setting-up-wifi-with-beaglebone-black.pdf) from Adafruit.
Follow instructions:

* Check that wlan0 is present but not assigned by running the following command
```
iwconfig
```

* Edit network interfaces
```
vi /etc/network/interfaces
```

* Uncomment these 3 lines & put edit your network's __SSID__ and __password__
```
# WiFi Example
#auto wlan0
#iface wlan0 inet dhcp
# wpa-ssid "essid"
# wpa-psk "password"
```

* Test the connection by running the following to bring up the WiFi connection manually:
```
ifup wlan0
```
You should see an IP address acquired with DHCP

Then finally reboot your system:
```
reboot
```

##<a name="extras"></a>Extras

1. Comment supprimer le code HDMI (peut être utile pour certaines PINs)

Voir ce [tuto](https://learn.adafruit.com/setting-up-wifi-with-beaglebone-black/hardware) pour expliquer comment faire.


```
mkdir /mnt/boot
mount /dev/mmcblk0p1 /mnt/boot
vi /mnt/boot/uEnv.txt
```

puis éditer décommenter la ligne qui concerne le HDMI (et HDMI seulement). __NE PAS TOUCHER à la ligne HDMI/eMMC__ sous peine de ne plus booter sur la mémoire flash.

Puis rebooter le BBB.

Pour vérifier que le HDMI est bien désactivé, faire un __cat /sys/devices/bone_capemgr.9/slots__ il ne doit pas y avoir de L (qui signifie activé) cf ci-dessous.
```
0: 54:PF--- 
 1: 55:PF--- 
 2: 56:PF--- 
 3: 57:PF--- 
 4: ff:P-O-L Bone-LT-eMMC-2G,00A0,Texas Instrument,BB-BONE-EMMC-2G
 5: ff:P-O-- Bone-Black-HDMI,00A0,Texas Instrument,BB-BONELT-HDMI
 6: ff:P-O-- Bone-Black-HDMIN,00A0,Texas Instrument,BB-BONELT-HDMIN
 7: ff:P-O-L Override Board Name,00A0,Override Manuf,BB-W1
 8: ff:P-O-L Override Board Name,00A0,Override Manuf,cape-bone-iio
```

##<a name="run"></a>Run

To run the brain program, use __start.sh__ script

```bash
cd /var/lib/cloud9/risebox-brain
./start.sh
```

