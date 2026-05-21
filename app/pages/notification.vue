<script setup lang="ts">
import { computed } from 'vue'

const token = useCookie('auth_token')


const { data: requestsRes, refresh: refreshRequests } = await useFetch<any>('https://apg-joetsu.tail02904.ts.net/api/follows/pending', {
  server: false,
  onRequest({ options }) {
    if (token.value) {
      const headers = new Headers(options.headers as HeadersInit)
      headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers
    }
  }
})


const { data: notificationRes, refresh: refreshNotis } = await useFetch<any>('https://apg-joetsu.tail02904.ts.net/api/notifications', {
  server: false,
  onRequest({ options }) {
    if (token.value) {
      const headers = new Headers(options.headers as HeadersInit)
      headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers
    }
  }
})


const followRequests = computed(() => {
  const combined: any[] = []


  const rawReqs = requestsRes.value?.data || requestsRes.value || []
  if (Array.isArray(rawReqs)) {
    rawReqs.forEach((req: any) => {
      combined.push({
        id: req.followerId, 
        user: req.user?.displayName || `ユーザー (${req.followerId.slice(0, 8)}...)`,
        username: req.user?.username || req.followerId,
        avatarUrl: req.user?.profileImageUrl,
        isRequest: true 
      })
    })
  }


  const rawNotis = notificationRes.value?.data || notificationRes.value || []
  if (Array.isArray(rawNotis)) {
    rawNotis.forEach((n: any) => {
      let actionMsg = '通知があります'
      if (n.type === 'like') actionMsg = 'さんがあなたの投稿をいいねしました'
      if (n.type === 'reply') actionMsg = 'さんがあなたに返信しました'
      if (n.type === 'follow') actionMsg = 'さんにフォローされました'

      combined.push({
        id: n.id,
        user: (n.actor?.displayName || '誰か') + ' ' + actionMsg,
        username: n.actor?.username || 'unknown',
        avatarUrl: n.actor?.profileImageUrl,
        isRequest: false 
      })
    })
  }

  return combined
})


const refreshAll = () => Promise.all([refreshRequests(), refreshNotis()])

const handleApprove = async (userId: string) => {
  try {
    await $fetch(`https://apg-joetsu.tail02904.ts.net/api/follows/${userId}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { userId: userId }
    })
    alert('フォローを承認しました！')
    await refreshAll()
  } catch (error) { console.error(error) }
}

const handleReject = async (userId: string) => {
  try {
    await $fetch(`https://apg-joetsu.tail02904.ts.net/api/follows/${userId}/reject`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` }
    })
    await refreshAll()
  } catch (error) { console.error(error) }
}
</script>

<template>
  <div class="maincontent">
    <div class="sticky-wrapper">
      <div class="header-area">
        <h2 class="page-title">通知 / フォローリクエスト</h2>
      </div>
      <div class="divider"></div>
    </div>

    <div class="requests-container">
      <div v-if="followRequests.length === 0" class="no-requests">
        現在、通知はありません。
      </div>

      <div v-for="req in followRequests" :key="req.id" class="request-card">
        <div class="user-icon-sample" :style="req.avatarUrl ? `background-image: url(${req.avatarUrl}); background-size: cover;` : ''"></div>
        
        <div class="user-info">
          <div class="user-names">
            <h3 class="display-name">{{ req.user }}</h3>
            <span class="user-id">@{{ req.username }}</span>
          </div>
          
          <div class="action-buttons">
            <template v-if="req.isRequest">
              <button class="reject-btn" @click="handleReject(req.id)">拒否</button>
              <button class="approve-btn" @click="handleApprove(req.id)">承認</button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.maincontent {
  margin-top: 85px;
  margin-left: 303px;  
  margin-right: 233px; 
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #121212;
}
.sticky-wrapper {
  position: sticky;
  top: 85px;
  z-index: 100;
  background-color: #121212;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
}
.header-area {
  width: 100%;
  max-width: 600px;
  padding: 0 15px 15px 15px;
}
.page-title {
  color: #fff;
  font-size: 20px;
  margin: 0;
  font-weight: bold;
}
.divider {
  width: 100%;
  height: 2px;
  background-color: #333;
}
.requests-container {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
}
.no-requests {
  padding: 30px;
  color: #71767b;
  text-align: center;
}
.request-card {
  display: flex;
  padding: 15px 20px;
  border-bottom: 1px solid #333;
  transition: background-color 0.2s;
}
.request-card:hover {
  background-color: rgba(255, 255, 255, 0.03);
}
.user-icon-sample {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #555;
  margin-right: 15px;
}
.user-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.display-name {
  color: #fff;
  font-size: 15px;
  font-weight: bold;
  margin: 0;
}
.user-id {
  color: #71767b;
  font-size: 14px;
}
.action-buttons {
  display: flex;
  gap: 10px;
}
.approve-btn, .reject-btn {
  border-radius: 20px;
  padding: 6px 16px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}
.approve-btn {
  background-color: #eff3f4;
  color: #0f1419;
  border: none;
}
.approve-btn:hover {
  background-color: #d7dbdc;
}
.reject-btn {
  background-color: transparent;
  color: #eff3f4;
  border: 1px solid #536471;
}
.reject-btn:hover {
  background-color: rgba(239, 243, 244, 0.1);
}
</style>