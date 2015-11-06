ROOT_DIR=/home/risebox/risebox-brain
cd $ROOT_DIR

if [[ -n $(ls $ROOT_DIR | grep dependencies) ]]; then
  echo "Dependencies folder exists" 
else
  echo "Creating dependencies folder" 
  mkdir $ROOT_DIR/dependencies
fi

#dtc -O dtb -o ./dependencies/BB-W1-00A0.dtbo -b 0 -@ ./lib/w1.dts
#cp ./dependencies/BB-W1-00A0.dtbo /lib/firmware
#echo BB-W1 > /sys/devices/bone_capemgr.9/slots

git clone https://github.com/adafruit/Adafruit_Python_DHT.git ./dependencies/Adafruit_Python_DHT
cd ./dependencies/Adafruit_Python_DHT
sudo apt-get install build-essential python-dev python-openssl
sudo python setup.py install

cd $ROOT_DIR/dependencies
cp -r ../lib/hcsr04-master ./hcsr04-master
cd hcsr04-master
make
make install
sudo sh -x ./install-driver.sh
