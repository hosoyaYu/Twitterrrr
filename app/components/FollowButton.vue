<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    targetUserId: string
    targetUsername: string
    targetName: string
    isPrivate: boolean
}>()

const token = useCookie('auth_token')

const isPending = ref(false)
const isFollowing = ref(false) 
const isLoading = ref(false)  

const handleFollowClick = async () => {
    if (!token.value) return
    if (isLoading.value) return 
    isLoading.value = true

    console.log(props.targetUserId)

    if (!props.targetUserId) {
        alert('相手のIDを取得できませんでした')
    }

    try {
        if (isFollowing.value) {
            await $fetch(`https://apg-joetsu.tail02904.ts.net/api/follows/${props.targetUserId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token.value}` }
            })
            isFollowing.value = false
            isPending.value = false

        } else {
            await $fetch(`https://apg-joetsu.tail02904.ts.net/api/follows/${props.targetUserId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token.value}` },
                body: { userId: props.targetUserId }
            })
            
            if (props.isPrivate) {
                isPending.value = true 
            } else {
                isFollowing.value = true 
            }
        }
    } catch (error: any) {
        console.error('フォロー通信エラー:', error)
        if (error.response?.status === 404) {
            alert('フォロー用のURLが違います')
        } else {
            alert('エラーが発生しました。')
        }
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <button 
      class="follow-btn" 
      :class="{ 'is-active': isPending || isFollowing, 'is-loading': isLoading }"
      @click.stop="handleFollowClick" 
      :disabled="isLoading"
    >
      {{ isLoading ? '通信中...' : (isFollowing ? 'フォロー中' : (isPending ? '申請中' : 'フォロー')) }}
    </button>
</template>

<style scoped>
.follow-btn {
  background-color: transparent;
  color: #eff3f4; 
  border-radius: 20px;
  border: 1px solid #536471;
  margin-bottom: 3px;
  padding: 6px 16px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: 0.2s;
  min-width: 90px;
}

.follow-btn:hover:not(:disabled) {
  background-color: rgba(239, 243, 244, 0.1);
}

.follow-btn.is-active {
  background-color: #eff3f4;
  color: #0f1419;
  border-color: #eff3f4;
}

.follow-btn.is-active:hover:not(:disabled) {
  background-color: #fca5a5;
  color: #991b1b;
  border-color: #fca5a5;
}

.follow-btn.is-loading {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>