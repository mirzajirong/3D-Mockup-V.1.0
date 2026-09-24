export const APP_CONFIG = {
  name: 'Editor Suite Studio',
  tagline: 'Made by editors, for editors.',
  subdomain: 'mockup.editorsuite.id',
  domain: 'editorsuite.id',
  assets: {
    // Local path bundled with the exact Cloudflare file to bypass browser CORS restrictions
    modelONeck: '/models/01.O-Neck.glb',
    remoteModelONeck: 'https://cloudflare.editorsuite.id/01.O-Neck.glb',
    logo: '/assets/logo-editorsuite.svg',
    remoteLogo: 'https://cloud.editorsuite.id/resource-app/logo-editorsuite.svg',
    uvMapONeck: '/assets/01.O-Neck.svg',
    remoteUvMapONeck: 'https://cloud.editorsuite.id/resource-app/svg-uv-map/01.O-Neck.svg',
  },
  theme: {
    bgMain: '#000000',
    bgPanel: '#141414',
    border: '#292929',
    accent: '#DB0B2B',
  },
};
