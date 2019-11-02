module.exports = {
  base: '/',
  title: '空与海之诗',
  description: 'Glass walls and waterfalls, can\'t stop your light from reaching my eyes.',
  head: [
    ['link', { rel: 'icon', href: '/icons/favicon.ico' }],
    ['link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/github-markdown-css/2.2.1/github-markdown.css' }]
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      {
        text: '计算机',
        items: [
          {text: '数据结构与算法', link: '/computer-science/algorithms/'},
          {text: '计算机科学基础', link: '/computer-science/basic/'},
          {text: '杂谈', link: '/computer-science/others/'}
        ]
      },
      { text: '历史', link: '/history/' },
      { text: '随笔', link: '/essay/' }
    ],
    sidebar: 'auto',
    sidebarDepth: 2
  },

  markdown: {
    lineNumbers: true,
    extendMarkdown(md) {
      md.set({breaks: true})
      md.use(require('markdown-it-katex'), {"throwOnError" : false, "errorColor" : " #cc0000"})
      md.use(require('markdown-it-footnote'))
    }
  }
}
