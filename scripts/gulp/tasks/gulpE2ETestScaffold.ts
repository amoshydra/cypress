import chokidar from 'chokidar'
import path from 'path'
import fs from 'fs-extra'

import { monorepoPaths } from '../monorepoPaths'

const PROJECT_FIXTURE_DIRECTORY = 'system-tests/projects'

const DIR_PATH = path.join(monorepoPaths.root, PROJECT_FIXTURE_DIRECTORY)
const OUTPUT_PATH = path.join(monorepoPaths.pkgFrontendShared, 'cypress/e2e/support/e2eProjectDirs.ts')

export async function e2eTestScaffold () {
  const possibleDirectories = await fs.readdir(DIR_PATH)
  const dirs = await Promise.all(possibleDirectories.map(async (dir) => {
    const fullPath = path.join(DIR_PATH, dir)
    const stat = await fs.stat(fullPath)

    if (stat.isDirectory()) {
      return fullPath
    }
  }))
  const allDirs = dirs.filter((dir) => dir) as string[]

  await fs.writeFile(
    OUTPUT_PATH,
`/* eslint-disable */
// Auto-generated by ${path.basename(__filename)}
export const e2eProjectDirs = [
${allDirs
.map((dir) => `  '${path.basename(dir)}'`).join(',\n')}
] as const
`,
  )

  return allDirs
}

export async function e2eTestScaffoldWatch () {
  const fixtureWatcher = chokidar.watch(PROJECT_FIXTURE_DIRECTORY, {
    cwd: monorepoPaths.pkgServer,
    // ignoreInitial: true,
    depth: 0,
  })

  fixtureWatcher.on('unlinkDir', () => {
    e2eTestScaffold()
  })

  fixtureWatcher.on('addDir', () => {
    e2eTestScaffold()
  })
}
