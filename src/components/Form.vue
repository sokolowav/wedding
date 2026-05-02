<template>
  <div class="section-form">
    <template v-if="isRenderedForm">
      <div class="text-guest mb-2" data-aos="fade-up">
        Просим {{ words.you[0] }} ответить на пару вопросов до первого июня.<br />
        Это поможет нам в организации торжества.
      </div>

      <h2 class="text-center" data-aos="fade-up">
        {{ words.can }} ли {{ words.you[2] }} присутствовать?
      </h2>

      <div class="list-wrapper" data-aos="fade-up">
        <div class="list">
          <label
            v-for="presenceOption in presenceOptions"
            :key="presenceOption.id"
            class="list__item"
          >
            <input
              type="radio"
              name="presence"
              :value="presenceOption.value"
              :checked="isCheckedPresenceOption(presenceOption)"
              @input="onInputPresence"
            />

            <div class="checkbox"></div>

            {{ presenceOption.name }}
          </label>
        </div>
      </div>

      <template v-if="canBe">
        <div class="list-wrapper mb-4" data-aos="fade-up">
            
          <template v-if='!isTheyGuest'>
            <h2  class="text-center" data-aos="fade-up">Будет ли с Тобой +1?</h2>
            <div class="list">
              <label
                v-for="plusOneOption in plusOneOptions"
                :key="plusOneOption.id"
                class="list__item"
              >
                <input
                  type="radio"
                  name="plusOne"
                  :value="plusOneOption.value"
                  :checked="isCheckedPlusOneOption(plusOneOption)"
                  @input="onInputPlusOne"
                />

                <div class="checkbox"></div>

                {{ plusOneOption.name }}
              </label>
            </div>
          </template>

          <h2 class="text-center" data-aos="fade-up">
            Что-нибудь ещё, что мы должны учесть?
          </h2>
          <div class="input-wrapper" data-aos="fade-up">
            <input type="text" v-model="comment" class="input" />
          </div>
        </div>
      </template>

      <div class="btn-wrapper mb-4" data-aos="fade-up">
        <button class="btn" @click="onClickBtn" :disabled="isLoading">
          <img
            class="btn-loader"
            :class="{ visible: isLoading }"
            src="../images/btn-loader.svg"
            alt="loader"
          />
          <span class="btn-text" :class="{ visible: !isLoading }">{{
            btnLabel
          }}</span>
        </button>
      </div>
    </template>

    <div class="text-guest" data-aos="fade-up">
      Просим не обременять себя выбором цветов, {{ words.you[3] }} присутствие
      скрасит этот день ярче любых букетов! <br />
      Будем {{ words.you[0] }} ждать ♥ <br /><br />
      P.S: При наличии непреодолимого желания всё же что-нибудь с собой принести, пусть это лучше будет алкоголь ;)
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, computed, Ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useFetch } from '../shared/useFetch'
import { isNil } from 'lodash'

import { useWords } from '../shared/useWords'

const props = defineProps(['guest'])

const toast = useToast()
const request = useFetch()
const words = useWords(props.guest?.gender)

const isLoading = ref(false)
const isRenderedForm = computed(() => props.guest !== null)

const presenceOptions = [
  {
    id: 1,
    name: 'Конечно же, да!',
    value: true,
  },
  {
    id: 2,
    name: 'К сожалению, нет.',
    value: false,
  },
]

const plusOneOptions = [
  {
    id: 1,
    name: 'Да',
    value: true,
  },
  {
    id: 2,
    name: 'Нет',
    value: false,
  },
]

const presence: Ref<null | boolean> = ref(null)
const plusOne: Ref<null | boolean> = ref(null)

const hasAnswered: Ref<boolean> = ref(false)
const comment = ref('')

const canBe = computed(() => {
  return presence.value === true
})

const isTheyGuest = computed(() => {
  return props.guest?.gender === 'they'
})

const btnLabel = computed(() => {
  return hasAnswered.value ? 'Спасибо за ответ!' : 'Отправить'
})

const syncDataWithProps = () => {
  if (props.guest?.hasAnswered) {
    hasAnswered.value = props.guest.hasAnswered
  }

  if (props.guest?.presence === true) {
    comment.value = props.guest?.comment ?? ''
  } else {
    comment.value = ''
  }

  if (!isNil(props.guest?.presence)) {
    presence.value = props.guest.presence
  }

  if (
    props.guest?.presence === true &&
    typeof props.guest?.plusOne === 'boolean'
  ) {
    plusOne.value = props.guest.plusOne
  } else {
    plusOne.value = null
  }

  if (props.guest?.gender === 'they' && props.guest?.presence === true) {
    plusOne.value = false
  }
}

