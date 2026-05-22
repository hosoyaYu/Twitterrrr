<script setup lang="ts">
import { computed, ref, watch } from 'vue'; 
import Sidebar from '~/components/Sidebar.vue';

const token = useCookie('auth_token')
const isEditing = ref(false)
const activeTab = ref('posts') 

const { data: apiResponse, refresh: refreshUser, error: meError } = await useFetch<any>('https://apg-joetsu.tail02904.ts.net/api/users/me', {
  server: false,
  onRequest({ options }) {
    if (token.value) {
      const headers = new Headers(options.headers as HeadersInit)
      headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers
    }
  }
})

const user = computed(() => (apiResponse.value as any)?.data || {})
const myUserId = computed(() => user.value?.id)
const myUsername = computed(() => user.value?.username)

const { data: myPostsRes, refresh: refreshMyPosts } = await useFetch<any>(
  () => `https://apg-joetsu.tail02904.ts.net/api/users/${myUsername.value}/messages`, {
  server: false,
  immediate: false, 
  onRequest({ options }) {
    if (token.value) {
      const headers = new Headers(options.headers as HeadersInit)
      headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers
    }
  }
})

const { data: followingRes, refresh: refreshFollowing } = await useFetch<any>(
  () => `https://apg-joetsu.tail02904.ts.net/api/follows/${myUserId.value}/following`, {
  server: false,
  immediate: false,
  onRequest({ options }) {
    if (token.value) {
      const headers = new Headers(options.headers as HeadersInit)
      headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers
    }
  }
})

const { data: followersRes, refresh: refreshFollowers } = await useFetch<any>(
  () => `https://apg-joetsu.tail02904.ts.net/api/follows/${myUserId.value}/followers`, {
  server: false,
  immediate: false,
  onRequest({ options }) {
    if (token.value) {
      const headers = new Headers(options.headers as HeadersInit)
      headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers
    }
  }
})

watch([myUserId, myUsername], ([newId, newUsername]) => {
  if (newId && newUsername) {
    refreshMyPosts()
    refreshFollowing()
    refreshFollowers()
  }
}, { immediate: true })

const formatPosts = (apiData: any) => {
  if (!apiData) return []
  let rawPosts = []
  if (apiData.data && Array.isArray(apiData.data.messages)) {
    rawPosts = apiData.data.messages 
  } else if (Array.isArray(apiData.data)) {
    rawPosts = apiData.data
  } else if (Array.isArray(apiData)) {
    rawPosts = apiData
  }
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
    profileImageUrl: p.author?.profileImageUrl, 
    createdAt: p.createdAt,
    imageUrl: p.images && p.images.length > 0 ? p.images[0] : null,
    isFollowing: p.author?.isFollowing || false
  }))
}

const myPosts = computed(() => formatPosts(myPostsRes.value))
const followingUsers = computed(() => {
  const res = followingRes.value as any
  return res?.data ? res.data : (Array.isArray(res) ? res : [])
})
const followersUsers = computed(() => {
  const res = followersRes.value as any
  return res?.data ? res.data : (Array.isArray(res) ? res : [])
})

const editName = ref('')
const editBio = ref('')
const avatarFile = ref<File | null>(null)
const previewAvatarUrl = ref<string | null>(null)

const startEditing = () => {
  editName.value = user.value.displayName || user.value.username || ''
  editBio.value = user.value.bio || ''
  avatarFile.value = null
  previewAvatarUrl.value = null
  isEditing.value = true 
}

const onAvatarChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    avatarFile.value = target.files[0]
    previewAvatarUrl.value = URL.createObjectURL(target.files[0])
  }
}

