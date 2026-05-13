<script setup lang="ts">
import { computed, ref } from 'vue';
import Sidebar from '~/components/Sidebar.vue';

const token = useCookie('auth_token')

const posts = usePosts()
const notifications = useNotifications()
const userProfile = useUserProfile()
const followRequests = useFollowRequests()

const isEditing = ref(false)
const activeTab = ref('posts') 

const { data: apiResponse, pending, error, refresh} = await useFetch<any>('https://apg-joetsu.tail02904.ts.net/api/users/me', {
  server: false,
  onRequest({ options }) {
    if (token.value) {
      const headers = new Headers(options.headers as HeadersInit)
      headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers
    }
  }
})

const user = computed(() => apiResponse.value?.data || {})

const editName = ref('')
const editBio = ref('')

const startEditing = () => {
  editName.value = user.value.displyName || user.value.username || ''
  editBio.value = user.value.bio || ''
  isEditing.value = true 
}

const myPosts = computed(() => {
  return posts.value.filter(p => p.userId === userProfile.value.id)
})

const saveProfile = async () => {
  try {
    const response = await $fetch<any>('https://apg-joetsu.tail02904.ts.net/api/users/me', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        displayName: editName.value,
        bio: editBio.value
      }
    })

    if (response && response.data) {
      apiResponse.value.data = response.data
      await refresh()
    }
    isEditing.value = false


  } catch (err) {
    console.error('プロフィールの保存に失敗しました:', err)
    alert('プロフィールの保存に失敗しました。もう一度お試しください。')
  }
}

const handlelike = (id: number) => {
  const postlike = posts.value.find(p => p.id === id)
  if (postlike){
    if(!postlike.liked) {
      notifications.value = [
        {
          id: Date.now(),
          userName: user.value.displayName || user.value.username,
          message: ` が ${postlike.user}さんの投稿にいいねしました`, 
          time: new Date().toLocaleTimeString(),
          postId: postlike.id
        },
        ...notifications.value
      ]
    }
    if (postlike.liked){
      postlike.likes--
      postlike.liked = false
    }else{
      postlike.likes++
      postlike.liked = true
    }
  }
}

const handleReply = (postId: any, text: string) => {
  const targetPost = posts.value.find(p => p.id === Number(postId))
  
  if (targetPost) {
    if (!targetPost.replies) {
      targetPost.replies = []
    }
    
    targetPost.replies.push({
      id: Date.now(),
      userId: userProfile.value.id,
      user: user.value.displayName || user.value.username,
      content: text
    })
    
    notifications.value = [
      {
        id: Date.now(),
        userName: user.value.displyName || user.value.username,
        message: ` が ${targetPost.user}さんの投稿に返信しました`,
        time: new Date().toLocaleTimeString(),
        postId: targetPost.id 
      },
      ...notifications.value
    ]
    
  } else {

    alert("エラー：返信先の投稿が見つかりませんでした")
  }
}

const handleDelete = (postId: number) => {
  const isOk = confirm('投稿を削除しますか？')
  if (isOk) {
    posts.value = posts.value.filter(p => p.id !== postId)
  }
}

const onAvatarChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    userProfile.value.avatarUrl = URL.createObjectURL(target.files[0])
  }
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
          <div class="avatar" :style="{ backgroundImage: userProfile.avatarUrl ? `url(${userProfile.avatarUrl})` : '' }"></div>
          
          <button v-if="!isEditing" class="edit-btn" @click="isEditing = true">
            プロフィールを編集
          </button>
        </div>

        <div v-if="!isEditing" class="user-info">
          <h2>{{ user.displayName || user.username || '読み込み中' }}</h2>
          <p class="user-id">@{{ user.username || '...' }}</p>
          <p class="user-bio">{{ user.bio || '自己紹介はまだありません' }}</p>
          
          <div class="user-stats">
            <span><strong>0</strong> フォロー中</span>
            <span><strong>0</strong> フォロワー</span>
          </div>
        </div>

        <div v-else class="edit-form">
          <input v-model="editName" type="text" placeholder="名前" class="edit-input" />
          <textarea v-model="editBio" placeholder="自己紹介" class="edit-textarea"></textarea>

          <label class="file-label">
            アイコンを変更
            <input type="file" accept="image/*" @change="onAvatarChange" />
          </label>
          

          <button class="save-btn" @click="saveProfile">保存</button>
        </div>
      </div>

      <div class="profile-tabs">
        <div class="tab" :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'">投稿</div>
        <div class="tab" :class="{ active: activeTab === 'likes' }" @click="activeTab = 'likes'">いいね</div>
      </div>

    </div> <div class="tab-content" style="width: 100%; max-width: 600px; margin: 0 auto;">
      
      <div v-if="activeTab === 'posts'">
        <Timeline :posts="myPosts" :current-user-id="userProfile.id" @like="handlelike" @reply="handleReply" @delete="handleDelete"/>
      </div>

      <div v-else-if="activeTab === 'likes'">
        <p style="text-align:center; padding:40px; color:#888;">まだいいねした投稿はありません</p>
      </div>

      <div v-else-if="activeTab === 'requests'">
        <div v-if="followRequests.length > 0">
          <div v-for="req in followRequests" :key="req.id" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #333;">
            <div>
              <strong>{{ req.name }}</strong>
              <span style="color:#888; margin-left:8px;">@{{ req.username }}</span>
            </div>
          </div>
        </div>
        <p v-else style="text-align:center; padding:40px; color:#888;">届いているリクエストはありません</p>
      </div>

    </div>

  </div> </template>


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
  /* max-width: 600px; */
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
  padding: 0 auto;
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
  align-self: flex-end;
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
</style>