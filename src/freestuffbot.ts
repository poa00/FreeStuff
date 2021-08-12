import Cordo from 'cordo'
import { Client } from 'discord.js'
import * as chalk from 'chalk'
import { CronJob } from 'cron'
import LanguageManager from './bot/language-manager'
import LegacyCommandHandler from './bot/legacy-command-handler'
import DatabaseManager from './bot/database-manager'
import AnnouncementManager from './bot/announcement-manager'
import { DbStats } from './database/db-stats'
import Const from './bot/const'
import { GuildData } from './types/datastructs'
import Logger from './lib/logger'
import Manager from './controller/manager'
import { config, FSAPI } from './index'


export default class FreeStuffBot extends Client {

  public commandHandler: LegacyCommandHandler
  public announcementManager: AnnouncementManager

  //

  public start() {
    if (this.readyAt) return // bot is already started
    Manager.status(null, 'startup')

    this.commandHandler = new LegacyCommandHandler(this)
    this.announcementManager = new AnnouncementManager(this)

    DbStats.startMonitoring(this)

    // TODO find an actual fix for this instead of this garbage lol
    const manualConnectTimer = setTimeout(() => (this.ws as any)?.connection?.triggerReady(), 30000)
    this.on('ready', () => clearTimeout(manualConnectTimer))

    AnnouncementManager.updateCurrentFreebies()
    new CronJob('0 0 0 * * *', () => AnnouncementManager.updateCurrentFreebies()).start()

    this.registerEventHandlers()

    Manager.status(null, 'identifying')
    this.login(config.bot.token)
  }

  private registerEventHandlers() {
    Logger.excessive('FreeStuffBot#registerEventHandlers')
    // keep { } here or else this. behaves differently
    this.on('shardReady', (id) => { this.onShardReady(id) })
    this.on('shardDisconnect', (_, id) => { Manager.status(id, 'disconnected') })
    this.on('shardReconnecting', (id) => { Manager.status(id, 'reconnecting') })
    this.on('shardResume', (id) => { Manager.status(id, 'operational') })
    this.on('shardReady', (id) => { Manager.status(id, 'operational') })

    this.on('ready', () => {
      this.startBotActvity()
      FSAPI.ping().then((res) => {
        if (res._status !== 200)
          Logger.warn(`API Ping failed with code ${res._status}: ${res.error}, ${res.message}`)
      })
    })

    // interactions
    this.on('raw', (ev: any) => {
      if (ev.t === 'INTERACTION_CREATE')
        Cordo.emitInteraction(ev.d)
    })

    // database sync
    this.on('guildCreate', (guild) => {
      DatabaseManager.addGuild(guild)
    })
  }

  private onShardReady(id: number) {
    DatabaseManager.onShardReady(id)

    const shard = `Shard ${id} of [${this.options.shards}] / ${this.options.shardCount}`
    Logger.process(chalk`Shard ${id} ready! Logged in as {yellowBright ${this.user?.tag}} {gray (${shard})}`)
    if (config.bot.mode === 'dev') Logger.process([ 'Shard ' + id + ' Guilds:', ...this.guilds.cache.map(g => `  ${g.name} :: ${g.id}`) ].join('\n'))

    DbStats.usage.then(u => u.reconnects.updateToday(1, true))
  }

  private startBotActvity() {
    const updateActivity = (u) => {
      u?.setActivity(
        `@${u.username} help`
          .padEnd(54, '~')
          .split('~~').join(' ​')
          .replace('~', '') + Const.links.website,
        { type: 'WATCHING' }
      )

      Logger.excessive('Updating bot activity')
    }
    setInterval(updateActivity, 1000 * 60 * 15, this.user)
    updateActivity(this.user)
  }

  //

  public text(d: GuildData, text: string, replace?: { [varname: string]: string }): string {
    let out = (text.startsWith('=')
      ? LanguageManager.getRaw(d?.language, text.substr(1), true)
      : text)
    if (replace) {
      for (const key in replace)
        out = out.split(`{${key}}`).join(replace[key])
    }
    return out
  }

}
