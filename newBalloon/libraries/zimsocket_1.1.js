// ZIM - http://zimjs.com - Code Creativity!
// JavaScript Canvas Framework for General Interactive Media
// free to use - donations welcome of course! http://zimjs.com/donate

// ZIM SOCKET - see http://zimjs.com/socket for examples and server info

// ~~~~~~~~~~~~~~~~~~~~~~~~
// DESCRIPTION - coded in 2015 (c) Inventor Dan Zen http://danzen.com
// zimsocket.js provides code for multiuser sockets to share properties
// a client sends properties and receives objects of others' properties
// requires socket.io and a server running NodeJS and zimserver.js

// ~~~~~~~~~~~~~~~~~~~~~~~~
// DOCS

/*--
zim.Socket = function(server, appName, roomName, maxPeople, fill, initObj)

Socket class

extends a zim EventDispatcher (with the normal event object replaced by a data param)
var socket = new zim.Socket(parameters);
requires a NodeJS server running zimserver.js with SocketIO on server and client
sets up a multiuser socket with apps and rooms (sets of rooms if max is set)
can choose to fill in empty spots from people leaving with new people
client sends property changes and receives objects of others' properties
server handles data, joining, leaving, changing rooms and history
this means there is no need for server side programming

PARAMETERS
server - the server that is running node and the zimsocket.js / portNumber
appName - you make this up - it should be one word (or joined words) and unique for your app
roomName - optional room name otherwise just uses a default room (can represent many rooms if maxPeople is set)
maxPeople - how many people are allowed per room - default is 0 which is virtually unlimited
fill - boolean - should we fill in vacated spots in a room - default is true

METHODS
changeRoom(appName, roomName, maxPeople, fill, initObj) - this removes socket from current room and joins appName, roomName - socket.id remains the same
requestTime() - triggers a time event with parameter object holding masterTime, joinTime and currentTime
requestSync() - resyncs your other clients' data, time, history and last info with the server data
on(), off(), offAll() - methods inherited from zim.EventDispatcher

> SETTING YOUR PROPERTIES
setProperty(propertyName, propertyValue) - sets your property to the value and sends out change to all in room (distributes)
setProperties(objectOfPropertiesToSet) - pass in an object with properties and values and it sets yours to match and distributes them

> GETTING PROPERTIES AND PROPERTY OBJECTS
-- note: the relevant property objects are sent as a parameter on join, otherjoin and data events
-- which means we often do not need these methods
-- note: the data event sends a parameter with only the data currently being sent
-- so if you want all the data belonging to the sender, use getSenderData() below
getMyProperty(propertyName) - gets your own value for property name
getMyData() - gets your own data object
getOtherProperty(id, propertyName) - gets another client's value for property name
getOtherData(id) - gets another client's object of properties
getSenderProperty(propertyName) - gets sender client's value for property name
getSenderData() - gets sender client's object of properties
getProperties(propertyName) - returns an array of values for the propertyName of others - for x we might get [12, 14, 33, etc.]
getData() - returns an object of all client objects by id (does not include this (my) client)

> GETTING LATEST INFORMATION
getLatestValue(propertyName) - returns the last distributed value for the property you pass to it - could be yours
getLatestTime(propertyName) - returns the time from the server that the latest property was stored (can use for recreating layer levels)	
getLatestValueID(propertyName) - returns the id of the last person to distribute a value for the property you pass to it
getLatestProperties(propertyName) - returns an array of the last property names to be distributed (sometimes multiple properties are distributed at once)

> HISTORY
appendToHistory(someText) - adds the text passed to it to the history file for the room (deleted if room is empty)
clearHistory() - sets the history for the room to ""

> TO DISCONNECT
dispose() returns void - removes listeners, closes socket, deletes data objects - must make a new Socket object to connect

PROPERTIES (READ ONLY)
server - the server you set
applicationName - the name of your application
roomName - the room name (may represent many rooms if maxPeople is set)
maxPeople - see PARAMETERS
fill - see PARAMETERS
socket - the SocketIO client socket object
ready - a ready event has been dispatched
masterTime - when the server started
joinTime - when socket joined the current room
id - the id of the client socket
senderID - the id of the last person to send out data
lastJoinID - the id of the last person to join (not you)
lastLeaveID - the id of the last person to leave (not you)
history - the history text for your room at the time of application start
size - how many other people are in the room (not including you)

EVENTS
ready -	socket is connected and a room has been assigned (receives room data)
roomchange - this socket joined another room (receives room data)
error - trouble connecting - make sure server is running and you have the right port
data - dispatched when someone in the room makes a change (receives other's data)
otherjoin - dispatched when another person joins (receives other's data)
otherleave - dispatched when another person leaves (receives other's data)
time - event from requestTime method with event object having masterTime and currentTime properties
synch - event from requestSync method with event object has all the data from the server
disconnect - the socket is closed - could be that socketIO stops for some reason - all data on the server will be lost
--*/


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ZIM MODULE AND BORROWED ZIM CODE

