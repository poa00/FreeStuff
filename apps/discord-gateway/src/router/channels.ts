import { Request, Response } from 'express'
import ChannelsData from '../data/channels-data'
import { MAGICNUMBER_BAD_GATEWAY } from '../lib/magic-number'


export async function getChannels(req: Request, res: Response) {
  const guild = req.params.guild
  if (!guild)
    return void res.status(400)

  const channels = await ChannelsData.findChannels(guild, Object.keys(req.query))

  if (!channels)
    return void res.status(404).end()

  if (channels === MAGICNUMBER_BAD_GATEWAY)
    return void res.status(502).end()

  res.status(200).send(channels)
}
