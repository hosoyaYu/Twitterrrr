<template>
<div class="post-form-card">
    <div class="user-icon-sample"></div> 
    <div class="input-container">
      <textarea maxlength="250" ref="textareaRef" v-model="text" placeholder="いまどうしてる？" @input="adjustHeight"></textarea>

      <div v-if="imagePreviewUrl" class="image-preview-container">
        <img :src="imagePreviewUrl" class="image-preview"/>
        <button class="remove-image-btn" @click="removeImage">×</button>
      </div> 

      <div class="form-actions-wrapper">
        <div class="left-actions">
          <label class="image-upload-label" title="画像を添付">
            🖼️
            <input type="file" accept="image/*" @change="handleImageSelect" class="hidden-file-input" />
          </label>

          <select v-model="visibility" class="visibility-select">
            <option value="public">全体公開</option>
            <option value="followers">フォロワーのみ</option>
            <option value="private">自分のみ</option>
          </select>
        </div>
      
      <div class="form-bottom">
        <button class="post-submit-button" @click="handleSubmit">投稿</button>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
const text = ref("")
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const visibility  = ref('public') 
const selectedImage = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)
const emit = defineEmits(['submit-post'])


const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    selectedImage.value = file
    imagePreviewUrl.value = URL.createObjectURL(file) 
  }
}

const removeImage = () => {
  selectedImage.value = null
  imagePreviewUrl.value = null
}


const adjustHeight = () => {
  const el = textareaRef.value
  if (!el) return


  el.style.height = 'auto'

  el.style.height = el.scrollHeight + 'px'
}

const handleSubmit = () => {
  if (text.value.trim() === '' && !selectedImage.value) return // テキストも画像もない場合は何もしない

  // テキストと画像ファイルの両方を親（index.vue）に渡す！
  emit('submit-post', text.value, visibility.value, selectedImage.value)

  // フォームをリセット
  text.value = ''
  removeImage()
}
</script>

<style scoped>
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

/* 🌟 ボタン周りのレイアウト調整 */
.form-actions-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.visibility-select {
  border-radius: 30px;
  background-color: #2a2a2a;
  color: white;
  padding: 8px 10px;
  border: 1px solid #444;
  cursor: pointer;
}

/* 🌟 画像アップロードアイコンのスタイル */
.hidden-file-input {
  display: none;
}
.image-upload-label {
  cursor: pointer;
  font-size: 22px;
  transition: 0.2s;
}
.image-upload-label:hover {
  opacity: 0.7;
  transform: scale(1.1);
}

/* 🌟 画像プレビューのスタイル */
.image-preview-container {
  position: relative;
  margin-top: 10px;
  display: inline-block;
  width: fit-content;
}
.image-preview {
  max-width: 100%;
  max-height: 250px;
  border-radius: 12px;
  border: 1px solid #444;
  object-fit: cover;
}
.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}
.remove-image-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.form-bottom { 
    display: flex; 
    justify-content: flex-end; 
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