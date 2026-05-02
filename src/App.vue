<template>
  <div v-if="adminModeEnabled">
    <div class="section container content admin">
      <div class="form">
        <div class="form-input">
          <div class="form-input__label">Имя</div>
          <input v-model="form.name" />
        </div>

        <div class="form-input">
          <div class="form-input__label">Как обращаться?</div>
          <input v-model="form.gender" /> he, she, they
        </div>

        <div class="form-input">
          <div class="form-input__label">Внутреннее наименование</div>
          <input v-model="form.alias" />
        </div>
      </div>

      <button
        class="btn mb-4"
        @click="onClickCreateBtn"
        :disabled="isLoadingAdmin"
      >
        <img
          class="btn-loader"
          :class="{ visible: isLoadingAdmin }"
          src="./images/btn-loader.svg"
          alt="loader"
        />
        <span class="btn-text" :class="{ visible: !isLoadingAdmin }"
          >Создать</span
        >
      </button>

      <hr class="mb-4" />

      <button
        class="btn mb-4"
        @click="onClickGetAllBtn"
        :disabled="isLoadingAdmin"
      >
        <img
          class="btn-loader"
          :class="{ visible: isLoadingAdmin }"
          src="./images/btn-loader.svg"
          alt="loader"
        />
        <span class="btn-text" :class="{ visible: !isLoadingAdmin }"
          >Получить</span
        >
      </button>

      <div class="guest-list mb-4">
        <div
          v-for="(guest, idx) in guests"
          :key="guest.uuid || guest._id || idx"
          class="guest-list-item mb-4"
        >
          <div class="guest-list-item__row-name">
            <div class="guest-list-item__name">Имя: {{ guest.name }}</div>
            <div class="guest-list-item__name">
              Внутреннее имя: {{ guest.alias }}
            </div>
          </div>

          <div class="guest-list-item__url">{{ getUrl(guest) }}</div>

          <div class="guest-list-item__row-answer">
            <div v-if="guest.hasAnswered">
              Ответил: {{ getDateTime(guest.timeAnswered) }}
            </div>
            <div v-else>Пока не ответил</div>
          </div>

          <div class="guest-list-item__presence">
            <span v-if="guest.presence" class="green">Будет</span>
            <span v-else class="red">Не будет</span>
          </div>

          <div v-if="guest.presence" class="guest-list-item__plus-one">
            +1:
            <span v-if="guest.plusOne === true" class="green">Да</span>
            <span v-else-if="guest.plusOne === false" class="red">Нет</span>
            <span v-else class="guest-list-item__muted">Не указано</span>
          </div>

          <div v-if="guest.presence" class="guest-list-item__comment">
            Комментарий: {{ guest.comment || '—' }}
          </div>

          <button
            class="btn"
            @click="onClickDeleteBtn(guest)"
            :disabled="isLoadingAdmin"
          >
            <span class="btn-text" :class="{ visible: !isLoadingAdmin }"
              >Удалить</span
            >
          </button>

          <div v-if="isPromtVisible(guest)">
            <h3>Точно удалить?</h3>
            <button class="btn" @click="onClickRemoveBtn(guest)">Да</button>
          </div>
        </div>
      </div>

      <div>
        <div>Общее количество приглашенных: {{ guestsCount }}</div>
        <div>Те, кто сможет: {{ guestsCountWillBe }}</div>
        <div>+1: {{ guestsCountWithPlusOne }}</div>
        <div>Те, кто НЕ сможет: {{ guestsCountWillNotBe }}</div>
        <div>Те, кто не ответил: {{ guestsCountNotAnswered }}</div>
        <div>
          <b>
            Количество подтвержденных гостей итого:
            {{ guestsCountWillBe + guestsCountWithPlusOne }}
          </b>
        </div>
      </div>
    </div>
  </div>

  <template v-else>
    <div
      class="preloader"
      :class="{
        'fade-out': isShownMainSection,
        'fade-out-ended': fadeOutEnded,
      }"
    >
      <!-- грузим hero ещё на прелоадере, чтобы после Lottie картинка была в кэше -->
      <img
        class="preloader-hero-prefetch"
        :src="heroScreenImageUrl"
        alt=""
        width="1"
        height="1"
        fetchpriority="high"
        decoding="async"
      />
      <LottieAnimation
        :animationData="animationJSON"
        :height="400"
        :width="400"
        :loop="false"
        :speed="2"
        @on-complete="onCompleteAnimation"
      />
    </div>

    <div class="wrapper" v-if="isShownMainSection">
      <HelloScreen />
      <GuestText :guest="guest" class="mb-4" />
      <Timing />
      <Colors :guest="guest" />
      <Form :guest="guest" />
      <Map />
    </div>

    <div style="display: none" @click="adminModeEnabled = true"></div>
  </template>
</template>

<script setup lang="ts">
import HelloScreen from './components/HelloScreen.vue'
import GuestText from './components/GuestText.vue'
import Timing from './components/Timing.vue'
import Colors from './components/Colors.vue'
import Map from './components/Map.vue'
import Form from './components/Form.vue'
import animationJSON from './images/animation.json'
import heroScreenImageUrl from './images/2.png'
import AOS from 'aos'

