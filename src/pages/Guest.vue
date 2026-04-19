<template>
  <div>
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
        @on-complete="onCompleteAdnimation"
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
  </div>
</template>

<script setup lang="ts">
import HelloScreen from '../components/HelloScreen.vue'
import GuestText from '../components/GuestText.vue'
import Timing from '../components/Timing.vue'
import Colors from '../components/Colors.vue'
import Map from '../components/Map.vue'
import Form from '../components/Form.vue'
import animationJSON from '../images/animation.json'
import AOS from 'aos'

import { ref, Ref, computed, onMounted } from 'vue'
import { useFetch } from '../shared/useFetch'

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
const request = useFetch()
const guest: Ref<IGuest | null> = ref(null)
const animationEnded = ref(false)
const fadeOutEnded = ref(false)

const isShownMainSection = computed(() => {
  return !isLoading.value && animationEnded.value
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

const onCompleteAdnimation = () => {
  animationEnded.value = true

  setTimeout(() => {
    fadeOutEnded.value = true
  }, 1000)
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
</style>
