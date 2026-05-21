<script setup lang="ts">
const emit = defineEmits(['notif'])

const logout = async () => {
  if (!confirm('ログアウトしますか？')) return

  const authToken = useCookie('auth_token')
  const refreshToken = useCookie('auth_refresh_token') 

  try {

    await $fetch('https://apg-joetsu.tail02904.ts.net/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken.value}` },
      body: {
        refreshToken: refreshToken.value 
      }
    })
  } catch (e) {
    console.error('Logout API error:', e)
  } finally {

    authToken.value = null
    refreshToken.value = null
    useUserProfile().value = null as any
    
    navigateTo('/login')
  }
}

</script>


<template>
  <aside class="sidebar_left">
    <NuxtLink to="/">ホーム</NuxtLink>
    <NuxtLink to="/notification">通知</NuxtLink>
    <NuxtLink to="/profile">マイページ</NuxtLink>
    <button class="logout" @click="logout">ログアウト</button>
  </aside>

  <div class="side_right"></div>

</template>



<style>
.logout {
  background-color: transparent;
  color: white; 
  border: 1px solid white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
  margin: 20px 0;
}
.logout:hover {
  background-color: rgba(255, 68, 68, 0.1);
}

.sidebar_left {
  position: fixed;
  top: 85px;
  left: 0;

  width: 306px;
  height: calc(100vh - 85px);

  background: #5A5A5A;

  display: flex;
  flex-direction: column;

  align-items: center;
  gap: 25px;

  padding-top: 30px;

  border-right: inset 5px black;
 
  overflow: auto;
  z-index: 500;
}

.sidebar_left a {
    
    height: 55px;
    
    font-size: 23px;

    color: white;
    text-decoration: none;
    
    display: flex;
    justify-content: center;
    align-items: center;
    
    width: 230px;
    
    border: 2px solid white;
    
    border-radius: 30px;

    box-shadow: 0 2px 3px;

    
}

.sidebar_left a {
  transition: .3s;
}

.sidebar_left a:hover {
  
  background: #A9A9A9;
  transition: .3s;
  font-size: 25px;
}

.side_right{
    background-color: #5A5A5A;
    position: fixed;
    top: 85px;
    right: 0px;
    width: 236px;
    height: calc(100vh - 85px);
    border-left: solid 5px #2F3336;
    z-index: 500;
}

.router-link-exact-active{
    background: black;
}
</style>