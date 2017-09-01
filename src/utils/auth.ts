import { AuthTrigger } from '../types'
import { GraphcoolAuthServer } from '../io/GraphcoolAuthServer'
import authCommand from '../commands/auth'
import config from '../io/GraphcoolRC'

export async function checkAuth(authTrigger: AuthTrigger): Promise<boolean> {
  if (config.token) {
    return true
  }

  await authCommand({}, new GraphcoolAuthServer(authTrigger))
  return false
}