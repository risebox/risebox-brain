#!/bin/bash
# From here: https://gist.github.com/pete-otaqui/4188238

# works with a file called VERSION in the current directory,
# the contents of which should be a semantic version number
# such as "1.2"

# this script will display the current version, automatically
# suggest a "minor" version update, and ask for input to use
# the suggestion, or a newly entered value.

# once the new version number is determined, the script will
# pull a list of changes from git history, prepend this to
# a file called CHANGES (under the title of the new version
# number) and create a GIT tag.

if [ -f VERSION ]; then
    BASE_STRING=`cat VERSION`
    BASE_LIST=(`echo $BASE_STRING | tr '.' ' '`)
    V_MAJOR=${BASE_LIST[0]}
    V_MINOR=${BASE_LIST[1]}
    echo "Current version : $BASE_STRING"
    V_MINOR=$((V_MINOR + 1))
    if [ `echo "$V_MINOR % 10" | bc` -eq 0 ]; then
      V_MINOR=$((V_MINOR + 1)) # Skip .10, .20 etc... as not supported with Risebox api
    fi
    SUGGESTED_VERSION="$V_MAJOR.$V_MINOR"
    read -p "Enter a version number [$SUGGESTED_VERSION]: " INPUT_STRING
    if [ "$INPUT_STRING" = "" ]; then
        INPUT_STRING=$SUGGESTED_VERSION
    fi
    echo "Will set new version to be $INPUT_STRING"
    echo $INPUT_STRING > VERSION
    echo $BASE_STRING > ROLLBACK
    echo "Version $INPUT_STRING:" > tmpfile
    git log --pretty=format:" - %s" "v$BASE_STRING"...HEAD >> tmpfile
    echo "" >> tmpfile
    echo "" >> tmpfile
    cat CHANGES >> tmpfile
    mv tmpfile CHANGES
    git add CHANGES VERSION ROLLBACK
    git commit -m "Version bump to $INPUT_STRING"
    git tag -a -m "Tagging version $INPUT_STRING" "v$INPUT_STRING"
    git push origin && git push origin --tags
else
    echo "Could not find a VERSION file"
    read -p "Do you want to create a version file and start from scratch? [y]" RESPONSE
    if [ "$RESPONSE" = "" ]; then RESPONSE="y"; fi
    if [ "$RESPONSE" = "Y" ]; then RESPONSE="y"; fi
    if [ "$RESPONSE" = "Yes" ]; then RESPONSE="y"; fi
    if [ "$RESPONSE" = "yes" ]; then RESPONSE="y"; fi
    if [ "$RESPONSE" = "YES" ]; then RESPONSE="y"; fi
    if [ "$RESPONSE" = "y" ]; then
        echo "0.1" > VERSION
        echo "Version 0.1" > CHANGES
        git log --pretty=format:" - %s" >> CHANGES
        echo "" >> CHANGES
        echo "" >> CHANGES
        git add VERSION CHANGES
        git commit -m "Added VERSION and CHANGES files, Version bump to v0.1"
        git tag -a -m "Tagging version 0.1" "v0.1"
        git push origin && git push origin --tags
    fi

fi