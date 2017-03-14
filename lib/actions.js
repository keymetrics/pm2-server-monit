var pmx = require('pmx');
var cp = require('child_process');

function initActions() {
  if (process.platform == 'linux') {
    pmx.action('top cpu consuming', function(reply) {
      var top_cpu_process = cp.exec('ps -eo pcpu,user,args --no-headers | sort -k 1 -n | tail -n 10 | sort -k 1 -nr | cut -c 1-70', { shell: true }, function(err, out) {
        var result = out.replace(/\n/g, "<br />");
        return reply(result);
      });
    });


    pmx.action('top mem consuming', function(reply) {
      var top_mem_process = cp.exec('ps -eo pmem,pid,cmd | sort -k 1 -n | tail -n 10 | sort -k 1 -nr | cut -c 1-70', { shell: true }, function(err, out) {
        var result = out.replace(/\n/g, "<br />");
        return reply(result);
      });
    });


    pmx.action('vmstats', function(reply) {
      var vmstats = cp.exec('vmstat -S m', { shell: true }, function(err, out) {
        var result = out.replace(/\n/g, "<br />");
        return reply(result);
      });
    });
  }


  pmx.action('processes/users', function(reply) {
    var proc_users = cp.exec('ps hax -o user | sort | uniq -c', { shell: true }, function(err, out) {
      var result = out.replace(/\n/g, "<br />");
      return reply(result);
    });
  });

  pmx.action('disk usage', function(reply) {
    var disk_usage = cp.exec('df -h', { shell: true }, function(err, out) {
      var result = out.replace(/\n/g, "<br />");
      return reply(result);
    });
  });

  pmx.action('who', function(reply) {
    var who = cp.exec('who', { shell: true }, function(err, out) {
      var result = out.replace(/\n/g, "<br />");
      return reply(result);
    });
  });

  pmx.action('uptime', function(reply) {
    var uptime = cp.exec('uptime', { shell: true }, function(err, out) {
      var result = out.replace(/\n/g, "<br />");
      return reply(result);
    });
  });

  pmx.action('open ports', function(reply) {
    var open_ports = cp.exec('lsof -Pni4 | grep ESTABLISHED', { shell: true }, function(err, out) {
      var result = out.replace(/\n/g, "<br />");
      return reply(result);
    });
  });

  pmx.action('ifconfig', function(reply) {
    var open_ports = cp.exec('ifconfig', { shell: true }, function(err, out) {
      var result = out.replace(/\n/g, "<br />");
      return reply(result);
    });
  });
}

module.exports.initActions = initActions;
