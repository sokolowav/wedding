<template>
  <div class="section container content admin">
    <div class="form">
      <div class="form-input">
        <div class="form-input__label">Имя</div>
        <input v-model="form.name"/>
      </div>
      
      <div class="form-input">
        <div class="form-input__label">Как обращаться?</div>
        <input v-model="form.gender"/>
        he, she, they
      </div>

      <div class="form-input">
        <div class="form-input__label">Внутреннее наименование</div>
        <input v-model="form.alias"/>
      </div>
    </div>

    <button class="btn mb-4" @click="onClickCreateBtn" :disabled="isLoading">
      <img
        class="btn-loader"
        :class="{ visible: isLoading }"
        src="../images/btn-loader.svg"
        alt="loader"
      />
      <span class="btn-text" :class="{ visible: !isLoading }">Создать</span>
    </button>


    <button class="btn mb-4" @click="onClickGetAllBtn" :disabled="isLoading">
      <img
        class="btn-loader"
        :class="{ visible: isLoading }"
        src="../images/btn-loader.svg"
        alt="loader"
      />
      <span class="btn-text" :class="{ visible: !isLoading }">Получить</span>
    </button>

    <div class="guest-list">
      <div v-for="guest in guests" :key="guest.uuid" class="guest-list-item">
        <div class="guest-list-item__name">{{ guest.name }}</div>
        <div class="guest-list-item__url">{{ getUrl(guest) }}</div>
        <button class="btn mb-4" @click="onClickDeleteBtn(guest)" :disabled="isLoading">
          <span class="btn-text" :class="{ visible: !isLoading }">Удалить</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFetch } from '../shared/useFetch'


const isLoading = ref(false)
const request = useFetch()

const guests = ref([])
const form = ref({
  name: '',
  gender: '',
  alias: '',
})

const onClickGetAllBtn = async () => {
  isLoading.value = true

  try {
    const response = await request.get()
    guests.value = response
  } catch(error) {
    throw error
  } finally {
    isLoading.value = false
  }
}

const onClickCreateBtn = async () => {
  isLoading.value = true

  try {
    const response = await request.post(form.value)

    if (response.state === 'success') {
      await onClickGetAllBtn()
    }
  } catch(error) {
    throw error
  } finally {
    isLoading.value = false
  }
}

const onClickDeleteBtn = async (guest) => {
  isLoading.value = true

  try {
    const response = await request.delete(guest.uuid)

    if (response.state === 'deleted') {
      await onClickGetAllBtn()
    }
  } catch(error) {
    throw error
  } finally {
    isLoading.value = false
  }
}

const getUrl = (guest) => {
  return `${window.location.origin}/?uuid=${guest.uuid}`
}
</script>

<style lang="scss">
.admin {
  font-family: Arial, sans-serif !important;
}
</style>
