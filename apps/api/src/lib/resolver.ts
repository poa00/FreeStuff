import { AnnouncementDataType, LanguageDataType, ProductDataType } from "@freestuffbot/common"
import Mongo from "../database/mongo"


export default class Resolver {

  private static productCache: Map<number, ProductDataType> = new Map()

  public static async resolveProduct(id: number): Promise<ProductDataType> {
    if (Resolver.productCache.has(id))
      return Resolver.productCache.get(id)
    
    const data = await Mongo.Product
      .findById(id)
      .lean(true)
      .exec()
      .catch(console.error)

    Resolver.productCache.set(id, data)
    return data
  }

  //

  private static announcementCache: Map<number, AnnouncementDataType> = new Map()

  public static async resolveAnnouncement(id: number): Promise<AnnouncementDataType> {
    if (Resolver.announcementCache.has(id))
      return Resolver.announcementCache.get(id)
    
    const data = await Mongo.Announcement
      .findById(id)
      .lean(true)
      .exec()
      .catch(console.error)

    Resolver.announcementCache.set(id, data)
    return data
  }

  //

  private static languagesCache: Map<string, LanguageDataType> = new Map()

  public static async resolveLanguage(id: string): Promise<LanguageDataType> {
    if (Resolver.languagesCache.has(id))
      return Resolver.languagesCache.get(id)
    
    const data = await Mongo.Language
      .findById(id)
      .lean(true)
      .exec()
      .catch(console.error)

    Resolver.languagesCache.set(id, data)
    return data
  }

  //

  private static channelsCache: Map<string, number[]> = new Map()

  public static async resolveChannel(name: string): Promise<number[]> {
    if (Resolver.channelsCache.has(name))
      return Resolver.channelsCache.get(name)

    const query = {
      status: 'published',
      'data.type': name,
      'data.until': { $gt: Date.now() }
    }

    const data = await Mongo.Product
      .find(query)
      .lean(true)
      .select({ _id: 1 })
      .exec()
      .catch(console.error)

    const out: number[] = data
      ? data.map(d => d._id)
      : null

    Resolver.channelsCache.set(name, out)
    return out
  }

  //

  public static clearCache() {
    Resolver.productCache.clear()
    Resolver.announcementCache.clear()
    Resolver.languagesCache.clear()
    Resolver.channelsCache.clear()
  }

}
