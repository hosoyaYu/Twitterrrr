<script setup lang="ts">
definePageMeta({ layout: 'auth'})

const userId = ref("")
const password = ref("")
const errorMessage = ref("")
const isPending = ref(false)

const handleLogin = async () => {
    if(!userId.value.trim() || !password.value.trim()){
        errorMessage.value = "全て入力してください"
        return
    }

    isPending.value = true
    try{
        const cleanUsername = userId.value.replace(/@/g, "").trim()

        const response = await $fetch<any>('https://apg-joetsu.tail02904.ts.net/api/auth/login', {
            method: 'POST',
            body: {
                username: cleanUsername,
                password: password.value
            }
        })


        if (response.data && response.data.token){
            const token = useCookie('auth_token' , {
                maxAge: 60 * 60 * 24 * 7
            })
            token.value = response.data.token

            alert('ログイン成功')
            navigateTo('/')
        }

    } catch (e: any){
        errorMessage.value = e.data?.message || "ログイン失敗"
    } finally {
        isPending.value = false
    }

}

</script>

<template>
    <div class="login">
        <h1>ログイン</h1>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <div class="form">
            <label>ユーザーID</label>
            <input  v-model="userId" type="text">
        </div>

        <div class="form">
            <label>パスワード</label>
            <input v-model="password" type="password">
        </div>

        <button :disabled="isPending"  @click="handleLogin">ログイン</button>

        <NuxtLink to ="/signup">新規会員登録はこちら</NuxtLink>
    </div>
</template>

<style scoped>
body{
    background: #252626;
}

h1{
    text-align: center;
}

.login{
    max-width: 500px;
    height: 450px;
    padding: 2rem;
    border: 1px solid #333;
    border-radius: 8px;
    background-color: black;
    color: white;
    margin: 0 auto;
    margin-top: 150px;
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
    max-width: 480px;
    
}

input {
    width: 100%;
    height: 25px;
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