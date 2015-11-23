#!/bin/bash
systemctl stop risebox-brain.service

git pull origin master --tags

git checkout tags/$1

systemctl start risebox-brain.service