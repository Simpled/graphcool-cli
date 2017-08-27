import open = require('open')
import { docsEndpoint, openedQuickstartMessage } from '../utils/constants'
import { checkAuth } from '../utils/auth'
import out from '../io/Out'

export interface QuickstartProps {
}

export default async (props: QuickstartProps): Promise<void> => {
  const alreadyAuthenticated = await checkAuth('quickstart')

  if (alreadyAuthenticated) {
    open(`${docsEndpoint}/quickstart`)

    out.write(openedQuickstartMessage)
  }
}

