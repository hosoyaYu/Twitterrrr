<template>
  <div class="timeline-container">
    <div 
      class="post-card" 
      v-for="post in posts" 
      :key="post.id" 
      @click="goToDetail(post.id)"
      style="cursor: pointer;"
    >
      <div class="user-icon-sample"></div>
      <div class="post-body">

        <div v-if="post.replyToId" class="reply-badge">
          <span style="color: #1d9bf0; font-size: 13px; font-weight: bold;">↩ 返信</span>
        </div>

        <div class="user-info">
          <h3 class="username">{{ post.user }}</h3>
          <div @click.stop>
            <FollowButton :targetUserId="post.userId" :targetUsername="post.user" :targetName="post.user" :isPrivate="true" />
          </div>
          <span v-if="post.visibility === 'followers'" class="visibility-icon">👥</span>
          <span v-if="post.visibility === 'private'" class="visibility-icon">🔒</span>
        </div>

        <div class="content-text-box">
          <p>{{ post.content }}</p>
        </div>

        <div class="action">
          <button class="like-button" @click.stop="toggleReply(post.id)">
            💬{{ post.replyCount !== undefined ? post.replyCount : (post.replies ? post.replies.length : 0) }}
          </button>
          
          <button class="like-button" @click.stop="$emit('like', post.id)">
            ♡{{ post.likes }}
          </button>
          
          <button v-if="post.userId === currentUserId" class="like-button delete-button" @click.stop="$emit('delete', post.id)">
            削除
          </button>
        </div>

        <div v-if="activeReplyId === post.id" class="reply-input-area" @click.stop>
          <input v-model="replyText" type="text" placeholder="返信を投稿" class="reply-input"/>
          <button class="reply-submit-btn" @click="submitReply(post.id)">返信</button>
        </div>

      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FollowButton from './FollowButton.vue';

defineProps<{
  posts: any[]
  currentUserId: string
}>()

const emit = defineEmits(['like','reply', 'delete'])
const router = useRouter()

const goToDetail = (id: number | string) => {
  router.push(`/posts/${id}`)
}

const activeReplyId =ref<number | null>(null)

const replyText = ref('')

const toggleReply = (id: number) => {
  if (activeReplyId.value === id) {
    activeReplyId.value = null
  }else{
    activeReplyId.value = id
    replyText.value = ''
  }
}

const submitReply = (id: number) => {
  if (replyText.value.trim() === '') return

  emit('reply', id, replyText.value)

  replyText.value = ''
  activeReplyId.value = null
}
</script>

<style scoped>
.timeline-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 50px;
}

.post-card {
  width: 95%;
  max-width: 800px;
  margin-top: 20px;
  display: flex;
  gap: 15px;
  background: #121212;
  padding: 10px 0;
  transition: background-color 0.2s ease;
  cursor: pointer;
  border-bottom: 1px solid #333;
  padding: 15px 20px;
}

.post-card:hover {
    background-color: rgba(255, 255, 255, 0.03);
    border-radius: 20px;
}

.user-icon-sample {
  width: 50px;
  height: 50px;
  background: #aaa;
  border-radius: 50%;
  flex-shrink: 0; 
}

.post-body {
  flex: 1;
}

.username {
  color: white;
  margin: 0 0 8px 0;
  font-size: 16px;
}

.content-text-box {
  border: 2px solid white; 
  padding: 15px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
}

.content-text-box p {
  color: white;
  margin: 0;
  font-size: 18px;
  line-height: 1.4;
}

.action{
    display: flex;
}

.like-button{
    color: white;
    background: #121212;
    margin: 3px;
    border-radius: 20px;
}

.reply-input-area {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #444;
}

.reply-input {
  flex: 1;
  background: #000;
  color: white;
  border: 1px solid #444;
  border-radius: 20px;
  padding: 5px 15px;
}

.reply-submit-btn {
  background: white;
  color: black;
  border: none;
  border-radius: 20px;
  padding: 5px 15px;
  font-weight: bold;
  cursor: pointer;
}

.replies-list {
  margin-top: 10px;
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 10px;
  color: white;
}

.reply-item {
  margin-bottom: 8px;
  font-size: 14px;
}
.reply-item:last-child {
  margin-bottom: 0;
}

.reply-user {
  font-weight: bold;
  color: #888;
  margin-right: 8px;
}


</style>