const saveProfile = async () => {
  try {
    let finalImageUrl = user.value.profileImageUrl

    if (avatarFile.value) {
      const formData = new FormData()
      formData.append('image', avatarFile.value)
      
      const uploadRes: any = await $fetch('https://apg-joetsu.tail02904.ts.net/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
        body: formData
      })
      finalImageUrl = uploadRes?.imageUrl
    }

    const response = await $fetch<any>('https://apg-joetsu.tail02904.ts.net/api/users/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { 
        displayName: editName.value, 
        bio: editBio.value,
        profileImageUrl: finalImageUrl 
      }
    })
    
    if (response) {
      apiResponse.value = response
      await refreshUser()
    }
    
    isEditing.value = false
    avatarFile.value = null
    previewAvatarUrl.value = null
  } catch (err) {
    console.error('プロフィールの保存に失敗しました:', err)
    alert('保存に失敗しました。')
  }
}

const handleLike = async (id: string | number) => {
  if (!token.value) return
  const targetPost = myPosts.value.find((p: any) => String(p.id) === String(id))
  if (!targetPost) return
  try {
    const method = targetPost.liked ? 'DELETE' : 'POST'
    await $fetch(`https://apg-joetsu.tail02904.ts.net/api/messages/${id}/like`, {
      method: method, headers: { Authorization: `Bearer ${token.value}` }
    })
    await refreshMyPosts()
  } catch (error) { console.error(error) }
}

const handleReply = async (postId: any, text: string) => {
  if (!token.value) return
  try {
    await $fetch('https://apg-joetsu.tail02904.ts.net/api/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}`},
      body: { content: text, replyToId: String(postId) }
    })
    await refreshMyPosts()
  } catch (error) { console.error(error) }
}

const handleDelete = async (postId: number | string) => {
  if (!confirm('削除しますか？')) return
  try {
    await $fetch(`https://apg-joetsu.tail02904.ts.net/api/messages/${postId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token.value}` }
    })
    await refreshMyPosts()
  } catch (error) { alert("削除できませんでした") }
}
</script>

