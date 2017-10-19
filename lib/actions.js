var pmx = require('pmx');
var exec = require('./exec.js');

function initActions() {
  if (process.platform == 'linux') {
    pmx.action('top cpu consuming', function(reply) {
      var top_cpu_process = exec('ps -eo pcpu,user,args --no-headers | sort -k 1 -n | tail -n 10 | sort -k 1 -nr | cut -c 1-70', function(err, out) {
        var result = out.replace(/\n/g, "<br />");
        return reply(result);
      });
    });


    pmx.action('top mem consuming', function(reply) {
      var top_mem_process = exec('ps -eo pmem,pid,cmd | sort -k 1 -n | tail -n 10 | sort -k 1 -nr | cut -c 1-70', function(err, out) {
        var result = out.replace(/\n/g, "<br />");
        return reply(result);
      });
    });


    pmx.action('vmstats', function(reply) {
      var vmstats = exec('vmstat -S m', function(err, out) {
        var result = out.replace(/\n/g, "<br />");
        return reply(result);
      });
    });
  }


  pmx.action('processes/users', function(reply) {
    var proc_users = exec('ps hax -o user | sort | uniq -c', function(err, out) {
      var result = out.replace(/\n/g, "<br />");
      return reply(result);
    });
  });

  pmx.action('disk usage', function(reply) {
    var disk_usage = exec('df -h', function(err, out) {
      var result = out.replace(/\n/g, "<br />");
      return reply(result);
    });
  });

  pmx.action('who', function(reply) {
    var who = exec('who', function(err, out) {
      var result = out.replace(/\n/g, "<br />");
      return reply(result);
    });
  });

  pmx.action('uptime', function(reply) {
    var uptime = exec('uptime', function(err, out) {
      var result = out.replace(/\n/g, "<br />");
      return reply(result);
    });
  });

  pmx.action('open ports', function(reply) {
    var open_ports = exec('lsof -Pni4 | grep ESTABLISHED', function(err, out) {
      var result = out.replace(/\n/g, "<br />");
      return reply(result);
    });
  });

  pmx.action('ifconfig', function(reply) {
    var open_ports = exec('ifconfig', function(err, out) {
      var result = out.replace(/\n/g, "<br />");
      return reply(result);
    });
  });
}

module.exports.initActions = initActions;
