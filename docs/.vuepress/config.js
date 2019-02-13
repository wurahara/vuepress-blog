module.exports = {
  base: '/',
  title: '空与海之诗',
  description: 'Glass Walls and Waterfalls',
  markdown: {
    anchor: {
      permalink: true
    },
    lineNumbers: true,
    toc: {
      includeLevel: [2, 3, 4]
    },
    config: md => {
      md.use(require('markdown-it-katex'))
    }
  },
  head: [
    ['link', { rel: 'icon', href: '/icons/favicon.ico' }],
    ['link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.css' }],
    ['link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.10.0/github-markdown.min.css' }]
  ],
  themeConfig: {
    serviceWorker: {
      updatePopup: true
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '计算机', link: '/computer-science/' },
      { text: '历史', link: '/history/' },
      { text: '随笔', link: '/essay/' },
      // { text: '关于', link: '/about/' }
    ],
    sidebar: 'auto',
    sidebarDepth: 4,
    activeHeaderLinks: true
  },
  plugins: ['@vuepress/back-to-top']
}
