<template>
    <div class="post-detail-container">
        <button @click="navigateTo('/')" class="back-btn">← 戻る</button>

        <div v-if="post" class="main-post">
            <div class="post-card">
                <h3>{{ post.user }}</h3>
                <p class="content">{{ post.content }}</p>
                <div class="time">{{ new Date(post.id).toLocaleString() }}</div>
            </div>

            <div class="replies-section">
                <h4>返信</h4>
                <div v-for="reply in post.replies" :key="reply.id" class="reply-card">
                    <strong>{{  reply.user }}:</strong> {{ reply.content }}
                </div>
            </div>
        </div>

        <div v-else>投稿が見つかりません</div>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const posts = usePosts()
const postId = Number(route.params.id)
const post = computed(() => {
  return (posts.value as any[]).find((p: any) => p.id === postId)
})
</script>

<style scoped>
.post-detail-container{
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
    color: white;
    padding-top: 100px;
}

.back-btn{
    background: none;
    border: 1px solid #444;
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    cursor: pointer;
    margin-bottom: 20px;
}

.post-card{
    border-bottom: 1px solid #333;
    padding-bottom: 20px;
}

.replies-section{
    margin-top: 20px;
}

.reply-card{
    padding: 10px;
    border-left: 2px solid #1da1f2;
    background: rgba(255, 255, 255, 0.05);
}


</style>