var zim = function(zim) {

/*-- // borrowed from ZIM Wrap
zog(item1, item2, etc.) ~ log
a wrapper for console.log()
--*/
var zog = console.log.bind(console);

if (zon) zog("ZIM SOCKET Module");

/*-- // borrowed from ZIM Wrap
zot(value)              ~ not
test to see if value has no value (value must exist as var or parameter)
or if value has been set to null
good for setting function defaults: if (zot(speed)) speed=1;
--*/
function zot(v) {
	if (v === null) return true;
	return typeof v === "undefined";
}

/*-- // borrowed from ZIM Code
zim.merge = function(objects)
merges any number of objects {} you pass in as parameters
overwrites properties if they have the same name
--*/
	zim.merge = function() {
		var obj = {}; var i; var j;
		for (i=0; i<arguments.length; i++) {
			for (j in arguments[i]) {
				if (arguments[i].hasOwnProperty(j)) {
					obj[j] = arguments[i][j];
				}
			}
		}
		return obj;
	}

/*-- // borrowed from ZIM Code
zim.copy = function(obj)
copies arrays and basic objects
http://stackoverflow.com/users/35881/a-levy
--*/
	zim.copy = function(obj) {
		if (obj==null || typeof obj != 'object') return obj;
		if (obj instanceof Array) {
			return obj.slice(0);
		}
		if (obj instanceof Object) {
			var copy = {};
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = zim.copy(obj[attr]);
			}
			return copy;
		}
	}

