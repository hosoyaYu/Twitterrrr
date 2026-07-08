<script setup lang="ts">
const userProfile = useUserProfile()
definePageMeta({ layout: 'auth' })

const userId = ref("")
const password = ref("")
const errorMessage = ref("")
const isPending = ref(false)

const handleLogin = async () => {
  if (!userId.value.trim() || !password.value.trim()) {
    errorMessage.value = "全て入力してください"
    return
  }

  isPending.value = true
  errorMessage.value = "" 

  try {
    const cleanUsername = userId.value.replace(/@/g, "").trim()

    const response = await $fetch<any>('https://apg-joetsu.tail02904.ts.net/api/auth/login', {
      method: 'POST',
      body: {
        username: cleanUsername,
        password: password.value
      }
    })

    const apiToken = response.accessToken || response.data?.accessToken
    const refreshToken = response.refreshToken || response.data?.refreshToken

    if (apiToken) {
        useCookie('auth_token').value = apiToken
        if (refreshToken) {
            useCookie('auth_refresh_token').value = refreshToken
        }
        const token = useCookie('auth_token', {
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      })
      token.value = apiToken

      const userData = response.user || response.data?.user || response.data || response

      userProfile.value = {
        id: userData.id,
        username: userData.username,
        name: userData.displayName || userData.username,
        bio: userData.bio || '',
        avatarUrl: userData.profileImageUrl || ''
      }

      navigateTo('/')
    } else {
      errorMessage.value = "トークンの取得に失敗しました"
    }

  } catch (e: any) {
    if (e.status === 401) {
      errorMessage.value = "ユーザーIDまたはパスワードが違います"
    } else {
      errorMessage.value = e.data?.message || "ログインに失敗しました"
    }
    password.value = "" 
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
      <input v-model="userId" type="text" :disabled="isPending">
    </div>

    <div class="form">
      <label>パスワード</label>
      <input v-model="password" type="password" :disabled="isPending" @keyup.enter="handleLogin">
    </div>

    <button :disabled="isPending" @click="handleLogin">
      {{ isPending ? '処理中...' : 'ログイン' }}
    </button>

    <NuxtLink to="/signup">新規会員登録はこちら</NuxtLink>
  </div>
</template>

<style scoped>
:global(body) {
  background: #252626;
}

h1 {
  text-align: center;
}

.login {
  max-width: 500px;
  height: auto;
  min-height: 450px;
  padding: 2rem;
  border: 1px solid #333;
  border-radius: 8px;
  background-color: black;
  color: white;
  margin: 0 auto;
  margin-top: 150px;
}

button {
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

button:hover:not(:disabled) {
  background: #383838;
}

.form {
  margin-bottom: 1rem;
  font-size: 20px;
  max-width: 480px;
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
  margin-bottom: 10px;
}
</style>