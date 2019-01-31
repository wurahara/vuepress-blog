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
    }
  },
  head: [
    ['link', { rel: 'icon', href: '/icons/favicon.ico' }]
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
