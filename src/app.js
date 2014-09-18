/**
 *
 *
 * http://pebble.github.io/pebblejs/#settings
 *
 */

var Settings = require('settings');
var ajax = require('ajax');


var Base64 = {
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Base64._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },
    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = Base64._utf8_decode(output);
        return output;
    },
    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },
    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = 0;
//        var c1 = 0;
        var c2 = 0;
        var c3 = 0;
        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
};

var domoticz = {
	_data : {},
	_request : function (path) {

                  ajax(
                  {
                  url: Settings.option('url') + path,
                  type: 'json',
                  async: false,
                  headers:{
                      Authorization: "Basic " + Base64.encode(Settings.option('login') + ":" + Settings.option('password')),
                      },
                  },
                      function(data) {
                          domoticz._data = data;
//                          console.log('Domoticz status inside object: ' + domoticz._data.status);
                      },
                      function(error) {
                          console.log('The ajax request failed: ' + error);
                      }
                  );
                  return domoticz._data;
                  },
	devices : function () {
		return this._request('/json.htm?type=devices&used=true&order=Name');
	},
	scenes : function () {
		return this._request('/json.htm?type=scenes');
	},
	switches : function () {
		return this._request('/json.htm?type=devices&used=true&order=Name&filter=light');
	},
	utilities : function () {
		return this._request('/json.htm?type=devices&used=true&order=Name&filter=utility');
	},
	temperature : function () {
		return this._request('/json.htm?type=devices&used=true&order=Name&filter=temp');
	},
	weather : function () {
		return this._request('/json.htm?type=devices&used=true&order=Name&filter=weather');
	},
	on : function (idx) {
		return this._request('/json.htm?type=command&param=switchlight&idx=&switchcmd=On&level=0');
	},
	off : function (idx) {
		return this._request('/json.htm?type=command&param=switchlight&idx='+ idx +'&switchcmd=Off&level=0');
	},
	setlevel : function (idx,level) {
		return this._request('/json.htm?type=command&param=switchlight&idx='+ idx +'&switchcmd=Set%20Level&level=' + level);
	},
	sceneOn : function (idx) {
		return this._request('/json.htm?type=command&param=switchscene&idx=&switchcmd=On');
	},
	sceneOff : function (idx) {
		return this._request('/json.htm?type=command&param=switchscene&idx=&switchcmd=Off');
	},
	device : function (idx) {
		return this._request('/json.htm?type=devices&rid=idx');
	},

    };




var UI = require('ui');

Settings.config(
  { url: 'https://s3-eu-west-1.amazonaws.com/naygru/domoticz.html' },
	function(e) {console.log('opening configurable');},
	function(e) {console.log('closed configurable');if (e.failed) {console.log(e.response);}}
  );

    var UI = require('ui');
   
//    var devices = domoticz.devices();

//for(var i=0; i<devices.result.length; i++) {
//        main.item(0, i, { title: devices.result[i].Name});
//        console.log(devices.result[i].Name);
//}


var menu = new UI.Menu({
  sections: [{
    title: 'Scenes',

},

{
    title: 'Switches',
//items
  },
{
    title: 'Utilities',
//items
  },
{
    title: 'Temperature',
//items
  },
{
    title: 'Weather',
//items
  },
]
});

//scenes 
var scenes = domoticz.scenes();
for(var i=0; i<scenes.result.length; i++) {
        menu.item(0, i, { title: scenes.result[i].Name});
        console.log(scenes.result[i].Name);
}
//switches
var switches = domoticz.switches();
for(var i=0; i<switches.result.length; i++) {
        menu.item(1, i, { title: switches.result[i].Name});
        console.log(switches.result[i].Name);
}

//utilities
var utilities = domoticz.utilities();
for(var i=0; i<utilities.result.length; i++) {
        menu.item(2, i, { title: utilities.result[i].Name});
        console.log(utilities.result[i].Name);
}

//Temperature
var temperature = domoticz.temperature();
for(var i=0; i<temperature.result.length; i++) {
        menu.item(3, i, { title: temperature.result[i].Name});
        console.log(temperature.result[i].Name);
}

//weather
var weather = domoticz.weather();
for(var i=0; i<weather.result.length; i++) {
        menu.item(4, i, { title: weather.result[i].Name});
        console.log(weather.result[i].Name);
}




    menu.show();






var devices = domoticz.devices();
	console.log("devices: " + JSON.stringify(devices));


console.log('Domoticz status on app: ' + devices.status);




