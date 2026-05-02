<template>
  <div class="section hello-screen">
    <div class="image-wrapper">
      <img
        class="image-1"
        :src="heroScreenImageUrl"
        alt=""
        fetchpriority="high"
        decoding="async"
      />
    </div>
    <div class="names">
      <template v-for="(name, i) in names" :key="name">
        <div class="name">{{ name }}</div>
        <div v-if="!isLastName(i)" class="fs-30">&</div>
      </template>
    </div>

    <div class="date text-bold">{{ dateFormated }}</div>

    <VueCountdown
      class="countdown"
      :time="timeRemaining"
      v-slot="{ days, hours, minutes, seconds }"
    >
      <div class="countdown-wrapper">
        <div class="text-nowrap">
          <span class="d-inline-block text-bold">{{ days }}</span> дн.
        </div>
        <div class="text-nowrap">
          <span class="d-inline-block text-bold">{{ hours }}</span> ч.
        </div>
        <div class="text-nowrap">
          <span class="d-inline-block text-bold">{{ minutes }}</span> мин.
        </div>
        <div class="text-nowrap">
          <span class="d-inline-block text-bold">{{ seconds }}</span> сек.
        </div>
      </div>
    </VueCountdown>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { ref, Ref } from 'vue'
import heroScreenImageUrl from '../images/2.png'

const names: Ref<string[]> = ref(['Мария', 'Владимир'])

const date = new Date('2026-06-16T17:30:00')
const dateFormated = format(date, 'dd.MM.yyyy')
const timeRemaining = date.getTime() - new Date().getTime()

const isLastName = (index: number) => {
  return index === names.value.length - 1
}
</script>

<style lang="scss">
.hello-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.image-1 {
  height: 47vh;
  margin-top: 2rem;
}

.names {
  text-align: center;
  margin-bottom: 2rem;
}

.name {
  font-size: 53px;
  line-height: 4rem;
}

.date {
  font-size: 30px;
  margin-top: auto;

  @media (max-width: 480px) {
    font-size: 25px;
  }
}

.fs-30 {
  font-size: 30px;
  line-height: 1.5rem;
}

.image-wrapper {
  // position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;

  // &::after {
  //   content: '';
  //   position: absolute;
  //   inset: 0;
  //   background-color: #d7d0c9;
  //   pointer-events: none;
  // }
}

.countdown {
  display: block;
  width: 100%;
  margin-top: auto;
  text-wrap: nowrap;
  overflow: hidden;
  font-size: 30px;
  margin-bottom: 1rem;
  padding: 0 15px;

  @media (max-width: 480px) {
    font-size: 25px;
  }

  &-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex-wrap: nowrap;

    div {
      flex: 0 1 88px;
      text-align: center;
    }
  }
}
</style>
