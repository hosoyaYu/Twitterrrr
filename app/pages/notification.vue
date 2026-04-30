<script setup lang="ts">
import Sidebar from '~/components/Sidebar.vue'

const notifications = useState<any[]>('notif-data', () => [])
</script>

<template>
  <div class="main-layout">
    <Sidebar />
  </div>

  <div class="maincontent" >
    <div class="notif-wrapper">
      <h2>通知一覧</h2>
      
      <div v-if="notifications.length === 0" class="empty-msg">
        まだ通知はありません
      </div>

      <div v-for="n in notifications" :key="n.id" class="notif-card">
        {{ n.message }}
        <span class="time">{{ n.time }}</span>
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
  justify-content: flex-start;
  align-items: center;
}

.notif-wrapper {
  width: 100%;
  max-width: 600px;
  padding: 20px;
}

.notif-card {
  border-bottom: 1px solid #333;
  padding: 15px 0;
  font-size: 16px;
}

.time {
  color: #888;
  font-size: 12px;
  margin-left: 10px;
}

.empty-msg {
  color: #888;
  text-align: center;
  margin-top: 50px;

}
</style>