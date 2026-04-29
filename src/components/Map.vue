<template>
  <div class="section-map">
    <div class="addresses">
       <div class="address">
        <img
          class="address__img"
          src="/src/images/martini.svg"
          alt="Paris-Holl"
          data-aos="fade-right"
        />

        <div class="address__name" data-aos="fade-left">
          <div>Ресторан "Париж Холл"</div>
          <div class="fs-20">ул. Якоби, 35</div>
        </div>
      </div>
    </div>

    <div class="map-wrapper">
      <div id="map" style="width: 100%; height: 100%"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import iconMartiniMap from '/src/images/martini-map.svg'

const init = () => {
  ymaps.ready(() => {
    const map = new ymaps.Map('map', {
      center: [52.222758, 104.326591],
      controls: [],
      zoom: 14,
    })


    const banket = new ymaps.Placemark(
      [52.222758, 104.326591],
      {},
      {
        iconLayout: 'default#image',
        iconImageHref: iconMartiniMap,
        iconImageSize: [40, 40],
        iconImageOffset: [-20, -20],
      },
    )

    map.geoObjects.add(banket)
  })
}

onMounted(() => {
  init()
})
</script>

<style lang="scss">
.section-map {
  display: flex;
  align-items: center;
  flex-direction: column;
  background-color: var(--background-color-black);
  color: var(--text-color-white);
}

.map-wrapper {
  width: 100%;
  height: 70vh;
}

#map {
  filter: grayscale(1);
  -ms-filter: grayscale(1);
  -webkit-filter: grayscale(1);
  -moz-filter: grayscale(1);
  -o-filter: grayscale(1);
}

.addresses {
  display: flex;
  align-items: start;
  justify-content: center;
  flex-direction: column;
  padding: 30px 15px;
}

.address {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  font-size: 30px;
  gap: 30px;
  width: 100%;

  &__img {
    width: 40px;
    height: 40px;
  }

  &__name {
    margin-bottom: -19px;
    font-weight: bold;
    flex: 1;
  }

  &__copy {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: -9px;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    font-size: 27px;
  }
}

.toast-class {
  background-color: var(--background-color-toast) !important;
  font-family: 'Sacramento' !important;

  .Vue-Toastification__toast-body {
    font-size: 30px !important;
  }

  svg {
    display: none;
  }

  button {
    display: none;
  }
}
</style>
