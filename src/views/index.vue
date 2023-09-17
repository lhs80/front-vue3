<template>
  <!--第三方组件-->
  <x-header
    :title="headerInfo.title"
    :userName="headerInfo.userName"
    :showBackIcon="headerInfo.showBackIcon"
    :currentPhoneNumber="headerInfo.currentPhoneNumber"
    :isOpenPasswordSecurity="headerInfo.isOpenPasswordSecurity"
    @back="back"
    @loginOut="loginOut"
    @submitPassword="submitPassword"
    @submitPhone="submitPhone"
  />
  <h4>我是默认的首页，必须放在views目录下</h4>
  <!--路由跳转，需要传参的话需要使用{path:'',query:{}}方式-->
  <el-button type="primary" @click="router.push('/about')">about</el-button>
  <!--svg图标使用-->
  <SvgIcon name="svg-vite"/>
  <!--字体图标使用-->
  <SvgIcon name="icon_zhedieshipin" title="折叠视频" :size="24" color="currentColor"/>
</template>
<script setup lang="ts">
  const router = useRouter();
  const headerInfo = {
    showBackIcon: false,
    title: "测试",
    userName: "测试",
    systemLogoUrl: "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    systemName: "云视庭ss",
    isOpenPasswordSecurity: false,
  };
  const back = () => {
    console.log("back");
  };
  const loginOut = () => {
    console.log("loginOut");
  };
  const submitPassword = (value: string) => {
    console.log(value);
  };
  const submitPhone = (value: string) => {
    console.log(value);
  };
</script>

<style scoped>

</style>