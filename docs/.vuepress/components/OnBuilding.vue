<template>
  <div class="wrapper">

    <el-row type="flex" justify="center">
      <el-col :span="24" align="center">
        <img class="cons-pic" src="/pictures/under-construction.png">
      </el-col>
    </el-row>

    <el-row type="flex" justify="center">
      <el-col :span="24" align="center">
        <h1 class="title">长期施工中    请不要期待</h1>
      </el-col>
    </el-row>

    <el-row type="flex" justify="center">
      <el-col :span="24" align="center">
        <h3 class="subtitle">Under Construction</h3>
      </el-col>
    </el-row>

    
  </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.cons-pic {
  width: 300px;
  margin-top: 100px;
}

.title {
  margin-bottom: 5px;
}

.subtitle {
  margin-top: 5px;
  font-weight: 300;
  font-size: 20px;
}
</style>
