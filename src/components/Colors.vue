<template>
  <div class="section-colors">
    <div class="container" data-aos="fade-up">
      <h1>Dress code</h1>

      <div class="text-guest mb-2">
        Мы будем очень благодарны, если {{ words.you[2] }}
        {{ words.support }} стиль и цвет нашей свадьбы.
      </div>

      <div class="colors mb-2" data-aos="zoom-in-out">
        <div
          v-for="color in colors"
          :key="color"
          :style="{ 'background-color': color, 'box-shadow': getShadow(color) }"
          class="color"
        ></div>
      </div>

      <!-- <div class="text-guest" v-if="props.guest?.gender !== 'she'">
        Молодым людям допускается черный низ и белый верх
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWords } from '../shared/useWords'

const props = defineProps(['guest'])
const words = useWords(props.guest?.gender)

const colors = ['#000000', '#500000', '#a40000', '#dc0000']

const getShadow = (hex: string) => {
  return `5px 5px 20px ${hex}`
}
</script>

<style lang="scss">
.section-colors {
  padding: 30px 15px;
  text-align: center;
  background-color: var(--background-color-black);
  color: var(--text-color-white);
}

.colors {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 30px;

  @media (max-width: 480px) {
    gap: 15px;
  }
}

.color {
  width: 60px;
  height: 60px;
  border-radius: 8px;
}
</style>
