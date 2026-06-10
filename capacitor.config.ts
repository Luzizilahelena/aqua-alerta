import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.marealerta',
  appName: 'Maré Alerta',
  webDir: 'dist',
  server: {
    // Aponta para a preview da Lovable durante o desenvolvimento.
    // Para gerar build de produção, remova `url` e rode `bun run build` + `npx cap sync`.
    url: 'https://0a84989d-ebd6-4153-b18b-ae448e2c358a.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
