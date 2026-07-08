<script setup lang="ts">

const route = useRoute()
const router = useRouter()
const token = useCookie('auth_token')
const userProfile = useUserProfile()

const postId = route.params.id

const { data: parentRes, refresh: refreshParent } = await useFetch<any>(`https://apg-joetsu.tail02904.ts.net/api/messages/${postId}`, {
  server: false,
  onRequest({ options }) {
    if (token.value) {
      const headers = new Headers(options.headers as HeadersInit)
      headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers
    }
  }
})

const { data: repliesRes, refresh: refreshReplies } = await useFetch<any>(`https://apg-joetsu.tail02904.ts.net/api/messages/${postId}/replies`, {
  server: false,
  onRequest({ options }) {
    if (token.value) {
      const headers = new Headers(options.headers as HeadersInit)
      headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers
    }
  }
})

const formatPost = (p: any) => {
    if (!p) return null
    return {
        id: p.id,
        userId: p.author?.id || p.userId,
        user: p.author?.displayName || p.author?.username || '名無し',
        content: p.content,
        likes: p.likeCount || 0,
        liked: p.isLiked || false,
        replyCount: p.replyCount || 0,
        replyToId: p.replyToId,
        visibility: p.visibility,
        avatarUrl: p.author?.profileImageUrl,
        createdAt: p.createdAt,
        imageUrl: p.images && p.images.length > 0 ? p.images[0] : null
    }
}

const parentPost = computed(() => {
  const rawData = parentRes.value?.data ? parentRes.value.data : parentRes.value
  const p = formatPost(rawData)
  return p ? [p] : []
})

const replyPosts = computed(() => {
    if (!repliesRes.value?.data) return []
    const allReplies = repliesRes.value.data.map(formatPost)
    return allReplies.filter((reply: any) => String(reply.replyToId) === String(postId))
})

const goBack = () => {
    router.back()
}

const refreshAll = () => Promise.all([refreshParent(), refreshReplies()])

const handleLike = async (id: string | number) => {
  const currentToken = useCookie('auth_token').value
  if (!currentToken) return
  const target = parentPost.value.find(p => p.id === id) || replyPosts.value.find((p: any) => p.id === id)
  try {
    const method = target?.liked ? 'DELETE' : 'POST'
    await $fetch(`https://apg-joetsu.tail02904.ts.net/api/messages/${id}/like`, {
      method: method, headers: { Authorization: `Bearer ${currentToken}` }
    })
    await refreshAll()
  } catch (error) { console.error(error) }
}

const handleReply = async (targetId: any, text: string) => {
  try {
    await $fetch('https://apg-joetsu.tail02904.ts.net/api/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}`},
      body: { content: text, replyToId: String(targetId) }
    })
    await refreshAll()
  } catch (error) { console.error(error) }
}

const handleDelete = async (targetId: number | string) => {
  if (!confirm('削除しますか？')) return
  try {
    await $fetch(`https://apg-joetsu.tail02904.ts.net/api/messages/${targetId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token.value}` }
    })
    router.back() 
  } catch (error) { alert("削除できませんでした") }
}
</script>

<template>
  <div class="maincontent">
    <div class="sticky-wrapper">
      <div class="header-area">
        <button class="back-btn" @click="goBack">← 戻る</button>
        <h2 class="page-title">ポスト</h2>
      </div>
      <div class="divider"></div>
    </div>

    <div class="timeline-wrapper" v-if="parentPost.length > 0">
      <Timeline :posts="parentPost" :current-user-id="userProfile.id" @like="handleLike" @reply="handleReply" @delete="handleDelete" />
    </div>
    
    <div class="reply-divider" v-if="replyPosts.length > 0">リプライ一覧</div>

    <div class="timeline-wrapper" v-if="replyPosts.length > 0">
      <Timeline :posts="replyPosts" :current-user-id="userProfile.id" @like="handleLike" @reply="handleReply" @delete="handleDelete" />
    </div>
    <div v-else class="no-replies">
      まだリプライはありません。
    </div>
  </div>
</template>


<style scoped>
:global(body) { margin: 0; padding: 0; background-color: #000; }
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

.timeline-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
}

.header-area {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 600px;
  padding: 0 15px 15px 15px;
}

.back-btn {
    background-color: transparent;
    border: none;
    color: white;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    margin-right: 20px;
    padding: 8px 20px;
    border-radius: 20px;
    transition: background-color 0.2s;
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

.reply-divider {
    width: 100%;
    max-width: 600px;
    padding: 15px 20px;
    color: #1d9bf0;
    font-size: 15px;
    font-weight: bold;
    border-bottom: 1px solid #333;
    box-sizing: border-box;
}
.no-replies {
  padding: 30px;
  color: #71767b;
  text-align: center;
}

</style>