<template>
  <div class="main-layout">
    <Sidebar />
  </div>

  <div class="maincontent">
    <div class="profile-wrapper">
      <div class="cover-photo"></div>

      <div class="profile-body">
        <div class="profile-top">
          <div class="avatar" :style="{ backgroundImage: previewAvatarUrl ? `url(${previewAvatarUrl})` : (user.profileImageUrl ? `url(${user.profileImageUrl})` : '') }"></div>
          
          <button v-if="!isEditing" class="edit-btn" @click="startEditing">
            プロフィールを編集
          </button>
        </div>

        <div v-if="!isEditing" class="user-info">
          <h2>{{ user.displayName || user.username || '読み込み中' }}</h2>
          <p class="user-id">@{{ user.username || '...' }}</p>
          <p class="user-bio">{{ user.bio || '自己紹介はまだありません' }}</p>
          <div class="user-stats">
            <span style="cursor: pointer;" @click="activeTab = 'following'"><strong>{{ user.followingCount || followingUsers.length }}</strong> フォロー中</span>
            <span style="cursor: pointer;" @click="activeTab = 'followers'"><strong>{{ user.followersCount || followersUsers.length }}</strong> フォロワー</span>
          </div>
        </div>

        <div v-else class="edit-form">
          <div style="margin-bottom: 10px; opacity: 0.7;">
            <span style="font-size: 13px; color: #888;">ユーザーID（変更不可）</span>
            <div style="font-size: 16px; font-weight: bold; padding: 5px 0;">@{{ user.username }}</div>
          </div>
          <input v-model="editName" type="text" placeholder="名前" class="edit-input" />
          <textarea v-model="editBio" placeholder="自己紹介" class="edit-textarea"></textarea>
          
          <label class="file-label">
            アイコンを変更
            <input type="file" accept="image/*" @change="onAvatarChange" style="display: block; margin-top: 5px;" />
          </label>

          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button class="save-btn" style="background-color: transparent; color: white; border: 1px solid #555;" @click="isEditing = false">キャンセル</button>
            <button class="save-btn" @click="saveProfile">保存</button>
          </div>
        </div>
      </div>

      <div class="profile-tabs">
        <div class="tab" :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'">投稿</div>
        <div class="tab" :class="{ active: activeTab === 'following' }" @click="activeTab = 'following'">フォロー中</div>
        <div class="tab" :class="{ active: activeTab === 'followers' }" @click="activeTab = 'followers'">フォロワー</div>
      </div>
    </div> 
    
    <div class="tab-content" style="width: 100%; max-width: 600px; margin: 0 auto;">
      <div v-if="activeTab === 'posts'">
        <Timeline v-if="myPosts.length > 0" :posts="myPosts" :current-user-id="user.id" @like="handleLike" @reply="handleReply" @delete="handleDelete"/>
        <p v-else style="text-align:center; padding:40px; color:#888;">まだ投稿はありません</p>
      </div>

      <div v-else-if="activeTab === 'following'">
        <div v-if="followingUsers.length > 0">
          <div v-for="f in followingUsers" :key="f.id" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #333;">
            <div style="display:flex; gap: 10px; align-items:center;">
              <div class="avatar-mini" :style="{ backgroundImage: f.profileImageUrl ? `url(${f.profileImageUrl})` : '' }"></div>
              <div>
                <strong>{{ f.displayName || f.username }}</strong><br>
                <span style="color:#888; font-size:13px;">@{{ f.username }}</span>
              </div>
            </div>
          </div>
        </div>
        <p v-else style="text-align:center; padding:40px; color:#888;">誰もフォローしていません</p>
      </div>

      <div v-else-if="activeTab === 'followers'">
        <div v-if="followersUsers.length > 0">
          <div v-for="f in followersUsers" :key="f.id" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #333;">
            <div style="display:flex; gap: 10px; align-items:center;">
              <div class="avatar-mini" :style="{ backgroundImage: f.profileImageUrl ? `url(${f.profileImageUrl})` : '' }"></div>
              <div>
                <strong>{{ f.displayName || f.username }}</strong><br>
                <span style="color:#888; font-size:13px;">@{{ f.username }}</span>
              </div>
            </div>
          </div>
        </div>
        <p v-else style="text-align:center; padding:40px; color:#888;">フォロワーはまだいません</p>
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
  align-items: center; 
}
.profile-wrapper {
  width: 100%;
  border-bottom: 1px solid #333;
}
.cover-photo {
  width: 100%;
  height: 200px;
  background-color: #333; 
}
.profile-body {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 15px;
  box-sizing: border-box;
}
.profile-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: -60px;
}
.avatar {
  width: 120px;
  height: 120px;
  background-color: #888;
  border-radius: 50%;
  border: 4px solid #121212; 
  background-size: cover;
  background-position: center;
}
/* 🌟 ミニアイコン用の共通スタイルを追加 */
.avatar-mini {
  width: 40px;
  height: 40px;
  background-color: #888;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}
.user-info h2 {
  margin: 10px 0 0 0;
  font-size: 20px;
}
.user-id {
  color: #888;
  margin: 0;
  font-size: 14px;
}
.user-bio {
  margin: 15px 0;
  font-size: 15px;
  white-space: pre-wrap;
}
.user-stats {
  display: flex;
  gap: 20px;
  color: #888;
  font-size: 14px;
  margin-bottom: 20px;
}
.user-stats strong {
  color: white;
}
.edit-btn {
  margin-top: 70px; 
  background-color: transparent;
  color: white;
  border: 1px solid #555;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}
.edit-btn:hover {
  background-color: #222;
}
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  margin-bottom: 20px;
}
.edit-input, .edit-textarea {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #333;
  background-color: #000;
  color: white;
  box-sizing: border-box;
}
.edit-textarea {
  height: 80px;
  resize: none;
}
.save-btn {
  background-color: white;
  color: black;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
}
.profile-tabs {
  display: flex;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 15px 0;
  color: #888;
  cursor: pointer;
  font-weight: bold;
}
.tab.active {
  color: white;
  border-bottom: 4px solid #1d9bf0;
}
.file-label {
  display: block;
  font-size: 14px;
  color: #888;
  cursor: pointer;
}
</style>