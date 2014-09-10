UCLA schedule of classes web scraper
====================================

![Main image](http://i.imgur.com/oCrLA6e.png)

Proof-of-concept web scraper that uses Node.js and the request and cheerio libraries to scrape
data from the UCLA schedule of classes and store the data in
mongodb. The data is not intended for commercial use.

Installation and usage
----------------------

### Requirements: mongodb
### Tested on: Ubuntu 12.04

First clone the repository with

    git clone https://github.com/DarinM223/ucla-web-scraper.git

Then in the root directory of the project, enter:

    npm install

To install the dependencies. To run the server, enter:

    node main.js

Right now after it finishes adding all of the courses it will hang
and you will have to end the process by pressing Ctrl-C.

The scraper should take around 10-20 minutes to run on an i5
processor. Because it uses the cluster library to efficiently use
all of the cores, processors with more cores will be faster. Right now it only stores data from the Fall 2014 quarter.
To view some of the data, enter:

    mongo
    use ucla
    db["14F"].find()

To view how much data was saved, enter inside the mongo console:

    db["14F"].find().count()

It should return around 2700-2800 elements
