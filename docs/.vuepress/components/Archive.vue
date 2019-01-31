<template>
  <div>
    <div v-for="item in filteredSites">
      <h2>
        <a :href="item.path">{{ item.title }}</a>
      </h2>
      <div v-html="item.excerpt"></div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      siteProperties: null,
      filteredSites: null
    };
  },

  created () {
    this.siteProperties = this.$site
    this.filteredSites = this.filter(this.siteProperties.pages)
    console.log(this.filteredSites)
  },

  methods: {
    filter (siteList) {
      let filteredSiteList = []
      let regEx = /\/blog\//
      siteList.forEach(element => {
        // console.log(element.path)
        // console.log(regEx.test(element.path))
        if (regEx.test(element.path) && element.path !== '/blog/') {
          filteredSiteList.push(element)
        }
      })

      return filteredSiteList
    }
  }
}
</script>
