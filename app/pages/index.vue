<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const notification = useNotifications()
const token = useCookie('auth_token')
const userProfile = useUserProfile()
const activeTab = ref('home')

const { data: homeRes, refresh: refreshHome } = await useFetch<any>('https://apg-joetsu.tail02904.ts.net/api/messages/timeline', {
  server: false,
  onRequest({ options }) {
    if (token.value) {
      const headers = new Headers(options.headers as HeadersInit)
      headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers
    }
  }
})


const { data: publicRes, refresh: refreshPublic } = await useFetch<any>('https://apg-joetsu.tail02904.ts.net/api/messages/public', {
  server: false,
  onRequest({ options }) {
    if (token.value) {
      const headers = new Headers(options.headers as HeadersInit)
      headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers
    }
  }
})

const { data: notificationRes, refresh: refreshNotifications } = await useFetch<any>('https://apg-joetsu.tail02904.ts.net/api/notifications', {
  server: false,
  params: { limit: 20 },
  onRequest({ options }) {
    if (token.value) {
      const headers = new Headers(options.headers as HeadersInit)
      headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers
    }
  }
})

watch(notificationRes, (newVal) => {
  if (newVal?.data && Array.isArray(newVal.data)) {
    notification.value = newVal.data.map((n: any) => {
      let msg = '通知があります'
      if (n.type === 'like') msg = ' があなたの投稿にいいねしました'
      if (n.type === 'reply') msg = ' があなたにリプライしました'
      if (n.type === 'follow') msg = ' にフォローされました'
      if (n.type === 'follow_request') msg = ' からフォローリクエストを受け取りました'

      return {
        id: n.id,
        userName: n.actor?.displayName || n.actor?.username || '不明なユーザー',
        message: msg,
        time: new Date(n.createdAt).toLocaleTimeString(),
        postId: n.targetId,
        isRead: n.isRead
      }
    })
  }
}, { immediate: true })

const formatPosts = (apiData: any) => {
  const rawPosts = apiData?.data?.messages || apiData?.data || []
  if (!Array.isArray(rawPosts)) return []

  return rawPosts.map((p: any) => ({
    id: p.id,
    userId: p.author?.id || p.userId,
    user: p.author?.displayName || p.author?.username || '名無し',
    content: p.content,
    likes: p.likeCount || 0,
    liked: p.isLiked || false,
    visibility: p.visibility,
    replyCount: p.replyCount,
    replyToId: p.replyToId,
    avatarUrl: p.author?.profileImageUrl,
    createdAt: p.createdAt,
    imageUrl: p.images && p.images.length > 0 ? p.images[0] : null,
    isFollowing: p.author?.isFollowing || false
  }))
}

const homePosts = computed(() => formatPosts(homeRes.value))
const publicPosts = computed(() => formatPosts(publicRes.value))
const currentPosts = computed(() => activeTab.value === 'home' ? homePosts.value : publicPosts.value)

const refreshAll = () => Promise.all([refreshHome(), refreshPublic(), refreshNotifications()])


const handleAddPost = async (text: string, visibility: string, imageFile: File | null) => {
  if (!token.value) return
  try {
    let uploadedImageUrl = null
    if (imageFile) {
      const formData = new FormData()
      formData.append('image', imageFile)
      const uploadRes: any = await $fetch('https://apg-joetsu.tail02904.ts.net/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
        body: formData
      })
      uploadedImageUrl = uploadRes?.imageUrl
      if (!uploadedImageUrl) throw new Error('画像URLの取得に失敗しました')
    }

    await $fetch('https://apg-joetsu.tail02904.ts.net/api/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { content: text, visibility, imageUrls: uploadedImageUrl ? [uploadedImageUrl] : [] }
    })
    await refreshAll()
  } catch (error) { console.error('投稿エラー:', error) }
}

const handlelike = async (id: string | number) => {
  if (!token.value) return
  const targetPost = currentPosts.value.find((p: any) => String(p.id) === String(id))
  if (!targetPost) return
  try {
    await $fetch(`https://apg-joetsu.tail02904.ts.net/api/messages/${id}/like`, {
      method: targetPost.liked ? 'DELETE' : 'POST',
      headers: { Authorization: `Bearer ${token.value}` }
    })
    await refreshAll()
  } catch (error) { console.error('いいねエラー:', error) }
}

const handleReply = async (postId: any, text: string) => {
  if (!token.value) return
  try {
    await $fetch('https://apg-joetsu.tail02904.ts.net/api/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { content: text, replyToId: String(postId) }
    })
    await refreshAll()
  } catch (error) { console.error('リプライエラー:', error) }
}

const handeleDelete = async (postId: number | string) => {
  if (!confirm('削除しますか？')) return
  try {
    await $fetch(`https://apg-joetsu.tail02904.ts.net/api/messages/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    })
    await refreshAll()
  } catch (error) { alert("エラー: 自分以外の投稿は削除できません") }
}
</script>

<template>
  <div class="maincontent">
    <div class="sticky-wrapper">

      <div class="tab-container">
        <div class="tab-item" :class="{ active: activeTab === 'home' }" @click="activeTab = 'home'">
          フォロー中
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'public' }" @click="activeTab = 'public'">
          グローバル
        </div>
      </div>

      <Newform @submit-post="handleAddPost" />
      <div class="divider"></div>
    </div>

    <Timeline
      :posts="currentPosts"
      :current-user-id="userProfile.id"
      @like="handlelike"
      @reply="handleReply"
      @delete="handeleDelete"
    />
  </div>
</template>

<style>
html, body {
  background-color: #121212 !important;
  margin: 0;
  padding: 0;
}
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
.divider {
  width: 100%;
  height: 2px;
  background-color: #333;
  margin-top: 15px;
}

.tab-container {
  display: flex;
  width: 100%;
  max-width: 600px;
  border-bottom: 1px solid #333;
  margin-bottom: 10px;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  color: #888;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}
.tab-item.active {
  color: #fff;
  border-bottom: 3px solid #1d9bf0;
}
.tab-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>