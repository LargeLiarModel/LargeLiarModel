// biome-ignore lint/style/useImportType: <explanation>
import app, { type AppType } from './app'
import { hc } from 'hono/client'

// this is a trick to calculate the type when compiling
const client = hc<AppType>('')
export type Client = typeof client

export const hcWithType = (...args: Parameters<typeof hc>): Client => {
  return hc<AppType>(...args) as Client
}
