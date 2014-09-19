var Settings = require('settings');
var ajax = require('ajax');
var UI = require('ui');


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
                        console.log(JSON.stringify(data));
                        

                      },
                      function(error) {
                          console.log('The ajax request failed: ' + error);
                          console.log(Settings.option('url'));
                      }
                  );
                  return domoticz._data;
                  },
  getDevices : function () {
    return this._request('/json.htm?type=devices&used=true&order=Name');
    },
  getScenes : function () {
    return this._request('/json.htm?type=scenes');
    },
  getSwitches : function () {
    return this._request('/json.htm?type=devices&used=true&order=Name&filter=light');
    },
  getUtilities : function () {
    return this._request('/json.htm?type=devices&used=true&order=Name&filter=utility');
    },
  getTemperature : function () {
    return this._request('/json.htm?type=devices&used=true&order=Name&filter=temp');
    },
  getWeather : function () {
    return this._request('/json.htm?type=devices&used=true&order=Name&filter=weather');
  },
  getDevice : function (idx) {
    return this._request('/json.htm?type=devices&rid=' + idx);
  },
  On : function (idx) {
    return this._request('/json.htm?type=command&param=switchlight&idx='+ idx +'&switchcmd=On&level=0');
  },
  Off : function (idx) {
    return this._request('/json.htm?type=command&param=switchlight&idx='+ idx +'&switchcmd=Off&level=0');
  },
  setLevel : function (idx,level) {
    return this._request('/json.htm?type=command&param=switchlight&idx='+ idx +'&switchcmd=Set%20Level&level=' + level);
  },
  sceneOn : function (idx) {
    return this._request('/json.htm?type=command&param=switchscene&idx='+ idx +'&switchcmd=On');
  },
  sceneOff : function (idx) {
    return this._request('/json.htm?type=command&param=switchscene&idx='+ idx +'&switchcmd=Off');
  },
  toggleDevice : function (idx){
    var device = this.getDevice(idx);
    if(device.result[0].Status == "Off"){this.On(idx);}
    else {this.Off(idx);}
    device = this.getDevice(idx);
    return device.result[0].Status;
  },
};


Settings.config({
  url: 'https://s3-eu-west-1.amazonaws.com/naygru/domoticz.html' },
  function(e) {console.log('opening configurable');},
  function(e) {console.log('closed configurable');if (e.failed) {console.log(e.response);}}
  );

var menu = new UI.Menu({
  sections: [{title: 'Scenes',},
             {title: 'Switches', },
             {title: 'Utilities',},
             {title: 'Temperature', },
             {title: 'Weather',},]});

var scenes = domoticz.getScenes();
var switches = domoticz.getSwitches();
var utilities = domoticz.getUtilities();
var temperature = domoticz.getTemperature();
var weather = domoticz.getWeather();
// var devices = domoticz.getDevices();
//scenes 
for(var i=0; i < scenes.result.length; i++) {
  menu.item(0, i, { title: scenes.result[i].Name, idx : scenes.result[i].idx, type: 'Scene', status: scenes.result[i].Status });
}
//switches
for(var i=0; i<switches.result.length; i++) {
  menu.item(1, i, { title: switches.result[i].Name, idx :switches.result[i].idx, type: 'Switch'});
}
//utilities
for(var i=0; i<utilities.result.length; i++) {
  menu.item(2, i, { title: utilities.result[i].Name, idx :utilities.result[i].idx, type: 'Utility'});
}

//Temperature
for(var i=0; i<temperature.result.length; i++) {
  menu.item(3, i, { title: temperature.result[i].Name, idx :temperature.result[i].idx, type: 'Temperature'});
}

//weather
for(var i=0; i<weather.result.length; i++) {
  menu.item(4, i, { title: weather.result[i].Name, idx :weather.result[i].idx, type: 'Weather'});
}

menu.on('select', function(e) {
var device = domoticz.getDevice(e.item.idx);
var idx = e.item.idx;

var card = new UI.Card({
  scrollable: true,
  title: device.result[0].Name,
  body: device.result[0].Status
});

card.on('click', function(e) {
  card.body(domoticz.toggleDevice(idx));
});

card.show();
});

menu.show();
