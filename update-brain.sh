#!/bin/bash
echo "git pull"
git pull origin master --tags


echo "git checkout"
git checkout tags/$1


echo "systemctl start"
systemctl restart risebox-brain.service