/*-- // borrowed from ZIM Code - modified to remove event object and add general obj
zim.EventDispatcher = function(target)
handles adding, removing and dispatching events
--*/
	zim.EventDispatcher = function(target) {
		this.listeners = {};
		this.target = target;
		that = this;
		this.addEventListener = function (type, listener) {
			if (!that.listeners[type]) {
				that.listeners[type] = [];
			}
			that.listeners[type].push(listener);
		}
		this.removeEventListener = function (type, listener) {
			var listenList = that.listeners[type];
			for (var i=0; i<listenList.length; i++) {
				if (listenList[i] === listener) {
					listenList.splice(i, 1);
				}
			}
		}
		this.removeAllEventListeners= function() {
			this.listeners = {};
		}
		this.dispatchEvent = function (type, params) {
			var listenList = that.listeners[type];
			var success = false;
			if (listenList) {
				for (var i=0; i<listenList.length; i++) {
					try {
						listenList[i].call(that, params);
						success = true;
					} catch (e) {
						zog("ZIM DispatchEvent() error: " + type + " " + e);
					}
				}
			}
			return success;
		}
		this.on = this.addEventListener;
		this.off = this.removeEventListener;
		this.offAll = this.removeAllEventListeners;
	}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ZIM SOCKET CODE

	zim.Socket = function(server, appName, roomName, maxPeople, fill, initObj) {

		zim.EventDispatcher.call(this, this);

		if (zot(server)) server = this.server = "http://localhost:3000/";
		if (zot(appName) || appName == "") {zog("zim socket - Socket():\nmust provide app name"); return;}

		this.ready = false;
		var that = this;
		var noSocket = "zim socket - Socket(): sorry no socket";
		var socket;
		var data;
		var historyString;
		var current; // {id:{id:"a2s2d24fa2sd", x:20, y:30}, id2:{id2:831kh4597kh, x:22, y:66}}
		var last;  // {id:lastUpdaterID, properties:{text:[id,"hi"], x:[id2,100], y:[id3,"10"]}}
		var my; // {id:"asfwer3231dsa", x:22, y:44, text:"cool"}

		function connect() {
			socket = that.socket = io.connect(server);
		}
		connect();
		socket.on("connect", function() {
			addEventListeners();
			joinRoom(appName, roomName, maxPeople, fill, initObj);
		});

		function addEventListeners() {
			socket.on("join", join);
			socket.on("receive", receive);
			socket.on("time", time);
			socket.on("sync", sync);
			socket.on("otherleave", otherLeave);
			socket.on("connect_error", connectError);
			socket.on("disconnect", disconnect);
		}

		function joinRoom(appName, roomName, maxPeople, fill, initObj) {
			if (zot(appName) || appName == "") {zog("zim socket - Socket():\nmust provide app name"); return;}
			appName = this.applicationName = appName.replace(/\s/, "").toLowerCase();
			if (roomName) {this.roomName = roomName.replace(/\s/, "").toLowerCase();} // can be null
			if (zot(maxPeople)) maxPeople = this.maxPeople = 0;
			if (zot(fill)) fill = this.fill = true; // fills in room if people leave

			data = {appName:appName, roomName:roomName, maxPeople:maxPeople, fill:fill, initObj:initObj};
			my = initObj || {};
			socket.emit('join', data);
		}


		// --------------    EVENTS   ---------------

		function join(data) {
			// event when this person joins a room
			that.masterTime = data.masterTime;
			that.joinTime = data.joinTime;
			historyString = data.history;
			last = data.last;
			current = data.current;
			that.id = my.id = data.id;
			if (!that.ready) {
				that.dispatchEvent("ready", current);
				that.ready = true;
			} else {
				that.dispatchEvent("roomchange", current);
			}
		}

		function receive(data, type) {
			// event for receiving data from another person
			var id = that.senderID = data.id;
			// update current values
			current[id] = zim.merge(current[id], data);
			// update last information (responsible for keeping last up to date)
			last.id = id;
			for (var i in data) {
				last.properties[i] = [id, data[i]];
			}
			if (type == "message") {
				that.dispatchEvent("data", data); // for other people's
			} else if (type == "join") {
				that.lastJoinID = id;
				that.dispatchEvent("otherjoin", data);
			}
		}

		function time(data) {
			// event for receiving time (masterTime and currentTime)
			data.joinTime = that.joinTime;
			that.dispatchEvent("time", data);
		}

		function sync(data) {
			// event for syncing data
			that.masterTime = data.masterTime;
			that.joinTime = data.joinTime;
			historyString = data.history;
			last = data.last;
			current = data.current;
			that.id = my.id = data.id;
			that.dispatchEvent("sync", data);
		}

		function otherLeave(id) {
			// event when another person leaves the room
			that.lastLeaveID = id;
			that.dispatchEvent("otherleave", current[id]);
			// data is removed as other leaves so update current and last
			// after we dispatch otherleave event to give chance to see their data
			delete current[id];
			// note, the leaving client's id is still kept in the last data
		}

		function connectError() {
			that.ready = false;
			that.dispatchEvent("error");
			removeEventListeners();
		}

		function disconnect() {
			zog("disconnect");
			that.ready = false;
			that.dispatchEvent("disconnect");
			removeEventListeners();
		}

		window.onbeforeunload = function (e) {
			that.ready = false;
			that.dispatchEvent("disconnect");
			removeEventListeners();
		}


		// --------------    MISC   ---------------

		function removeEventListeners() {
			socket.removeEventListener("receive", receive);
			socket.removeEventListener("join", join);
			socket.removeEventListener("time", time);
			socket.removeEventListener("sync", sync);
			socket.removeEventListener("otherleave", otherLeave);
			socket.removeEventListener("connect_error", connectError);
			socket.removeEventListener("disconnect", disconnect);
		}

		// various socketio connect errors are not firing for me
		var connectionTries = 0;
		var timer = window.setInterval(function() {
			if (socket.connected) {
				window.clearInterval(timer);
			} else {
				connectionTries++;
				if (connectionTries > 4) {
					window.clearInterval(timer);
					that.dispatchEvent("error");
					socket.disconnect();
				} else {
					connect();
				}
			}
		}, 1000);


		// --------------    PROPERTIES   ---------------

		Object.defineProperty(this, 'history', {
			get: function() {
				return historyString;
			},
			set: function(value) {
				zog("zim socket - Socket(): history is read only (try appendToHistory() and clearHistory() methods)");
			}
		});

		Object.defineProperty(this, 'size', {
			get: function() {
				var count = 0;
				for (var i in current) count++;
				return count;
			},
			set: function(value) {
				zog("zim socket - Socket(): size is read only (perhaps see maxPeople)");
			}
		});


		// --------------    METHODS   ---------------

		this.changeRoom = function(appName, roomName, maxPeople, fill, initObj) {
			joinRoom(appName, roomName, maxPeople, fill, initObj);
			// will trigger a ZIM Socket ready event for this client
			// will trigger a ZIM Socket otherleave and otherjoin events for other clients
		}

		this.requestTime = function() {
			socket.emit('time'); // will trigger a ZIM Socket time event
		}

		this.requestSync = function() {
			socket.emit('sync'); // will trigger a ZIM Socket sync event
		}

		// SETTING YOUR PROPERTIES

		this.setProperty = function(propertyName, propertyValue) {
			if (!socket) {zog(noSocket); return;}
			if (zot(propertyName)) {zog("zim socket - Socket.setProperty(): please enter property name"); return;}
			var object = {};
			object[propertyName] = propertyValue;
			my[propertyName] = propertyValue;
			socket.emit('message', object);
			// will trigger a ZIM Socket data event for other clients in the room
		}

		this.setProperties = function(object) {
			if (!socket) {zog(noSocket); return;}
			if (zot(object) || typeof object !== 'object' || Array.isArray(object)) {zog("zim socket - Socket.setProperties(): please enter object of properties"); return;}
			my = zim.merge(my, object);
			socket.emit('message', object);
			// will trigger a ZIM Socket data event for other clients in the room
		}

		// GETTING PROPERTIES AND PROPERTY OBJECTS

		this.getMyProperty = function(propertyName) {
			// gets your own value for property name
			return my[propertyName];
		}

		this.getMyData = function() {
			// gets your own data object
			return my;
		}

		this.getOtherProperty = function(id, propertyName) {
			// gets another client's value for property name
			if (!current[i]) return;
			return current[id][propertyName];
		}

		this.getOtherData = function(id) {
			// gets another client's object of properties
			return current[i];
		}

		this.getSenderProperty = function(propertyName) {
			// gets sender client's value for property name
			if (!that.senderID) return;
			if (!current[that.senderID]) return;
			return current[that.senderID][propertyName];
		}

		this.getSenderData = function() {
			// gets sender client's object of properties
			if (!that.senderID) return;
			return current[that.senderID];
		}

		this.getProperties = function(propertyName) {
			// returns a array of values for the propertyName of others - for x we might get [12, 14, 33, etc.]
			if (zot(propertyName)) return;
			var list = []; var val;
			for (var i in current) {
				val = current[i][propertyName];
				if (val) list.push(val);
			}
			return list;
		}

		this.getData = function() {
			// returns object of all client data (not own)
			return current;
		}


		// LATEST

		this.getLatestValue = function(propertyName) {
			// gets latest value of a property
			if (zot(last.properties[propertyName])) return undefined;
			return last.properties[propertyName][1];
		}
		
		this.getLatestTime = function(propertyName) {
			// gets latest time of a property
			if (zot(last.properties[propertyName])) return undefined;
			return last.properties[propertyName][2];
		}

		this.getLatestValueID = function(propertyName) {
			// gets id of latest updater for a property
			if (zot(last.properties[propertyName])) return undefined;
			return last.properties[propertyName][0];
		}

		this.getLatestProperties = function() {
			// gets an array of the last properties (names) sent - could be one or more
			var list = [];
			for (var property in last.properties) {
				if (last.properties[property][0] == last.id) {
					list.push(property);
				}
			}
			return list;
		}

		// HISTORY

		this.appendToHistory = function(someText) {
			// sends text to be stored on history
			// need to send \n as well if desired
			// only used for new people to join
			if (!socket) {zog(noSocket); return;}
			socket.emit('history', someText);
		}

		this.clearHistory = function() {
			if (!socket) {zog(noSocket); return;}
			historyString = "";
			socket.emit('clearhistory');
		}

		// TO DISCONNECT

		this.dispose = function() {
			socket.disconnect();
			removeEventListeners();
			current = null;
			last = null;
			// will trigger a ZIM Socket otherleave event for other clients in the room
		}

	}
	zim.Socket.prototype = new zim.EventDispatcher();
	zim.Socket.prototype.constructor = zim.Socket;


	return zim;
} (zim || {});
if (!window.zns) Socket = zim.Socket;
