<template>
  <div class="content text-guest-wrapper">
    <div class="text-guest" data-aos="fade-up">
      {{ words.dear }} {{ guestName }}! <br />
      Мы будем счастливы разделить с {{ words.you[1] }} радость неповторимого для нас
      дня - дня нашей свадьбы.
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWords } from '../shared/useWords'

const props = defineProps(['guest'])

const words = useWords(props.guest?.gender)

const guestName = props.guest?.name ?? 'Гость'
</script>

<style lang="scss">
.text-guest {
  text-align: center;
  font-size: 38px;
  max-width: 1024px;
  margin: 0 auto;

  &-wrapper {
    color: var(--text-color-white);
    background-color: var(--background-color-black);
  }

  @media (max-width: 768px) {
    font-size: 30px;
  }
}
</style>
