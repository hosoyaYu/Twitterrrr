<template>
  <header class="header">
    <div class="left">
      <div class="icon"></div>
    </div>

  
    <div class="center">
      <input
        type="text"
        placeholder="キーワードを入力"
      />
    </div>
    
    <div class="right">
      ロゴ
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const searchQuery = ref<string>("")
</script>



<style>
.header {
  height: 80px;
  background: #1e1e1e;
  border-bottom: 6px solid #333;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 20px;

  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  z-index: 300;
}

.left .icon {
  width: 50px;
  height: 50px;
  background: #aaa;
  border-radius: 50%;
}

.center input {
  width: 500px;
  padding: 15px 16px;
  border-radius: 999px;
  border: none;
  outline: none;
  font-size: 15px;

  background: #2a2a2a;
  color: white;
}

.right {
  color: white;
  
}
</style>