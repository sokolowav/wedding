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
          v-for="guest in guests"
          :key="guest.uuid"
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

          <div class="guest-list-item__list">
            Еда:
            <div class="guest-list-item__list--item" v-for="food in guest.food">
              {{ getFoodName(food) }}
            </div>
          </div>

          <div class="guest-list-item__list">
            Напитки:
            <div
              class="guest-list-item__list--item"
              v-for="drink in guest.drinks"
            >
              {{ getDrinkName(drink) }}
            </div>
          </div>

          <div class="guest-list-item__comment">
            Комментарий: {{ guest.comment }}
          </div>

          <button
            class="btn"
            @click="onClickDeleteBtn(guest)"
            :disabled="isLoading"
          >
            <span class="btn-text" :class="{ visible: !isLoading }"
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
        <div>Общее количество гостей: {{ guestsCount }}</div>
        <div>Количество пристутствующий: {{ guestsCountWillBe }}</div>
        <div>Количество тех кто не сможет: {{ guestsCountWillNotBe }}</div>
        <div>Количество не ответивших: {{ guestsCountNotAnswered }}</div>
        <div>Рыба: {{ guestsCountFish }}</div>
        <div>Мясо: {{ guestsCountBeef }}</div>
        <div>Красное вино: {{ guestsCountRedWine }}</div>
        <div>Белое вино: {{ guestsCountWhiteWine }}</div>
        <div>Игристое: {{ guestsCountChampagne }}</div>
        <div>Коньяк: {{ guestsCountCognac }}</div>
        <div>Виски: {{ guestsCountWhiskey }}</div>
        <div>Водка: {{ guestsCountVodka }}</div>
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
import AOS from 'aos'

import { ref, Ref, computed, onMounted } from 'vue'
import { useFetch } from './shared/useFetch'
import { getTime } from './shared/getTime'
import { useFoods } from './shared/useFoods'
import { useDrinks } from './shared/useDrinks'

interface IGuest {
  name: string
  gender: string
  drinks: Object[]
  comment: string
  presence: boolean
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

const foods = useFoods()
const drinks = useDrinks()

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

const guestsCount = computed(() => {
  return filterGuests(() => true)
})

const guestsCountWillBe = computed(() => {
  return filterGuests((guest) => guest.presence === true)
})

const guestsCountWillNotBe = computed(() => {
  return filterGuests((guest) => guest.presence === false)
})

const guestsCountNotAnswered = computed(() => {
  return filterGuests((guest) => !guest.hasAnswered)
})

const guestsCountFish = computed(() => {
  return filterGuests((guest) => guest.food.some((f) => f.id === 2))
})

const guestsCountBeef = computed(() => {
  return filterGuests((guest) => guest.food.some((f) => f.id === 1))
})

const guestsCountRedWine = computed(() => {
  return filterGuests((guest) => guest.drinks.some((d) => d.id === 1))
})

const guestsCountWhiteWine = computed(() => {
  return filterGuests((guest) => guest.drinks.some((d) => d.id === 2))
})

const guestsCountChampagne = computed(() => {
  return filterGuests((guest) => guest.drinks.some((d) => d.id === 3))
})

const guestsCountCognac = computed(() => {
  return filterGuests((guest) => guest.drinks.some((d) => d.id === 4))
})

const guestsCountWhiskey = computed(() => {
  return filterGuests((guest) => guest.drinks.some((d) => d.id === 5))
})

const guestsCountVodka = computed(() => {
  return filterGuests((guest) => guest.drinks.some((d) => d.id === 6))
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
  isLoading.value = true

  try {
    const response = await request.get()
    guests.value = response
  } catch (error) {
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
  } catch (error) {
    throw error
  } finally {
    isLoading.value = false
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
  isLoading.value = true

  try {
    const response = await request.delete(guest.uuid)

    if (response.state === 'deleted') {
      await onClickGetAllBtn()
    }
  } catch (error) {
    throw error
  } finally {
    isLoading.value = false
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

const getFoodName = (food) => {
  return foods.find((f) => f.id === food.id).name
}

const getDrinkName = (drink) => {
  return drinks.find((d) => d.id === drink.id).name
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

  &__presence {
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

  &__list {
    margin-bottom: 3rem;

    &--item {
      padding-left: 2rem;
      margin-bottom: 1rem;
    }
  }
}
</style>
