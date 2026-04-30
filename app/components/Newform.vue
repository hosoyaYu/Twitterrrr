<template>
  <div class="post-form-card">
    <div class="user-icon-sample"></div> 
    <div class="input-container">
      <textarea maxlength="250" ref="textareaRef" v-model="text" placeholder="いまどうしてる？" @input="adjustHeight"></textarea>

      <div class="form-action">
        <select v-model="visibility" class="visibility-select">
          <option value="public">全体公開</option>
          <option value="followers">フォロワーのみ</option>
          <option value="private">自分のみ</option>
        </select>
      </div>
      
      <div class="form-bottom">
        <button class="post-submit-button" @click="submit">投稿</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const text = ref("")
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const visibility  = ref('public') 
const emit = defineEmits(['submit-post'])



const adjustHeight = () => {
  const el = textareaRef.value
  if (!el) return


  el.style.height = 'auto'

  el.style.height = el.scrollHeight + 'px'
}

const submit = () => {
  if (!text.value.trim()) return
  emit('submit-post', text.value, visibility.value)
  text.value = ""
  

  nextTick(() => {
    if (textareaRef.value) textareaRef.value.style.height = 'auto'
  })
}
</script>

<style scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  
}

.visibility-select {
  border-radius: 30px;
  background-color: #2a2a2a;
  color: white;
  padding: 8px 10px;
  margin: 10px 10px 10px 10px;
}
.post-form-card {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 12px;
  width: 95%;
  max-width: 800px;
  padding: 15px;
  display: flex;
  gap: 15px;
  box-sizing: border-box;
}

.input-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

textarea {
  width: 100%;
  min-height: 45px; 
  background: transparent;
  color: white;
  border: none;
  outline: none;
  font-size: 20px;
  line-height: 1.5;
  resize: none; 
  padding: 10px 0;
}

.user-icon-sample { 
    width: 50px; 
    height: 50px; 
    background: #aaa; 
    border-radius: 50%; 
    flex-shrink: 0; 
}

.form-bottom { 
    display: flex; 
    justify-content: flex-end; 
    margin-top: 10px; 
}

.post-submit-button { 
    background: black; 
    color: white; 
    border: 2px solid white; 
    border-radius: 20px; 
    padding: 6px 20px; 
    font-weight: bold; 
    cursor: pointer; 
    box-shadow: 0 5px black;
    transition: .2s;
}



.post-submit-button:active{
  transform: translateY(3px);
  transition: .2s;
  box-shadow: 0 0 black;
}
</style>