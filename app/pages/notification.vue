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

      <div v-for="notif in notifications" :key="notif.id" class="notification-item">
        <div class="notif-header">
          <strong>{{ notif.userName }}</strong>{{ notif.message }}
          <span class="notif-time">{{  notif.time }}</span>
        </div>

        
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

.notification-item{
  border-bottom: 1px solid #333;
  padding: 15px 0;
  font-size: 16px;
}

.notif-content-preview {
  margin-top: 5px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  font-size: 0.9em;
  color: #ccc;
  border-left: 3px solid #1da1f2; 
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