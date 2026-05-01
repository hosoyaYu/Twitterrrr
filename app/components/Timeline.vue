<template>
  <div class="timeline-container">
    <div class="post-card" v-for="post in posts" :key="post.id">
      <div class="user-icon-sample"></div>
      <div class="post-body">

        <div class="user-info">
          <h3 class="username">{{ post.user }}</h3>
          <span v-if="post.visibility === 'followers'" class="visibility-icon">👥</span>
          <span v-if="post.visibility === 'private'" class="visibility-icon">🔒</span>
        </div>

        <div class="content-text-box">
          <p>{{ post.content }}</p>
        </div>

        <div class="action">
          <button class="like-button" @click="toggleReply(post.id)">💬{{ post.replies ? post.replies.length : 0}}</button>
          <button class="like-button" @click="$emit('like', post.id)">♡{{  post.likes }}</button>
        </div>

        <div v-if="activeReplyId === post.id" class="reply-input-area">
          <input v-model="replyText" type="text" placeholder="返信を投稿" class="reply-input"/>
          <button class="reply-submit-btn" @click="submitReply(post.id)">返信</button>
        </div>

        <div v-if="post.replies && post.replies.length > 0" class="replies-list">
          <div v-for="reply in post.replies" :key="reply.id" class="reply-item">
            <span class="reply-user">{{ reply.user }}</span>
            <span class="reply-text">{{ reply.content }}</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ posts: any[] }>()
const emit = defineEmits(['like','reply'])


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