const onInputPresence = (event) => {
  presence.value = event.target.value === 'true' ? true : false

  if (presence.value === false) {
    comment.value = ''
    plusOne.value = null
  }

  if (presence.value === true && isTheyGuest.value) {
    plusOne.value = false
  }
}

const onInputPlusOne = (event) => {
  plusOne.value = event.target.value === 'true' ? true : false
}

const onClickBtn = async () => {
  if (presence.value === null) {
    toast(`${words.can} ли присутствовать?`)

    return
  }

  if (canBe.value && !isTheyGuest.value && plusOne.value === null) {
    toast('Будет ли с вами +1?')

    return
  }

  isLoading.value = true

  try {
    const guestUuid = props.guest?.uuid

    const payload = {
      ...props.guest,
      presence: presence.value,
      comment: canBe.value ? comment.value : '',
    }

    delete payload.food
    delete payload.drinks

    if (canBe.value) {
      if (isTheyGuest.value) {
        plusOne.value = false
      }

      payload.plusOne = plusOne.value
    } else {
      delete payload.plusOne
    }

    await request.put(guestUuid, payload)

    hasAnswered.value = true

    if (!canBe.value) {
      toast('Очень жаль :(')
    } else {
      toast('Спасибо!')
    }
  } finally {
    isLoading.value = false
  }
}

const isCheckedPresenceOption = (option) => {
  return presence.value === option.value
}

const isCheckedPlusOneOption = (option) => {
  return plusOne.value === option.value
}

watchEffect(() => {
  syncDataWithProps()
})

syncDataWithProps()
</script>

<style lang="scss">
.section-form {
  padding: 30px 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.list-wrapper {
  max-width: 400px;
  width: 100%;
}

.list {
  padding: 30px 0;
  width: 100%;

  &__item {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    white-space: nowrap;
    font-size: 30px;
    font-weight: bold;
    cursor: pointer;
    margin-bottom: 2rem;

    &[disabled='true'] {
      pointer-events: none;
    }

    @media (max-width: 768px) {
      font-size: 27px;
      margin-bottom: 1rem;
    }
  }
}

.checkbox {
  width: 20px;
  height: 20px;
  position: relative;
  border: 1px solid var(--checkbox-color);
  border-radius: 4px;
  margin-right: 2rem;

  &:after {
    content: '';
    display: none;
    position: absolute;
    width: 30px;
    height: 30px;
    z-index: 1;
    top: 6px;
    left: 13px;
    transform: translate(-50%, -50%);
    background-image: url(../images/check.svg);
  }
}

input[type='radio'] {
  display: none;

  &:checked ~ .checkbox {
    &::after {
      display: block;
    }
  }
}

.input {
  background-color: transparent;
  width: 100%;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid var(--checkbox-color);
  font-size: 30px;
  font-weight: bold;
  font-family: 'Sacramento';
  padding: 0 0 3px 0;

  &:focus {
    outline: none;
    border-bottom: 2px solid var(--checkbox-color);
  }

  &-wrapper {
    margin-top: auto;
    padding: 20px 0;
    min-height: 70px;
  }

  &[disabled='true'] {
    pointer-events: none;
  }
}

.label {
  font-size: 30px;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 27px;
  }
}

.btn {
  position: relative;
  min-width: 200px;
  padding: 10px 15px;
  background-color: var(--background-color-toast);
  border-radius: 10px;
  color: var(--btn-text-color-black);
  font-family: 'Sacramento';
  font-weight: bold;
  font-size: 30px;
  border: none;
  outline: none;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  &-loader {
    width: 30px;
    height: 30px;
    position: absolute;
    top: calc(50% - 15px);
    left: calc(50% - 15px);
    animation: 1s linear 0s infinite loop;
    opacity: 0;
    transition: 0.3s;

    &.visible {
      transition-delay: 0.3s;
      opacity: 1;
    }
  }

  &-text {
    opacity: 0;
    transition: 0.3s;

    &.visible {
      transition-delay: 0.3s;
      opacity: 1;
    }
  }

  &-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  &[disabled] {
    pointer-events: none;
  }
}

.disabled {
  opacity: 0.3;
  pointer-events: none;
}

@keyframes loop {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
