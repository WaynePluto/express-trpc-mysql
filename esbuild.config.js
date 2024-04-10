const esbuild = require('esbuild')

const options = {
  entryPoints: ['src/app.ts'],
  outdir: 'dist',
  sourcemap: false,
  bundle: true,
  platform: 'node',
  minify: true,
  external: ['pg', 'better-sqlite3', 'tedious', 'mysql', 'oracledb', 'pg-query-stream', 'sqlite3'],
  alias: {
    '@': 'src',
  },
}

esbuild.build(options).catch(err => {
  console.error(err)
  process.exit(1)
})
