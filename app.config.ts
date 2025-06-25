import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from '@tanstack/react-start/config'
import tsConfigPaths from 'vite-tsconfig-paths'
import * as dotenv from 'dotenv'

dotenv.config();

export default defineConfig({
  server: {
    https: {
      cert: process.env.SSL_CRT_FILE,
      key : process.env.SSL_KEY_FILE,
      domains: ['local.petunia.chat'],
    }
  },
  tsr: {
    appDirectory: 'src/app',
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
    ],
    build: {
      rollupOptions: {
        external: [
          'pg-cloudflare'
        ]
      }
    }
  },
})