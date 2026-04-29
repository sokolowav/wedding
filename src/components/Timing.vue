<template>
  <div class="timing mb-4">
    <h1 class="mb-2" data-aos="fade-up">Программа</h1>

    <template v-for="(event, index) in timing" :key="event.time">
      <div class="timing-element" data-aos="fade-up">
        <div class="timing-element__img">
          <img src="../images/timing-map.svg" alt="timing-icon" />
        </div>

        <div class="timing-element__text">
          <div class="text-bold">
            {{ event.time }}
          </div>

          <div>
            {{ event.name }}
          </div>
        </div>
      </div>

      <div
        v-if="!isLastElement(index)"
        class="divider"
        data-aos="fade-up"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
const timing = [
  {
    time: '17:30',
    name: 'Сбор Гостей',
  },

  {
    time: '18:00',
    name: 'Церемония',
  },

  {
    time: '19:00',
    name: 'Банкет',
  },

  {
    time: '02:00',
    name: 'After Party ;)',
  },
]

const isLastElement = (index: number) => {
  return index === timing.length - 1
}
</script>

<style lang="scss">
.timing {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.timing-element {
  display: flex;
  align-items: start;
  justify-content: center;
  width: 100%;
  padding: 0 15px;
  gap: 30px;
  font-size: 32px;

  &__img {
    flex: 0 1 50%;
    display: flex;
    justify-content: flex-end;
    @media (max-width: 480px) {
      flex: 0;
    }
  }

  &__text {
    flex: 0 1 50%;
    @media (max-width: 480px) {
      flex: 1;
      font-size: 27px;
    }
  }

  @media (max-width: 480px) {
    font-size: 27px;
  }
}

.divider {
  display: block;
  width: 100%;
  position: relative;
  height: 100px;
  margin-top: 2rem;
  margin-bottom: 2rem;

  &:before {
    --divider-width: 1px;
    content: '';
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(50% - var(--divider-width) - 45px);
    width: var(--divider-width);
    border-radius: 50%;
    background: var(--divider-color);

    @media (max-width: 480px) {
      left: 45px;
    }
  }
}
</style>
