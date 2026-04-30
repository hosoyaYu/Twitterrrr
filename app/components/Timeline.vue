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
            <button class="like-button" @click="$emit('like', post.id)">
                ♡{{  post.likes }}
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ posts: any[] }>()
defineEmits(['like'])

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
</style>