
<div align="center">
    <img src="https://github.com/pm2-hive/pm2-server-monit/raw/master/server-monit.png">
</div>

## Description

PM2 module to automatically monitor vital signs of your server :

* CPU average usage
* Free and used drive space
* Free and used memory space
* All processes running
* TTY/SSH opened
* Total opened files
* Network speed (input and output)

# pm2-server-monit

## Install

```bash
pm2 install pm2-server-monit
```

## Configuration

Default settings:

* `drive` is the name of the drive you want to monitor, you can monitor multiples at the same time by adding a `,` between names (example: `/,/data` to monitor both `/` and `/data` assuming they are two different partition). Default is `/`
* `disk_refresh_rate` the rate of refresh for the metrics related to disk in seconds (default to `60`)
* `memory_refresh_rate` the rate of refresh for metrics related to memory in seconds (default to `2`)
* `cpu_refresh_rate` the rate of refresh for metrics related to cpu usage in seconds (default to `2`)
* `network_refresh_rate` the rate of refresh for metrics related to network bandwitdh in seconds (default to `5`)

To modify the config values you can use PM2 Plus dashboard or the following commands:

```bash
pm2 set pm2-server-monit:drive /
pm2 set pm2-server-monit:network_refresh_rate 10
```

## Info 

:warning: :warning: :warning:

If this module uses too much CPU, increase all the refresh rate to higher values

If you have metrics that doesn't appear, it means that is not supported on your platform. Also always check the logs with `pm2 logs pm2-server-monit` for errors.

:warning: :warning: :warning:

## Uninstall

```bash
pm2 uninstall pm2-server-monit
```

## Update to latest version

```bash
pm2 module:update pm2-server-monit
```