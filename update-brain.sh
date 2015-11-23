#!/bin/bash
echo "git pull"
git pull origin master --tags


echo "git checkout"
git checkout tags/$1
