<script setup lang="ts">
import { computed } from 'vue';



interface Post {
  id: number
  userId: string
  user: string
  content: string
  likes: number
  liked: boolean
  visibility: string
}

const posts = useState<Post[]>('posts-data', () =>[])
const notifications = useState<any[]>('notifdata', () => [])
const userProfile = useState('user-profile', () => ({
  id: 'user-123',
  name: 'テスト',
  bio: 'これもテスト',
  avatarUrl: ''
}))

const isEditing = ref(false)

const myPosts = computed(() => {
  return posts.value.filter(p => p.userId === userProfile.value.id)
})

const saveProfile = () => {
  posts.value.forEach(p => {
    if (p.userId === userProfile.value.id){
      p.user = userProfile.value.name
    }
  })
  isEditing.value = false
}

const handlelike = (id: number) => {
  const postlike = posts.value.find(p => p.id === id)
  if (postlike){
    if(!postlike.liked) {
      notifications.value.unshift({
        id: Date.now(),
        message: `${postlike.user}さんの投稿にいいねしました`,
        time: new Date().toLocaleTimeString()
      })
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
          <h2>{{ userProfile.name }}</h2>
          <p class="user-id">@{{ userProfile.name }}</p>
          <p class="user-bio">{{ userProfile.bio }}</p>
          
          <div class="user-stats">
            <span><strong>0</strong> フォロー中</span>
            <span><strong>0</strong> フォロワー</span>
          </div>
        </div>

        <div v-else class="edit-form">
          <input v-model="userProfile.name" type="text" placeholder="名前" class="edit-input" />
          <textarea v-model="userProfile.bio" placeholder="自己紹介" class="edit-textarea"></textarea>

          <label class="file-label">
            アイコンを変更
            <input type="file" accept="image/*" @change="onAvatarChange" />
          </label>
          

          <button class="save-btn" @click="isEditing = false">保存</button>
        </div>
      </div>

      <div class="profile-tabs">
        <div class="tab active">投稿</div>
        <div class="tab">いいね</div>
      </div>

    </div>

    <Timeline :posts="myPosts" @like="handlelike" />

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