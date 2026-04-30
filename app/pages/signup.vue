<script setup lang="ts">
import { ref } from 'vue'
definePageMeta({ layout: 'auth'})

const userId = ref("")
const email = ref("")
const name = ref("")
const password = ref("")
const errorMessage = ref("")

const handleSignup = async () => { 
    if (!userId.value || !name.value || !password.value) {
        errorMessage.value = "全て入力してください"
        return
    }

    try {

        const response = await $fetch<any>('https://apg-joetsu.tail02904.ts.net/api/auth/register', {
            method: 'POST',
            body: {
                username: userId.value,
                email: email.value,
                name: name.value,
                password: password.value
            }
        })

        alert('登録完了！ログイン画面へ移動します。')
            navigateTo('/login')

    } catch (e: any) {
        errorMessage.value = e.statusMessage || "登録に失敗しました"
    }
}




</script>

<template>
    <div class="signup">
        <h1>新規会員登録</h1>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <div class="form">
            <label>ユーザーID</label>
            <input  v-model="userId" type="text">
        </div>

        <div class="form"> 
            <label>表示名</label>
            <input v-model="name" type="text">
        </div>

        <div class="form">
            <label>メールアドレス</label>
            <input v-model="email" type="email">
        </div>

        <div class="form">
            <label>パスワード</label>
            <input v-model="password" type="password">
        </div>

        <button @click="handleSignup">登録</button>

        <NuxtLink to ="/login">既に登録済みの方はこちら</NuxtLink>
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
    height: 630px;
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
    width: 100px;
    height: 40px;
    display: block;
    margin: 0 auto;
    margin-top: 30px;
    transition: .3s;
}

button:hover{
    background: #383838;
    transition: .3s;
}

.form {
    margin-bottom: 1rem;
    font-size: 20px;
    max-width:480px;
    
}

input {
    width: 100%;
    height: auto;
    padding: 0.5rem;
    background: #222;
    color: white;
    border: 1px solid white;
    border-radius: 10px;
    font-size: 25px;
    
}

a {
    color: silver;
    display: block;
    text-align: center;
    text-decoration: none;
    margin-top: 30px;
}

p{
    text-align: center;
    font-size: 25px;
    color: #ff4d4d;
    
}
</style>