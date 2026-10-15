import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { brotliCompress, constants, gzip } from 'node:zlib'
import type { Plugin } from 'vite'

const brotli = promisify(brotliCompress)
const gz = promisify(gzip)

/**
 * Writes `.br` and `.gz` next to every text asset at build time, at the highest
 * compression levels (too slow to do per request, free to do once). The API's
 * static server sends them as-is to browsers that accept them.
 */
export function precompress(): Plugin {
  return {
    name: 'precompress',
    apply: 'build',
    async writeBundle({ dir = 'dist' }, bundle) {
      const files = Object.keys(bundle).filter((file) => /\.(js|css|html|svg|json)$/.test(file))
      await Promise.all(
        files.map(async (file) => {
          const path = join(dir, file)
          const data = await readFile(path)
          if (data.length < 1024) return // not worth a second request header's worth of bytes
          await Promise.all([
            brotli(data, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).then((out) =>
              writeFile(`${path}.br`, out),
            ),
            gz(data, { level: 9 }).then((out) => writeFile(`${path}.gz`, out)),
          ])
        }),
      )
    },
  }
}
