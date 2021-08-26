/* This config file is used to build the docker image */
/** DETAILED CONFIG TYPINGS CAN BE FOUND IN src/types/config.ts! */

const fs = require('fs')

function secret(name) {
  try {
    return fs.readFileSync('/run/secrets/' + name).toString()
  } catch (ex) {
    return process.env[name]
  }
}


module.exports = {
  bot: {
    token: secret('FSB_DBOT_TOKEN'),
    mode: 'regular',
    clientid: secret('FSB_DBOT_ID') || '672822334641537041'
  },
  mode: secret('FSB_MODE') === 'single'
    ? { name: 'single' }
    : secret('FSB_MODE') === 'shard'
      ? {
          name: shard,
          shardIds: secret('FSB_SHARD_IDS')?.split(',').map(parseInt) ?? [],
          shardCount: secret('FSB_SHARD_COUNT')
        }
      : {
          name: 'worker',
          master: { host: secret('FSB_WORKER_HOST') }
        },
  mongodb: {
    url: secret('FSB_MONGO_URL'),
    dbname: 'freestuffbot'
  },
  apisettings: {
    key: secret('FSB_FSAPI_KEY'),
    type: secret('FSB_FSAPI_TYPE') || 'partner',
    baseUrl: secret('FSB_FSAPI_HOST'),
    webhookSecret: secret('FSB_WEBHOOK_SECRET'),
    server: {
      enable: secret('FSB_WEBHOOK_ENABLE') !== 'false',
      port: parseInt(secret('FSB_WEBHOOK_PORT')),
      endpoint: secret('FSB_WEBHOOK_ENDPOINT')
    }
  },
  redis: {
    host: secret('FSB_REDIS_HOST'),
    port: secret('FSB_REDIS_PORT') || 6379
  },
  thirdparty: {
    sentry: {
      dsn: secret('FSB_SENTRY_DSN')
    }
  }
}
