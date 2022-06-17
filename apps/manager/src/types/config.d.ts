import * as redis from 'redis'
import { StringValue } from 'ms'
import { DockerOptions } from 'dockerode'


export type configjs = {
  port: number
  mongoUrl: string
  dockerOptions: DockerOptions
  dockerNetworkPrefix: string
  dockerLabels: {
    module: string
  }
}
