import client from '../../io/Client'

const {terminal} = require('terminal-kit')

export async function ProjectSelection(): Promise<string> {
  const projects = await client.fetchProjects()
  const projectNames = projects.map(project => `${project.name} (${project.id})`)

  const selectedIndex = await new Promise<number>(r => {
    const command = projectNames.length >= 12 ? 'gridMenu' : 'singleColumnMenu'
    terminal[command](projectNames, (err, res) => {
      terminal( '\n' ).eraseLineAfter.green(
        "Selected project: %s\n" ,
        res.selectedText
      );
      terminal.hideCursor(false)
      terminal.grabInput(false)
      r(res.selectedIndex)
    })
  })

  return projects[selectedIndex].id
}
