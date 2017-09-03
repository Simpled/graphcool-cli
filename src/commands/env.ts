import env from '../io/Environment'
import out from '../io/Out'
import { envDefault, envRemove, envRename, envSet } from '../utils/constants'
import {
  usageDefaultEnvironment,
  usageEnvironment,
  usageRemoveEnvironment,
  usageRenameEnvironment,
  usageSetEnvironment
} from '../utils/usage'

export type EnvProps = string[]

export default async function envCommand(props: EnvProps) {
  const subCommand = props[1]

  if (!subCommand) {
    out.write(usageEnvironment)
    return
  }

  switch (subCommand) {
    case 'set': {
      const envName = props[2]
      const projectId = props[3]
      if (!envName || !projectId) {
        return out.write(usageSetEnvironment)
      }
      return set(envName, projectId)
    }
    case 'rename':
      const oldName = props[2]
      const newName = props[3]
      if (!oldName || !newName) {
        return out.write(usageRenameEnvironment)
      }
      return rename(oldName, newName)
    case 'remove': {
      const envName = props[2]
      if (!envName) {
        return out.write(usageRemoveEnvironment)
      }
      return remove(envName)
    }
    case 'default':
      const envName = props[2]
      if (!envName) {
        return out.write(usageDefaultEnvironment)
      }
      return setDefault(envName)
    default:
      throw new Error(`Unknown command ${props}`)
  }
}

async function set(envName: string, projectId: string) {
  await env.set(envName, projectId)
  env.save()
  out.write(envSet(envName, projectId))
}

function rename(oldName: string, newName: string) {
  env.rename(oldName, newName)
  env.save()
  out.write(envRename(oldName, newName))
}

function remove(envName: string) {
  env.remove(envName)
  env.save()
  out.write(envRemove(envName))
}

function setDefault(envName: string) {
  env.setDefault(envName)
  env.save()
  out.write(envDefault(envName))
}
