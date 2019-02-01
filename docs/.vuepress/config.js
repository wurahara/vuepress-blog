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
    ['link', { rel: "stylesheet", href: "https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.10.0/github-markdown.min.css" }]
  ],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '时间线', link: '/blog/' },
      { text: '分类', link: '/group/' },
    ],
    sidebar: 'auto',
    sidebarDepth: 4,
    activeHeaderLinks: true
  }
}
