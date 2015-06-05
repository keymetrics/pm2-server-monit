
/**
 *  CentOS Collect Network Statistics
 *
 */
var process  = require('./process'),
    events   = require('events'),
    os       = require('os'),
    util     = require('util');

/**
 * # ifconfig
 *
 * eth0      Link encap:Ethernet  HWaddr 00:50:56:86:63:22
 *           inet addr:10.3.39.106  Bcast:10.3.39.255  Mask:255.255.252.0
 *           inet6 addr: fd51:ffbb:ffbb:324:250:56ff:fe86:6322/64 Scope:Global
 *           inet6 addr: fe80::250:56ff:fe86:6322/64 Scope:Link
 *           UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
 *           RX packets:30184720 errors:0 dropped:0 overruns:0 frame:0
 *           TX packets:3390966 errors:0 dropped:0 overruns:0 carrier:0
 *           collisions:0 txqueuelen:1000
 *           RX bytes:3930128736 (3.6 GiB)  TX bytes:2094861790 (1.9 GiB)
 *
 * lo        Link encap:Local Loopback
 *           inet addr:127.0.0.1  Mask:255.0.0.0
 *           inet6 addr: ::1/128 Scope:Host
 *           UP LOOPBACK RUNNING  MTU:16436  Metric:1
 *           RX packets:219953 errors:0 dropped:0 overruns:0 frame:0
 *           TX packets:219953 errors:0 dropped:0 overruns:0 carrier:0
 *           collisions:0 txqueuelen:0
 *           RX bytes:270297634 (257.7 MiB)  TX bytes:270297634 (257.7 MiB)
 */

module.exports = (function () {

  function Netstat(samplingRate, logger) {
    this.logger        = logger;
    this.hostname      = os.hostname();
    this.bytesSent     = [];
    this.bytesReceived = [];
    this.packetsSent     = [];
    this.packetsReceived = [];
    this.samplingRate    = samplingRate;
    this.interfaceNameRegex = /^([a-zA-Z0-9]+)\s+/;
    this.rxPacketsRegex = /^\s+RX\s+packets:\s*(\d+)\s+errors:\s*(\d+)\s+dropped:\s*(\d+)\s+overruns:\s*(\d+)\s+frame:(\d+)\s*$/;
    this.packetsRX = 1; this.errorsRX = 2; this.droppedRX = 3; this.overrunsRX = 4; this.frameRX = 5; this.rxPacketsRegexLen = 6;
    this.txPacketsRegex = /^\s+TX\s+packets:\s*(\d+)\s+errors:\s*(\d+)\s+dropped:\s*(\d+)\s+overruns:\s*(\d+)\s+carrier:(\d+)\s*$/;
    this.packetsTX = 1; this.errorsTX = 2; this.droppedTX = 3; this.overrunsTX = 4; this.carrierTX = 5; this.txPacketsRegexLen = 6;
    this.bytesRegex = /^\s+RX\s+bytes:\s*(\d+)\s+\([^)]+\)\s+TX\s+bytes:\s*(\d+)\s+\([^)]*\)\s*$/;
    this.received = 1; this.sent = 2; this.bytesRegexLen=3;
  }

  util.inherits(Netstat, events.EventEmitter);

  Netstat.prototype.start = function() {
    var $this         = this,
        interfaceName = 'all';

    //process.setLogger(this.logger);
    var netstat = process.execute('/sbin/ifconfig', null, null, null, function (err, userValue) {
      if (err) {
        console.log('error', 'linux|netstat|err=', err);
        throw err;
      }
      userValue = userValue;
      setTimeout(function () {
        $this.start.call($this);
      }, 2000);
    });

    netstat.stdout.on('data', function (data) {
      var lines = ('' + data).split(/\r?\n/);
      var stats;

      try {
        for (var i = 0; i < lines.length ; ++i) {

          var capture = lines[i].match($this.interfaceNameRegex);

          if (capture !== null && capture[0] !== undefined && capture.length === 2) {
            interfaceName = capture[1];
            stats = {};

          } else {
            capture = lines[i].match($this.rxPacketsRegex);
            if (capture !== null && capture[0] !== undefined && capture.length === $this.rxPacketsRegexLen) {
              if ($this.packetsReceived[interfaceName] !== undefined && $this.packetsReceived[interfaceName] !== undefined) {
                stats['inputPackets'    ] = parseInt(capture[$this.packetsRX]) - $this.packetsReceived[interfaceName];
              }
              $this.packetsReceived[interfaceName] = parseInt(capture[$this.packetsRX]);
              stats['inputErrors'   ] = capture[$this.errorsRX];
              stats['inputDropped'  ] = capture[$this.droppedRX];
              stats['inputOverruns' ] = capture[$this.overrunsRX];
              stats['inputFrame'    ] = capture[$this.frameRX];
            } else {
              capture = lines[i].match($this.txPacketsRegex);
              if (capture !== null && capture[0] !== undefined && capture.length === $this.txPacketsRegexLen) {
                if ($this.packetsSent[interfaceName] !== undefined && $this.packetsSent[interfaceName] !== undefined) {
                  stats['outputPackets'    ] = parseInt(capture[$this.packetsTX]) - $this.packetsSent[interfaceName];
                }
                $this.packetsSent[interfaceName] = parseInt(capture[$this.packetsTX]);
                stats['outputErrors'  ] = capture[$this.errorsTX];
                stats['outputDropped' ] = capture[$this.droppedTX];
                stats['outputOverruns'] = capture[$this.overrunsTX];
                stats['outputCarrier' ] = capture[$this.carrierTX];
              } else {
                capture = lines[i].match($this.bytesRegex);

                if (capture !== null && capture[0] !== undefined && capture.length === $this.bytesRegexLen) {
                  if ($this.bytesSent[interfaceName] !== undefined && $this.bytesReceived[interfaceName] !== undefined) {
                    stats['inputBytes'    ] = parseInt(capture[$this.received]) - $this.bytesReceived[interfaceName];
                    stats['outputBytes'   ] = parseInt(capture[$this.sent]) - $this.bytesSent[interfaceName];
                    stats.interface = interfaceName;
                    $this.emit('stats', stats);
                  }
                  $this.bytesSent[interfaceName]     = parseInt(capture[$this.sent]);
                  $this.bytesReceived[interfaceName] = parseInt(capture[$this.received]);
                }
              }
            }
          }
        }
      } catch (e) {
      }
    });
    netstat.stderr.on('data', function (data) {
      console.log('error', 'linux|netstat|stderr=' + data + '\n');
    });
  };

  ////////////////////////////////////////////////////////////////////////////

  return  Netstat;
})();
