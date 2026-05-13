<script setup lang="ts">
import { ref, computed } from 'vue'

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


const formatPosts = (apiData: any) => {
  if (!apiData?.data) return []
  return apiData.data.map((p: any) => ({
    id: p.id,
    userId: p.author?.id || p.userId,
    user: p.author?.displayName || p.author?.username || '名無し',
    content: p.content,
    likes: p.likeCount || 0,
    liked: p.isLiked || false,
    visibility: p.visibility,
    replyCount: p.replyCount,
    replyToId: p.replyToId,
    replyTo: p.replyTo,
    avatarUrl: p.author?.profileImageUrl,
    createdAt: p.createdAt,
    imageUrl: p.imageUrl || p.mediaUrl || null
  }))
}

const homePosts = computed(() => formatPosts(homeRes.value))
const publicPosts = computed(() => formatPosts(publicRes.value))


const currentPosts = computed(() => {
  return activeTab.value === 'home' ? homePosts.value : publicPosts.value
})

const refreshAll = () => Promise.all([refreshHome(), refreshPublic()])


const handleAddPost = async (text: string, visibility: string, imageFile: File | null) => {
  if (!token.value) return

  try {
    let uploadImageUrl = null
    if (imageFile){
      const formData = new FormData()
      formData.append('file', imageFile)

      const uploadRes: any = await $fetch('https://apg-joetsu.tail02904.ts.net/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}`},
        body: formData
      })
      uploadImageUrl = uploadRes.url || uploadRes.imageUrl || uploadRes.filePath || uploadRes
    }

    const postBody: any = {
      content: text,
      visibility: visibility || 'public'
    }
    if (uploadImageUrl) {
      postBody.imageUrl = uploadImageUrl
    }

    await $fetch('https://apg-joetsu.tail02904.ts.net/api/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { content: text, visibility: visibility || 'public' }
    })
    await refreshAll()
  } catch (error){
    console.error('投稿エラー:', error)
  }
}

const handlelike = async (id: string | number) => {
  const currentToken = useCookie('auth_token').value
  if (!currentToken) return
  const targetPost = currentPosts.value.find((p: any) => String(p.id) === String(id))
  if (!targetPost) return
  try {
    const method = targetPost.liked ? 'DELETE' : 'POST'
    await $fetch(`https://apg-joetsu.tail02904.ts.net/api/messages/${id}/like`, {
      method: method,
      headers: { Authorization: `Bearer ${currentToken}` }
    })
    await refreshAll()
  } catch (error: any) {
    console.error('いいねエラー:', error)
  }
}

const handleReply = async (postId: any, text: string) => {
  console.log('送信するリプライ情報:', { content: text, replyToId: postId })

  try {
    await $fetch('https://apg-joetsu.tail02904.ts.net/api/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}`},
      body: { content: text, replyToId: String(postId) }
    })
    await refreshAll()
  } catch (error) {
    console.error('リプライエラー:', error)
  }
}

const handeleDelete = async (postId: number | string) => {
  if (!confirm('削除しますか？')) return
  try {
    await $fetch(`https://apg-joetsu.tail02904.ts.net/api/messages/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    })
    await refreshAll()
  } catch (error) {
    alert("エラー: 自分以外の投稿は削除できません")
  }
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
/* 🌟 元のスタイルは絶対に変えない 🌟 */
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

/* 🌟 タブ用のスタイルだけを慎重に追加 🌟 */
.tab-container {
  display: flex;
  width: 100%;
  max-width: 600px; /* Timelineの幅に合わせる */
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