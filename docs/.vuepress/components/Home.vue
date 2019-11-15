<template>
  <div>
    <el-row type="flex" justify="center">
      <el-col :span="24" class="hero-slot">
        <img src="https://images.herculas.cn/image/blog/management/title.png" width="180">
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24" class="title-slot">
        {{ $site.title }}
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24" class="description-slot">
        {{ $site.description }}
      </el-col>
    </el-row>

    <el-row>

      <el-col :xs="24" :sm="8">
        <a href="/computer-science/basic/">
          <el-card :body-style="{ padding: '0px' }" class="card">
            <div class="card-icon card-icon-green">
              <svg width="90" height="70" viewBox="0 0 127 100" xmlns="http://www.w3.org/2000/svg">
                <g fill="#37B475" fill-rule="evenodd">
                  <path d="M118.56 53.605l-25.023 28.37 4.124 3.64 26.706-30.278 1.69-1.918-1.788-1.827-29.012-29.606-3.928 3.85 27.232 27.768zM8.415 55.375L33.13 28.99l-4.015-3.76L2.543 53.598.687 55.58l1.958 1.88L31.51 85.203l3.812-3.965L8.415 55.375zM46.52  99.636l4.802 1.394 28.68-98.81L75.198.828l-28.68 98.81z">
                  </path>
                </g>
              </svg>
            </div>
            <div style="padding: 14px;">
              <span class="group-title">计算机科学</span>
            </div>
          </el-card>
        </a>
      </el-col>

      <el-col :xs="24" :sm="8">
        <a href="/history/">
          <el-card :body-style="{ padding: '0px' }" class="card">
            <div class="card-icon card-icon-yellow">
              <svg width="70" height="60" viewBox="0 0 112 90" xmlns="http://www.w3.org/2000/svg">
                <g fill="#FF465A" fill-rule="evenodd">
                  <path d="M111.017 0h-111v90h111V0zM5 85V5h101v80H5z">
                  </path>
                  <path d="M55 21h28.818v4H55zM55 32h41.625v4H55zM55 55h28.818v4H55zM55 66h41.625v4H55zM44 49H15v24h29V49zm-3 21H18V52h23v18z">
                  </path>
                  <path d="M25.118 54.526v12.898l11.194-6.45-11.194-6.448zM44 17H15v24h29V17zm-3 21H18V20h23v18z">
                  </path>
                  <path d="M24.118 22.182V35.08l11.194-6.45-11.194-6.448z">
                  </path>
                </g>
              </svg>
            </div>
            <div style="padding: 14px;">
              <span class="group-title">地摊历史</span>
            </div>
          </el-card>
        </a>
      </el-col>

      <el-col :xs="24" :sm="8">
        <a href="/essay/">
          <el-card :body-style="{ padding: '0px' }" class="card">
            <div class="card-icon card-icon-red">
              <svg width="70" height="70" viewBox="0 0 117 102" xmlns="http://www.w3.org/2000/svg">
                <g stroke="#18BAD9" fill="#18BAD9" fill-rule="evenodd">
                  <path d="M107.74 101H9.84L.702 84.333l.353-.877L49.212 1H67.14L116 83.105 107.74 101zM11.95 97.49h93.678l6.68-14.21L65.205 4.51H51.32L4.57 84.332l7.382 13.158z">
                  </path>
                  <path d="M12.303 100.65l-2.988-1.755 40.952-71.58L74.345 66.09l-2.987 1.754-20.916-33.684-38.14 66.49z">
                  </path>
                  <path d="M91.92 69.42H43.94v-3.508h41.83L48.86 3.807l2.988-1.754L91.92 69.42z">
                  </path>
                  <path d="M114.242 85.21h-82.43l24.08-44.385 2.987 1.754L37.787 81.7h76.454v3.51z">
                  </path>
                </g>
              </svg>
            </div>
            <div style="padding: 14px;">
              <span class="group-title">蹩脚随笔</span>
            </div>
          </el-card>
        </a>
      </el-col>

      <el-footer class="footer">
        Powered by <a href="https://vuepress.vuejs.org/" target="_blank">VuePress</a> | Copyright © 2017-2019 <a href="https://github.com/wurahara" target="_blank">wurahara</a>
      </el-footer>

    </el-row>
  </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.hero-slot {
  text-align: center;
  margin-top: 15px;
}

.title-slot {
  text-align: center;
  font-size: 48px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 20px;
}

.description-slot {
  text-align: center;
  font-size: 24px;
  font-weight: 400;
  color: gray;
  margin-bottom: 70px;
}

.card {
  margin:0 auto 40px auto;
  text-align: center;
}

@media (min-width: 768px) {
  .hero-slot {
    width: 296px !important;
  }

  .card {
    width: 230px;
  }
}

@media (min-width: 500px) and (max-width: 768px) {
  .hero-slot {
    width: 296px !important;
  }

  .card {
    width: 70%;
  }
}

@media (max-width: 500px) {
  .hero-slot {
    width: 296px !important;
  }
  
  .card {
    width: 95%;
  }
}

.card-icon {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-box-pack: center;
  -webkit-box-align: center;
}

.card-icon-green {
  background-color: #54CA95;
}

.card-icon-yellow {
  background-color: #FF7387;
}

.card-icon-red {
  background-color: #79D9EA;
}

.group-title {
  font-family: 'Hiragino Sans GB', 'SimHei', sans-serif;
}

.footer {
  text-align: center;
}
</style>
