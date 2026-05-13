<script setup lang="ts">
import Sidebar from '~/components/Sidebar.vue'


const token = useCookie('accessToken')
console.log('トークン:', token.value)

const { data: apiResponse, pending } = await useFetch<any>('https://apg-joetsu.tail02904.ts.net/api/notifications', {
  headers: {
    Authorization: `Bearer ${token.value}`
  },
  server: false,

  onRequest({ options }) {
    const token = useCookie('auth_token')

    if (token.value) {
      const headers = new Headers(options.headers as HeadersInit)
      headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers
    }
    }
  }

)


const notifications = computed(() => {

  return apiResponse.value?.data || []
})

const goToPost = (postId: any) => {
  if (postId) {
    navigateTo(`/posts/${postId}`)
  }
}
</script>


<template>
  
  <div class="main-layout">
    <Sidebar />
  </div>

  <div class="maincontent">
    <div class="notif-wrapper">
      <h2>通知一覧</h2>
      
      <div v-if="pending" class="empty-msg">
        読み込み中...
      </div>

      <div v-else-if="notifications.length === 0" class="empty-msg">
        まだ通知はありません
      </div>
      
      <div v-for="notif in notifications" :key="notif.id" class="notification-item" @click="goToPost(notif.targetId)">
        <div class="notif-header">
          <strong>{{ notif.actor?.displayName || notif.actor?.username || '誰か' }}</strong>    
          <span>{{ notif.type === 'like' ? 'さんがあなたの投稿にいいねしました' : 'さんがあなたに反応しました' }}</span>
          <span class="notif-time">{{ new Date(notif.createdAt).toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>

.maincontent {
  margin-top: 85px;
  margin-left: 306px;  
  margin-right: 236px; 
  min-height: 100vh;
  background-color: #121212;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.notif-wrapper {
  width: 100%;
  max-width: 600px;
  padding: 20px;
}

h2 {
  border-bottom: 1px solid #333;
  padding-bottom: 15px;
  margin-top: 0;
}

.notification-item{
  border-bottom: 1px solid #333;
  padding: 15px 0;
  font-size: 16px;
  cursor: pointer;
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.notif-header {
  margin-bottom: 5px;
}

.notif-time {
  color: #888;
  font-size: 12px;
  margin-left: 10px;
}

.empty-msg {
  color: #888;
  text-align: center;
  margin-top: 50px;
}
</style>