import client from '../../io/Client'
import Selection from './Selection'

export async function ProjectSelection(): Promise<string> {
  const projects = await client.fetchProjects()

  const selectedIndex = await Selection('', projects.map(project => [`${project.name} (${project.id})`]))

  return projects[selectedIndex].id
}
