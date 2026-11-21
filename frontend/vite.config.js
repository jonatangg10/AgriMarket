import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Dominio público del frontend (sin "/" final). Se usa en las etiquetas para
  // compartir el link (og:image, og:url), que necesitan una URL absoluta.
  const siteUrl = (env.VITE_SITE_URL || '').replace(/\/+$/, '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'agrimarket-site-url',
        transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),
      },
    ],
  }
})
