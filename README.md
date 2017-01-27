
<div align="center">
    <img src="https://github.com/pm2-hive/pm2-server-monit/raw/master/server-monit.png">
</div>

## Description

PM2 module to automatically monitor vital signs of your server :

* CPU average usage
* Free and used drive space
* Free and used memory space
* Operating System
* All processes running
* TTY/SSH opened
* Total opened files
* Network speed (input and output)

# pm2-server-monit

## Install

```bash
$ npm install pm2 -g

$ pm2 install pm2-server-monit
```

## Configuration

Default settings:

* `drive` is `/`. If the value is incorrect or not found, / will be monitored by default.
* `small_interval` is `1` second. Represents the refresh_rate of the cpu and network workers.

To modify the config values you can use Keymetrics dashboard or the following commands:

```bash
pm2 set pm2-server-monit:drive /
pm2 set pm2-server-monit:small_interval 10
```

:warning: If this module uses too much CPU, set the `small_interval` value to 10 or more.

## Info

If you have ❌ in some categories, your OS configuration is not supported for this option.

## Uninstall

```bash
$ pm2 uninstall pm2-server-monit
```

# License

MIT