import { ref, Ref, computed, onMounted } from 'vue'
import { useFetch } from './shared/useFetch'
import { getTime } from './shared/getTime'

interface IGuest {
  name: string
  gender: string
  comment?: string
  presence: boolean
  plusOne?: boolean
  uuid: string
  hasAnswered: boolean
}

const isLoading = ref(false)
const isLoadingAdmin = ref(false)

const guests: Ref<any[]> = ref([])
const form = ref({
  name: '',
  gender: '',
  alias: '',
})

const request = useFetch()
const guest: Ref<IGuest | null> = ref(null)
const animationEnded = ref(false)
const fadeOutEnded = ref(false)
const adminModeEnabled = ref(false)

const deletePrompts: Ref<any[]> = ref([])

const isShownMainSection = computed(() => {
  return !isLoading.value && animationEnded.value
})

const filterGuests = (condition) => {
  let number = 0

  for (let guest of guests.value) {
    if (condition(guest)) {
      number += guest.gender === 'they' ? 2 : 1
    }
  }

  return number
}

const countPlusOnes = (condition) => {
  let number = 0

  for (let guest of guests.value) {
    if (condition(guest)) {
      number += 1
    }
  }

  return number
}

const guestsCount = computed(() => {
  return filterGuests(() => true)
})

const guestsCountWillBe = computed(() => {
  return filterGuests((guest) => guest.presence === true)
})

const guestsCountWithPlusOne = computed(() => {
  return countPlusOnes(
    (guest) => guest.presence === true && guest.plusOne === true,
  )
})

const guestsCountWillNotBe = computed(() => {
  return filterGuests((guest) => guest.presence === false)
})

const guestsCountNotAnswered = computed(() => {
  return filterGuests((guest) => !guest.hasAnswered)
})

const init = async () => {
  isLoading.value = true

  try {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('uuid')

    if (id) {
      const response: IGuest = await request.get(id)

      guest.value = response
    }
  } finally {
    isLoading.value = false
  }
}

const onCompleteAnimation = () => {
  animationEnded.value = true

  setTimeout(() => {
    fadeOutEnded.value = true
  }, 1000)
}

const onClickGetAllBtn = async () => {
  isLoadingAdmin.value = true

  try {
    const response = await request.get()
    guests.value = Array.isArray(response) ? response : []
  } catch (error) {
    console.error(error)
  } finally {
    isLoadingAdmin.value = false
  }
}

const onClickCreateBtn = async () => {
  isLoadingAdmin.value = true

  try {
    const response = await request.post(form.value)

    if (response.state === 'success') {
      await onClickGetAllBtn()
    }
  } catch (error) {
    console.error(error)
  } finally {
    isLoadingAdmin.value = false
  }
}

const onClickDeleteBtn = async (guest) => {
  const isPromtActive = deletePrompts.value.some((i) => i === guest.uuid)

  if (isPromtActive) {
    deletePrompts.value = deletePrompts.value.filter((i) => i !== guest.uuid)
  } else {
    deletePrompts.value.push(guest.uuid)
  }
}

const onClickRemoveBtn = async (guest) => {
  isLoadingAdmin.value = true

  try {
    const response = await request.delete(guest.uuid)

    if (response.state === 'deleted') {
      await onClickGetAllBtn()
    }
  } catch (error) {
    console.error(error)
  } finally {
    isLoadingAdmin.value = false
  }
}

const isPromtVisible = (guest) => {
  return deletePrompts.value.some((i) => i === guest.uuid)
}

const getUrl = (guest) => {
  return `${window.location.origin}/?uuid=${guest.uuid}`
}

const getDateTime = (date) => {
  return getTime(date)
}

init()

onMounted(() => {
  AOS.init({
    once: true,
    duration: 1000,
  })
})
</script>

<style lang="scss">
.admin {
  font-family: Arial, sans-serif !important;
}

.preloader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: var(--background-color-main);

  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;

  transition: 1s ease-in-out;
}

.fade-out {
  opacity: 0;
}

.fade-out-ended {
  display: none;
}

.preloader-hero-prefetch {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  pointer-events: none;
}

hr {
  border: 1px solid #000;
}

.guest-list-item {
  &__row-name {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 1rem;
  }

  &__url {
    margin-bottom: 1rem;
  }

  &__row-answer {
    color: #777777;
    margin-bottom: 1rem;
  }

  &__presence,
  &__plus-one {
    margin-bottom: 1rem;

    .green {
      display: inline-block;
      padding: 10px 15px;
      text-align: center;
      color: white;
      background-color: green;
      border-radius: 5px;
    }

    .red {
      display: inline-block;
      padding: 10px 15px;
      text-align: center;
      color: white;
      background-color: red;
      border-radius: 5px;
    }
  }

  &__muted {
    color: #777777;
  }

  &__comment {
    margin-bottom: 1rem;
    word-break: break-word;
  }
}
</style>
