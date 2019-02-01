<template>
  <div class="wrapper">
    <br>
    <div v-for="item in filteredSites">
      <h2>
        <a :href="item.path">{{ item.title }}</a>
      </h2>
      <div v-html="item.excerpt"></div>
      <br>
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
  },

  methods: {
    filter (siteList) {
      let filteredSiteList = []
      let regEx = /\/blog\//
      siteList.forEach(element => {
        if (regEx.test(element.path) && element.path !== '/blog/') {
          filteredSiteList.push(element)
        }
      })
      let sortedSiteList = filteredSiteList.sort(this.compare('frontmatter', 'date'))
      return sortedSiteList
    },

    compare (property1, property2) {
      return (obj1, obj2) => {
        let datetime1 = new Date(obj1[property1][property2])
        let datetime2 = new Date(obj2[property1][property2])
        return datetime2 - datetime1
      }
    }
  }
}
</script>

<style scoped>
.wrapper {
  width: 50%;
  margin: 0 auto;
}
</style>
