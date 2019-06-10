#!/usr/bin/bash

dest=$1

# Check command line
if [ "X$dest" == "X-h" ] || [ "X$dest" == "X" ]; then
    echo ""
    echo "Usage: ./makedemo.sh destdir"
    echo "Where destdir is your destination directory and web accessible"
    echo ""
    exit 0
fi

# Make the destination directory
mkdir -p $dest
if [ ! -d $dest ]; then
    echo ""
    echo "Error: Unable to create destination directory ($dest)"
    echo ""
    exit 0
fi

# Make the JSAV and External subdirectories
mkdir -p $dest/JSAV

# Copy demo files
cp index.html index2.html index3.html jsav.cgi .htaccess $dest

# Copy JSAV and the external files
cp ../JSAV.* $dest/JSAV
cp -R ../external/ $dest/JSAV


