<script setup lang="ts">
import { ref } from 'vue'
definePageMeta({ layout: 'auth'})

const userId = ref("")
const email = ref("")
const name = ref("") // 🌟 表示名を復活
const password = ref("")
const errorMessage = ref("")
const isLoading = ref(false)

const handleSignup = async () => { 
    // すべての項目が埋まっているかチェック
    if (!userId.value || !email.value || !name.value || !password.value) {
        errorMessage.value = "全て入力してください"
        return
    }

    // Apidogの仕様：パスワードは8文字以上
    if (password.value.length < 8) {
        errorMessage.value = "パスワードは8文字以上必要です"
        return
    }

    errorMessage.value = ""
    isLoading.value = true

    try {
        await $fetch<any>('https://apg-joetsu.tail02904.ts.net/api/auth/register', {
            method: 'POST',
            body: {
                username: userId.value,
                email: email.value,
                displayName: name.value, // 🌟 ユーザーIDではなく「表示名」として送る
                password: password.value
            }
        })

        alert('登録完了！ログイン画面へ移動します。')
        navigateTo('/login')

    } catch (e: any) {
        if (e.status === 409) {
            errorMessage.value = "このユーザー名またはメールアドレスは既に使われています"
        } else {
            errorMessage.value = e.data?.message || "登録に失敗しました"
        }
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="signup">
        <h1>新規会員登録</h1>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <div class="form">
            <label>ユーザーID</label>
            <input v-model="userId" type="text" placeholder="例: tanaka_01" :disabled="isLoading">
        </div>

        <div class="form"> 
            <label>表示名（名前）</label>
            <input v-model="name" type="text" placeholder="例: 田中太郎" :disabled="isLoading">
        </div>

        <div class="form">
            <label>メールアドレス</label>
            <input v-model="email" type="email" placeholder="example@mail.com" :disabled="isLoading">
        </div>

        <div class="form">
            <label>パスワード</label>
            <input v-model="password" type="password" placeholder="8文字以上" :disabled="isLoading">
        </div>

        <button @click="handleSignup" :disabled="isLoading">
            {{ isLoading ? '登録中...' : '登録' }}
        </button>

        <NuxtLink to="/login">既に登録済みの方はこちら</NuxtLink>
    </div>
</template>

<style scoped>
:global(body) { 
    background: #252626; 
}

h1{
    text-align: center;
}

.signup{
    max-width: 500px;
    height: auto;
    min-height: 650px; /* 🌟 項目が増えたので高さを調整 */
    padding: 2rem;
    border: 1px solid #333;
    border-radius: 8px;
    background-color: black;
    color: white;
    margin: 0 auto;
    margin-top: 70px;
}

button{
    border: solid white 2px;
    border-radius: 10px;
    background: black;
    color: white;
    font-size: 20px;
    width: 150px;
    height: 45px;
    display: block;
    margin: 0 auto;
    margin-top: 30px;
    transition: .3s;
    cursor: pointer;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

button:hover:not(:disabled){
    background: #383838;
}

.form {
    margin-bottom: 1rem;
    font-size: 20px;
    max-width:480px;
}

input {
    width: 100%;
    padding: 0.5rem;
    background: #222;
    color: white;
    border: 1px solid white;
    border-radius: 10px;
    font-size: 25px;
    box-sizing: border-box; /* 🌟 はみ出し防止 */
}

input:disabled {
    opacity: 0.7;
}

a {
    color: silver;
    display: block;
    text-align: center;
    text-decoration: none;
    margin-top: 30px;
}

p.error {
    text-align: center;
    font-size: 20px;
    color: #ff4d4d;
    margin-bottom: 15px;
}
</style>