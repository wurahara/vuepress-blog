<template>
  <div class="wrapper">
    <br>
    <h1>{{ title }}</h1>
    <br>
    <div v-for="item in displaySites">
      <h3 class="series" v-if="item.frontmatter.series !== undefined">
        {{ item.frontmatter.series }}
      </h3>
      <h2 class="title-without-subtitle" v-if="item.frontmatter.subtitle === undefined">
        <a :href="item.path">{{ item.title }}</a>
      </h2>
      <h2 class="title-with-subtitle" v-if="item.frontmatter.subtitle !== undefined">
        <a :href="item.path">{{ item.title }}</a>
      </h2>
      <h3 class="subtitle" v-if="item.frontmatter.subtitle !== undefined">
        {{ item.frontmatter.subtitle }}
      </h3>
      <div class="time-and-tag">
        <span class="time">
          {{ item.frontmatter.date | dateParser }}
        </span>
      </div>
      <div class="body" v-html="item.excerpt">
      </div>
    </div>
    <div class="pagination">
      <el-pagination
        layout="prev, pager, next"
        :total="count"
        :current-page.sync="currentPage"
        @current-change="pageChange"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: null,
      keyword: null,
      siteProperties: null,
      filteredSites: null,
      count: 0,
      currentPage: 1,
      displaySites: null
    }
  },

  mounted () {
    if (typeof window !== 'undefined') {
      this.window = window
    }
    this.initialize()
  },

  filters: {
    dateParser (date) {
      let dateObject = new Date(date)
      return `${dateObject.getFullYear()}-${dateObject.getMonth() + 1}-${dateObject.getUTCDate()}`
    }
  },

  watch: {
    '$page.path': function () {
      this.initialize()
    }
  },

  methods: {
    initialize () {
      this.title = this.$page.title
      this.keyword = this.$page.frontmatter.keyword
      this.siteProperties = this.$site
      this.filteredSites = this.filter(this.siteProperties.pages)
      this.count = this.filteredSites.length
      this.setDisplay()
    },

    filter(siteList) {
      let filteredSiteList = []
      let regEx = new RegExp(`\/${this.keyword}\/`)
      siteList.forEach(element => {
        if (regEx.test(element.path) && element.path !== `/${this.keyword}/`) {
          filteredSiteList.push(element)
        }
      })
      let sortedSiteList = filteredSiteList.sort(
        this.compare("frontmatter", "date")
      )
      return sortedSiteList
    },

    compare(property1, property2) {
      return (obj1, obj2) => {
        let datetime1 = new Date(obj1[property1][property2])
        let datetime2 = new Date(obj2[property1][property2])
        return datetime2 - datetime1
      }
    },

    setDisplay () {
      let temp = []
      for (let index = 0; index < this.count; ++index) {
        if (index < (10 * this.currentPage) && (index >= 10 * (this.currentPage - 1))) {
          temp.push(this.filteredSites[index])
        }
      }
      this.displaySites = temp
      this.window.scrollTo(0, 0)
      // console.log(this.displaySites)
    },

    pageChange (page) {
      this.currentPage = page
      this.setDisplay()
    }
  }
}
</script>

<style scoped>

@media (min-width: 1366px) {
  .wrapper {
    width: 50%;
  }
}

@media (min-width: 720px) and (max-width: 1366px) {
  .wrapper {
    width: 60%;
  }
}

@media (min-width: 420px) and (max-width: 720px) {
  .wrapper {
    width: 70%;
  }
}

@media (max-width: 420px) {
  .wrapper {
    width: 90%;
  }
}

.wrapper {
  margin: 0 auto;
}

.series {
  margin-top: 5px;
  margin-bottom: 10px;
  color: grey;
}

.title-with-subtitle {
  margin-top: 10px;
  margin-bottom: 5px;
  border-bottom: 0px;
}

.title-without-subtitle {
  margin-top: 5px;
  margin-bottom: 10px;
}

.subtitle {
  color: grey;
  margin-top: 5px;
  margin-bottom: 10px;
  padding-bottom: 4.8px;
  border-bottom: 1px solid #eaecef;
}

.body {
  margin-bottom: 50px;
}

.pagination {
  text-align: center;
  margin-top: 50px;
  margin-bottom: 50px;
}

.time-and-tag {
  margin-bottom: 0px;
}

.time {
  font-weight: 200;
  color: gray;
}
</style>
