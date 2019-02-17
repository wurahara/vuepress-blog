<template>
  <div class="wrapper">

    <el-row type="flex" class="jumbo">
      <el-col :span="12" class="bangle">
        <h1>宋睿</h1>
      </el-col>
      <el-col :span="12" class="hero">
        <img src="/pictures/photo.jpg" width="150px">
      </el-col>
    </el-row>

    <el-row type="flex" class="jumbo">
      <el-col :span="24" class="title">
        <h2>社交网站</h2>
      </el-col>
    </el-row>

    <div>
      <font-awesome-icon icon="weibo" />
    </div>

    <el-row type="flex" class="jumbo">
      <el-col :span="24" class="title">
        <h2>技术特长</h2>
      </el-col>
    </el-row>

  </div>
</template>

<script>
export default {

}
</script>

<style scoped>

.wrapper {
  width: 60%;
  margin: 0 auto;
}

.jumbo {
  margin-top: 50px;
}
.bangle {
  margin-top: 30px;
  margin-left: 50px;
}

.hero {
  text-align: right;
  margin-right: 50px;
}

</style>
