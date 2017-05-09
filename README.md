# Contexty.US

Much of my communication today happens through text messaging platforms and e-mail. I frequently find myself digging through hundreds of old messages and using obtuse search tools trying to find a specific link or article a friend has shared with me. To address this problem I built an application to help users parse out different threads in their conversations. Contexty.us is a real-time messaging application that allows users to tag messages within their conversations and filter the conversations using those tags


## Installation

To run contexty.us locally:

* Ensure that [Node.js](https://nodejs.org/en/) is installed
* Ensure that [MongoDB](https://www.mongodb.com/) is installed
* `npm install` dependencies, ensure the `postinstall` grunt script has run successfully
* By default contexty.us will look for a MongoDB on localhost at port 27017, an environmental variable (`MONGODB_URI`) can be specified to override the default.


## Technologies Used

* Node.js
* Express.js
* AngularJS
* MongoDB
* Socket.IO
* Mongoose
* Passport
* Angular Material
* Grunt
* CSS3
* HTML5
