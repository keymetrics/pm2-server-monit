
var lm_sensors = require('./utils/lm-sensors.js');
var pmx = require('pmx');
var probe = pmx.probe();

var Sensors = {
  sensors_values : {},
  generateProbes : function() {
    var self = this;
    Object.keys(Sensors.sensors_values).forEach(function(sensor_name) {
      probe.metric({
        name: sensor_name,
        value: function() {
          return Sensors.sensors_values[sensor_name].value + '°C';
        },
        alert : {
          mode : 'threshold-avg',
          value : Sensors.sensors_values[sensor_name].high - 2,
          cmp : '>'
        }
      });
    });
  },

  retrieveValues : function(cb) {
    var self = this;
    if (!cb) cb = function() {};

    lm_sensors.sensors(function(parsed, error) {
      Object.keys(parsed).forEach(function(sens) {
        Object.keys(parsed[sens]).forEach(function(se1) {
          Object.keys(parsed[sens][se1]).forEach(function(se2) {
            var name = parsed[sens][se1][se2].name;
            var value = parsed[sens][se1][se2].value;
            var high = parsed[sens][se1][se2].high;

            Sensors.sensors_values[name] = {
              value : value,
              high : high || 100
            }
          });
        });
      });

      cb();
    });
  },

  init : function(conf) {
    var self = this;

    lm_sensors.sensorsInstalled(function done(installed) {
      if (installed) {

        Sensors.retrieveValues(function() {
          Sensors.generateProbes();
        });

        setInterval(function() {
          Sensors.retrieveValues();
        }, 10000);
      }
    });
  }
}

module.exports.init = Sensors.init;
