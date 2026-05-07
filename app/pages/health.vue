<script setup lang="ts">
definePageMeta({ layout: 'auth'})
const pingServer = async () => {

  try {
    const reply = await $fetch('https://apg-joetsu.tail02904.ts.net/health') 
    
    alert('成功' )
    
  } catch (error) {

    alert('失敗')
  }
}
</script>

<template>
    <button @click="pingServer">
  サーバー確認
</button>
</template>