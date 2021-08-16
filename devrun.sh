#!/bin/sh

while true
do
	inotifywait -r -e modify -e create -e delete ./src/
	make
done
