import Deploy from './commands/deploy'
import Init from './commands/init'
import Auth from './commands/auth/index'
import RemoveEnv from './commands/env/remove'
import DefaultEnv from './commands/env/default'
import RenameEnv from './commands/env/rename'
import SetEnv from './commands/env/set'


export const topics = [
  { name: 'deploy', description: 'Deploy local project definition' },
  { name: 'init', description: 'Create a new project' },
  { name: 'auth', description: 'Create account or login' },
  { name: 'env', description: 'Manage project environment' }
]

export const commands = [Deploy, Init, Auth, SetEnv, RemoveEnv, DefaultEnv, RenameEnv]