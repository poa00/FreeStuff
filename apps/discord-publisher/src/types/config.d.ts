

export type configjs = {
  port: number
  mongoUrl: string
  rabbitUrl: string
  network: {
    umiAllowedIpRange: string
  }
  behavior: {
    /** requests per frame */
    upstreamRequestRate: number
    /** frame size in ms */
    upstreamRequestInterval: number
    /** maximum amount of times to try to re-publish a failed request */
    upstreamMaxRetries: number
    /** the amount of subtasks to split off */
    publishSplitTaskAmount: number
    /** the amount of requests to queue until waiting for the queue to clear up */
    publishTaskBatchSize: number
  }
  freestuffApi: {
    baseUrl: string
    auth: string
  }
}
