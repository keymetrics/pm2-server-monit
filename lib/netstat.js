var pmx     = require('pmx');
var probe   = pmx.probe();
var shelljs = require('shelljs');
var os = require('os')

var metrics = {};
var oldStats = [];

function refreshIp(interval) {
  shelljs.exec('ip -s link', { async : true, silent : true }, function(err, out) {
    if (err) {
      console.error('ip -s link failed to execute, switch to ipconfig');
      refreshIpconfig(interval)
      return;
    }
    var names = new RegExp(/[0-9]+: ([\S]+): /g);
    var RX = new RegExp(/    RX: bytes  packets  errors  dropped overrun mcast\s*\n\s*([0-9]+) /gm);
    var TX = new RegExp(/    TX: bytes  packets  errors  dropped carrier collsns \s*\n\s*([0-9]+) /g);

  	var stats = [];
  	var i = 0, totalIn = 0, totalOut = 0;

    while ((res = names.exec(out)) !== null) {
      stats[i++] = {
        interface: res[1]
      };
    }

    var i = 0;
    while((res= RX.exec(out)) !== null) {
      stats[i++].inputBytes = res[1];
    }
    var i = 0;
    while((res= TX.exec(out)) !== null) {
      stats[i++].outputBytes = res[1];
    }

    for (var i = 0; i < stats.length; i++) {
      if (!metrics[stats[i].interface] && stats[i].interface != 'lo' && stats[i].outputBytes > 0) {
        metrics[stats[i].interface] = {};

        metrics[stats[i].interface]['input'] = probe.metric({
          name  : stats[i].interface + ' input',
          value : function() { return 0; }
        });

        metrics[stats[i].interface]['output'] = probe.metric({
          name  : stats[i].interface + ' output',
          value : function() { return 0; }
        });
      }

      if (metrics[stats[i].interface]) {
		if (oldStats && oldStats[i]) {
          var output = (stats[i].outputBytes - oldStats[i].outputBytes) /  1000000;
          var input = (stats[i].inputBytes - oldStats[i].inputBytes) / 1000000;
        }
        else {
          var output = 0
          var input = 0;
        }

        metrics[stats[i].interface]['output'].set(output.toFixed(2) + 'MB/s');
        metrics[stats[i].interface]['input'].set(input.toFixed(2) + 'MB/s');

        totalIn += input;
        totalOut += output;
      }
    }
    if (stats.length > 0) {
      metrics.total.input.set(totalIn.toFixed(2) + 'MB/s');
      metrics.total.output.set(totalOut.toFixed(2) + 'MB/s');
      totalIn = 0;
      totalOut = 0;
    }
    oldStats = stats;
  });
}

function refreshIpconfig(interval) {

  var interfaceNameRegex = /^([a-zA-Z0-9]+)\s+/;
  var rxPacketsRegex = /^\s+RX\s+packets:\s*(\d+)\s+errors:\s*(\d+)\s+dropped:\s*(\d+)\s+overruns:\s*(\d+)\s+frame:(\d+)\s*$/;

  shelljs.exec('ifconfig', { async : true, silent : true }, function(err, out) {
    if (err) {
      console.log('ifconfig failed to execute');
      return;
    }
    var blocks = ipconfig.breakIntoBlocks(out)
    block.forEach(function (block) {
      console.log(ipconfig.parseSingleBlock(block))
    })
  })
}

var ipconfig = {
  breakIntoBlocks: function breakIntoBlocks(fullText) {
    var blocks = [];
    var lines = fullText.split('\n');
    var currentBlock = [];
    lines.forEach(function(line) {
        if (line.length > 0 && ['\t', ' '].indexOf(line[0]) === -1 && currentBlock.length > 0) { // start of a new block detected
            blocks.push(currentBlock);
            currentBlock = [];
        }
        if (line.trim()) {
            currentBlock.push(line);
        }
    });
    if (currentBlock.length > 0) {
       blocks.push(currentBlock);
    }
    return blocks;
  },

  // input:
  // eth0      Link encap:Ethernet  HWaddr 04:01:d3:db:fd:01
  //           inet addr:107.170.222.198  Bcast:107.170.223.255  Mask:255.255.240.0
  //           inet6 addr: fe80::601:d3ff:fedb:fd01/64 Scope:Link
  //           UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
  //           RX packets:50028 errors:0 dropped:0 overruns:0 frame:0
  //           TX packets:50147 errors:0 dropped:0 overruns:0 carrier:0
  //           collisions:0 txqueuelen:1000
  //           RX bytes:13590446 (13.5 MB)  TX bytes:14465813 (14.4 MB)
  parseSingleBlock: function parseSingleBlock(block) {
      var data = {};
      block.forEach(function(line) {
          var match = null;
          if(match = line.match(/^(\S+)\s+Link/)) { // eth0      Link encap:Ethernet  HWaddr 04:01:d3:db:fd:01
              data.device = match[1]; // eth0
              var link = {};
              match = line.match(/encap:(\S+)/);
              if (match) {
                  link.encap = match[1];
              }
              match = line.match(/HWaddr\s+(\S+)/);
              if (match) {
                  link.hwaddr = match[1];
              }
              data.link = link;
          } else {
              var section = data.other || {};
              if (match = line.match(/collisions:(\S+)/)) {
                  section.collisions = parseInt(match[1]);
              }
              if (match = line.match(/txqueuelen:(\S+)/)) {
                  section.txqueuelen = parseInt(match[1]);
              }
              if (match = line.match(/RX bytes:(\S+)/)) {
                  section.rxBytes = parseInt(match[1]);
              }
              if (match = line.match(/TX bytes:(\S+)/)) {
                  section.txBytes = parseInt(match[1]);
              }
              data.other = section;
          }
      });
      return data;
  }
}

function initMetrics() {
  metrics.total = {};
  metrics.total.input = probe.metric({
    name  : 'network in',
    value : returnValue
  });

  metrics.total.output = probe.metric({
    name  : 'network out',
    value : returnValue
  });
}

function returnValue() {
  if (os.platform() == 'linux') {
    return 'N/A';
  } else {
    return '❌';
  }
}

function init(conf) {
  initMetrics();

  if (os.platform() == 'linux') {
    setInterval(refreshIp, conf.small_interval * 1000);
  }
}

module.exports.init = init;
