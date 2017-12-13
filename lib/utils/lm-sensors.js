// From https://www.npmjs.com/package/sensors.js

var util = require("util");
var childProcess = require('child_process');

var rMatchDevice = new RegExp(".*(acpitz|-acpi-|i2c|pci|isa).*");
var rMatchAdapter = /(Adapter:\s*)([A-Za-z0-9\-:.\s]*)/;
// Group 1: Name
// Group 2: Value
// Group 4: Min
// Group 6: Max
var rMatchVoltage = /([A-Za-z0-9\+\.\s\_]*)\:\s*\+([0-9]*\.[0-9]*\s)V\s*(\(min\s\=\s*)?(\+[0-9]*\.[0-9]*)?\s?V?\,?\s?(max\s\=\s*)?(\+[0-9]*\.[0-9]*)?\s?V?\)?/;
// Group 1: Name
// Group 2: Value
// Group 4: Low (might be null)
// Group 6: High
var rMatchTemperatue = /([A-Za-z0-9\+\.\s\_]*)\:\s*(\+?\-?[0-9]*\.[0-9]*)°C\s*\((low\s*\=\s*)?(\+?\-?[0-9]*\.[0-9]*)?°?C?\,?\s*(high\s*\=\s*)?(\+?\-?[0-9]*\.[0-9]*)?°?C?\)?/;
// Group 1: Name
// Group 2: Value
// Group 3: Min
var rMatchRPM = /([A-Za-z0-9\+\.\s\_]*)\:\s*([0-9]*)\sRPM\s*\(min\s*\=\s*([0-9]*)\sRPM\)/;

var parser = function (sensors_output) {
  var raw_lines = sensors_output.toString().split("\n");
  var output = {};
  var current_device = '';
  var current_adapter = '';
  raw_lines.forEach(function (raw_line) {
    if (raw_line === '') return;
    raw_line = raw_line.trim();
    var device_matches = raw_line.match(rMatchDevice);
    if (device_matches !== null) {
      // set current device
      current_device = device_matches[0];
      // create device
      output[current_device] = {};
    } else {
      var adapter_matches = rMatchAdapter.exec(raw_line);
      if (adapter_matches !== null) {
        // create adapter
        current_adapter = adapter_matches[2];
        output[current_device][current_adapter] = {};
      } else {
        var voltage_matches = raw_line.match(rMatchVoltage);
        if (voltage_matches !== null) {
          output[current_device][current_adapter][voltage_matches[1]] = {
            type: 'voltage',
            name: voltage_matches[1],
            value: parseFloat(voltage_matches[2])
          };
          if (voltage_matches[4] !== undefined) {
            output[current_device][current_adapter][voltage_matches[1]]["min"] =
              parseFloat(voltage_matches[4]);
          }
          if (voltage_matches[6] !== undefined) {
            output[current_device][current_adapter][voltage_matches[1]]["max"] =
              parseFloat(voltage_matches[6]);
          }
        } else {
          var temperature_matches = raw_line.match(rMatchTemperatue);
          if (temperature_matches !== null) {
            output[current_device][current_adapter][temperature_matches[1]] = {
              type: 'temperature',
              name: temperature_matches[1],
              value: parseFloat(temperature_matches[2])
            };
            if (temperature_matches[4] !== undefined) {
              output[current_device][current_adapter][temperature_matches[1]]["low"] =
                parseFloat(temperature_matches[4]);
            }
            if (temperature_matches[6] !== undefined) {
              output[current_device][current_adapter][temperature_matches[1]]["high"] =
                parseFloat(temperature_matches[6]);
            }
          } else {
            var rpm_matches = raw_line.match(rMatchRPM);
            if (rpm_matches !== null) {
              output[current_device][current_adapter][rpm_matches[1]] = {
                type: 'rpm',
                name: rpm_matches[1],
                value: parseInt(rpm_matches[2]),
                min: parseInt(rpm_matches[3])
              };
            }
          }
        }
      }
    }
  });
  return output;
};
// parser(output);

module.exports = {
  sensors: function (done) {
    var sensors = childProcess.exec('sensors', function (error, stdout, stderr) {
      if (error) done(null, error);
      done(parser(stdout.toString()), null);
    });
  },
  parser: parser,
  sensorsInstalled: function (done) {
    childProcess.exec('sensors', function (error, stdout, stderr) {
      if (error) {
        done(false);
      } else {
        done(true);
      }
    });
  }
};
