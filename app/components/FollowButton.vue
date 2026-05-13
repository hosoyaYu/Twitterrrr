<script setup lang="ts">
import { ref } from 'vue'
import { useFollowRequests } from '~/composables/useData';

const props = defineProps<{
    targetUserId : string
    targetUsername: string
    targetName: string
    isPrivate: boolean
}>()

const folllowRequests = useFollowRequests()
const isPending = ref(false)

const handleFollowClick = () => {
    if (props.isPrivate) {
        folllowRequests.value.push({
            id: Date.now(),
            userId: 'user-123',
            username: 'qwop',
            name: 'ぬ'
        })
        isPending.value = true

    }else{
    }
}

</script>

<template>
    <button class="follow-btn" @click="handleFollowClick" :disabled="isPending">{{ isPending ? '申請中' : (isPrivate ? 'フォロー申請' : 'フォロー') }}</button>
</template>

<style scoped>
.follow-btn {
  background-color: black;
  color: white;
  border-radius: 20px;
  border: 2px solid white;
  margin-bottom: 3px;
  padding: 5px 15px;
  cursor: pointer;
}
</style>