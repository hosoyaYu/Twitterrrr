<script setup lang="ts">
import type { st } from 'vue-router/dist/index-BzEKChPW.js'

interface Post {
  id: number
  userId: string
  user: string
  content: string
  likes: number
  liked: boolean
  visibility: string
}

const View = ref('home')

const posts = useState<Post[]>('posts-data', () => [])
const notifications = useState<any[]>('notif-data', () => [])
const userProfile = useState('user-profile', () => ({
  id: 'user-123',
  name: "テスト",
  bio: "これもテスト",
  avatarUrl: '',
  headerUrl:''
}))


const handleAddPost = (text: string, visibility: string) => {
  posts.value.unshift({
    id: Date.now(),
    userId: userProfile.value.id,
    user: userProfile.value.name,
    content: text,
    likes: 0,
    liked: false,
    visibility: visibility
  })
}

const handlelike = (id: number) => {
  const postlike = posts.value.find(p => p.id === id)

  if (postlike) {

    if (!postlike.liked) {

      const snipppet = postlike.content.length > 15
      ? postlike.content.substring(0, 15) + '...'
      : postlike.content

      notifications.value.unshift({
        id: Date.now(),
        message: `${postlike.user}さんが投稿 「${snipppet}」にいいねしました`,
        time: new Date().toLocaleTimeString()
      })
    }

    if (postlike.liked){
    postlike.likes--
    postlike.liked = false
  } else {
    postlike.likes++
    postlike.liked = true
  }}
}

const homePosts = computed(() => {
  return posts.value.filter(p => p.visibility === 'public' || p.visibility === 'followers')
})
</script>


<template>
  <div class="maincontent">
    <div class="sticky-wrapper">
      <Newform @submit-post="handleAddPost" />
      <div class="divider"></div>
    </div>

    <Timeline :posts="homePosts" @like="handlelike" />
    
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
</style>
