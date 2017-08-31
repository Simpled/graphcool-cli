import out from '../../io/Out'

const {terminal} = require('terminal-kit')

export default async function Prompt(question: string): Promise<void> {
  out.write(question)
  await waitForInput()
}

function waitForInput() {
  terminal.grabInput(true)

  return new Promise(resolve => {
    terminal.on('key', function (name) {
      if (name !== 'y') {
        process.exit(0)
      }
      terminal.grabInput(false)
      resolve()
    })
  })
}
