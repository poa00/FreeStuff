import { Task, TaskId } from "@freestuffbot/rabbit-hole"
import RabbitHole from '@freestuffbot/rabbit-hole'
import { config } from ".."
import Mongo from "../database/mongo"
import { Const, GuildDataType, GuildSanitizer, Localisation, Themes } from "@freestuffbot/common"
import axios from "axios"


export default async function handleDiscordTestOne(task: Task<TaskId.DISCORD_TEST_ONE>): Promise<boolean> {
  console.log(task)
  const guild: GuildDataType = await Mongo.Guild
    .findById(task.g)
    .lean(true)
    .exec()
    .catch(() => {})

    console.log(guild)

  if (!guild) return true

  const sanitizedGuild = GuildSanitizer.sanitize(guild)

  const theme = Themes.build(
    [ Const.testAnnouncementContent ],
    sanitizedGuild,
    { test: true, donationNotice: false }
  )

  // TODO init Localization
  const localized = Localisation.translateObject(theme, sanitizedGuild, {}, 6)
  
  // axios.post(`https://discord.com/api/webhooks/${sanitizedGuild.webhook}`, localized)
  console.log('YO LETS GO, ' + sanitizedGuild.id.toString())

  return true
}
