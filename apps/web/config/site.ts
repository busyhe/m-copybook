export const siteConfig = {
  name: '字帖生成器',
  url: 'https://github.com/busyhe/m-copybook',
  ogImage:
    'https://og-image-craigary.vercel.app/**%E5%AD%97%E5%B8%96%E7%94%9F%E6%88%90%E5%99%A8**.png?theme=dark&md=1&fontSize=100px&images=https%3A%2F%2Fnobelium.vercel.app%2Flogo-for-dark-bg.svg',
  description: '在线中文字帖生成器，支持田字格、拼音、笔顺显示，可自定义字体大小和描红设置',
  links: {
    homepage: 'https://busyhe.com',
    twitter: 'https://twitter.com/busyhe_',
    github: 'https://github.com/busyhe'
  }
}

export type SiteConfig = typeof siteConfig

export const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
}
