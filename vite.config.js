import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: 'simualacion_hemiciclo',
  server: {
    allowedHosts: [
      'rvgusf-ip-80-28-53-229.tunnelmole.net'
    ]
  }
})
