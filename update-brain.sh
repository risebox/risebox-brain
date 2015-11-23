#!/bin/bash
git pull origin master --tags

git checkout tags/$1

systemctl restart risebox-brain.service