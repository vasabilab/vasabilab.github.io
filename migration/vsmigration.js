var socket = null;

var addressValue = null;
var srclogBox = null;
var dstlogBox = null;
var updlogBox = null;
var bar = null;
var barST = null;
var statusCT = null;
var statusST = null;
var finalMsg = null;

var refreshOnCloseFlag = 0; // in case of user refresh

function setProgressBar(bartype, p){
	
	if(bartype == "ct"){
	    statusCT.innerHTML = p + "%";
	    bar.value = p;
	
	    if(p == 100){
		    statusCT.innerHTML = "100%";
		    bar.value = 100;
		//document.getElementById('finalMessage').innerHTML = "Migration Completed";
	    }
	}
	else if(bartype == "st"){
	    statusST.innerHTML = p + "%";
	    barST.value = p;
	
	    if(p == 100){
		    statusST.innerHTML = "100%";
		    barST.value = 100;
		    finalMsg.innerHTML = "Migration Completed";
	    }
    }
}

function addToLog(logtype, log) {
  if(logtype == 1){ // srclog
    srclogBox.value += log + '\n'
    // Large enough to keep showing the latest message.
    srclogBox.scrollTop = 1000000;
  }
  else if (logtype == 2){ // dstlog
    dstlogBox.value += log + '\n'
    dstlogBox.scrollTop = 1000000;
  }
  else if (logtype == 3){ // eventlog
    updlogBox.value += log + '\n'
    updlogBox.scrollTop = 1000000;
  }
  else{ // print error to srclog
    srclogBox.value += 'unknown logtype:' + log + '\n'
    srclogBox.scrollTop = 1000000;
  }
}

function send() {
  if (!socket) {
    addToLog('Not connected');
    return;
  }

  socket.send(messageBox.value);
  addToLog(': ' + messageBox.value);
  messageBox.value = '';
}

function clearBoxes(){
  srclogBox = null;
  dstlogBox = null;
  updlogBox = null;
  bar = null;
  barST = null;
  statusCT = null;
  statusST = null;
  finalMsg = null;
}

function connect() {

  if ('WebSocket' in window) {
    socket = new WebSocket(addressValue);
    //socket = new WebSocket(addressBox.value);
  } else if ('MozWebSocket' in window) {
    socket = new MozWebSocket(addressValue);
    //socket = new MozWebSocket(addressBox.value);
  } else {
    addToLog('Cannot create web socket');
    return;
  }

  socket.onopen = function () {
    addToLog(1, 'Opened');
    addToLog(3, 'Opened');
  };

  socket.onmessage = function (event) {
    var temp = new Array();

    temp = event.data.split(' ');
    
    switch(temp[0]){
        case "ct": 
        case "st" : 
            setProgressBar(temp[0], temp[1]);
            break;

	case "ex00": 
            clearBoxes();
	    break;
        case "s221": case "s222":
        case "s223": case "s224":
        case "s0":   case "s3":   
        case "s4":
            addToLog(1, '- ' + event.data);
            break; 
        case "e21": case "r21": 
        case "r22": case "r3" :
            addToLog(2, '- ' + event.data);
            break;
        case "successfully": 
        case "hd1:" :
        case "hd2:" :
            addToLog(3, '- ' + event.data);
            break;
        case "Revisited" :
            refreshOnCloseFlag = 1;
            addToLog(1, '- ' + event.data);
            break;
        default: 
            addToLog(1, '- ' + event.data);
            break;
    }
  };

  socket.onerror = function () {
    addToLog(1, 'Error');
  };

  socket.onclose = function (event) {
    var logMessage = 'Closed (';
    if ((arguments.length == 1) && ('CloseEvent' in window) &&
        (event instanceof CloseEvent)) {
      logMessage += 'wasClean = ' + event.wasClean;
      // code and reason are present only for
      // draft-ietf-hybi-thewebsocketprotocol-06 and later
      if ('code' in event) {
        logMessage += ', code = ' + event.code;
      }
      if ('reason' in event) {
        logMessage += ', reason = ' + event.reason;
      }
    } else {
      logMessage += 'CloseEvent is not available';
    }
    addToLog(1, logMessage + ')');

    if(refreshOnCloseFlag == 1){
      socket = null;

      srclogBox = null;
      dstlogBox = null;
      updlogBox = null;

      refreshOnCloseFlag = 0; 

      init();
    }
  };

  addToLog(1, 'Connect ' + addressValue);
  addToLog(3, 'Connecting');
}

function closeSocket() {
  if (!socket) {
    addToLog(3, 'Not connected');
    return;
  }
  socket.close();
}

function printState() {
  if (!socket) {
    addToLog(3, 'Not connected');
    return;
  }

  addToLog( 1,
      'url = ' + socket.url +
      ', readyState = ' + socket.readyState +
      ', bufferedAmount = ' + socket.bufferedAmount);
}

function init() {
  var scheme = window.location.protocol == 'https:' ? 'wss://' : 'ws://';
  var serverLocation = 'vasabilab.cs.tu.ac.th:9998';
  var defaultAddress = scheme + serverLocation + '/progress';

  bar = document.getElementById('progressBar');
  barST = document.getElementById('progressBarST');
  statusCT = document.getElementById('statusCT');
  statusST = document.getElementById('statusST');
  finalMsg = document.getElementById('finalMessage');

  srclogBox = document.getElementById('srclog');
  dstlogBox = document.getElementById('dstlog');
  updlogBox = document.getElementById('updlog');

  //addressBox.value = defaultAddress;
  addressValue = defaultAddress;

  if ('MozWebSocket' in window) {
    addToLog(1, 'Use MozWebSocket');
  } else if (!('WebSocket' in window)) {
    addToLog(1, 'WebSocket is not available');
  }

  if (socket == null){
    connect();
  }

}
