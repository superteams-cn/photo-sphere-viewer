<template>
  <v-select label="导航栏按钮" :items="BUTTONS" multiple v-model="config.navbar" />

  <Container title="位置">
    <v-row class="no-v-gutters">
      <v-col cols="4">
        <v-text-field label="默认 yaw" v-model="config.defaultYaw" />
      </v-col>
      <v-col cols="4">
        <v-text-field label="默认 pitch" v-model="config.defaultPitch" />
      </v-col>
      <v-col cols="4"></v-col>
      <v-col cols="4">
        <SliderInput
          label="默认缩放级别"
          v-model="config.defaultZoomLvl"
          :min="0"
          :max="100"
          :step="1"
          :ticks="[0, 25, 50, 75, 100]"
        />
      </v-col>
      <v-col cols="8">
        <SliderInput
          label="最小/最大视场角"
          v-model="configFov"
          range
          :min="0"
          :max="180"
          :step="1"
          :ticks="[0, 20, 40, 60, 80, 100, 120, 140, 160, 180]"
        />
      </v-col>
      <v-col cols="4">
        <v-number-input label="移动速度" v-model="config.moveSpeed" :min="0" :step="0.1" :precision="1" />
      </v-col>
      <v-col cols="4">
        <v-number-input label="缩放速度" v-model="config.zoomSpeed" :min="0" :step="0.1" :precision="1" />
      </v-col>
      <v-col cols="4">
        <v-checkbox label="移动惯性" v-model="config.moveInertia" />
      </v-col>
    </v-row>
  </Container>

  <Container title="选项">
    <v-row class="no-v-gutters">
      <v-col cols="4">
        <v-checkbox label="鼠标滚轮" v-model="config.mousewheel" />
      </v-col>
      <v-col cols="4">
        <v-checkbox label="鼠标移动" v-model="config.mousemove" />
      </v-col>
      <v-col cols="4">
        <v-checkbox label="键盘控制（全屏）" v-model="config.keyboard" />
      </v-col>
      <v-col cols="4">
        <v-checkbox label="鱼眼效果" v-model="config.fisheye" />
      </v-col>
      <v-col cols="4">
        <v-checkbox label="按住 Ctrl 缩放" v-model="config.mousewheelCtrlKey" />
      </v-col>
      <v-col cols="4">
        <v-checkbox label="双指移动" v-model="config.touchmoveTwoFingers" />
      </v-col>
      <v-col cols="4">
        <v-menu :close-on-content-click="false" @update:modelValue="persistBgColor">
          <template v-slot:activator="{ props }">
            <v-text-field label="画布背景" v-bind="props" v-model="config.canvasBackground">
              <template #append-inner>
                <div class="colorpicker-square" :style="{ backgroundColor: config.canvasBackground }"></div>
              </template>
            </v-text-field>
          </template>
          <v-color-picker v-model="configBgColor" :hide-inputs="true" />
        </v-menu>
      </v-col>
    </v-row>
  </Container>
</template>

<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';
import { cloneDeep } from 'lodash-es';
import { onMounted, reactive, ref, watch } from 'vue';
import type { ViewerConfig } from '../../../../packages/core';
import SliderInput from '../SliderInput.vue';
import Container from './Container.vue';

export type Config = Omit<ViewerConfig, 'container'> & {
  navbar: string[];
};

const BUTTONS = [
  { value: 'zoom', title: '缩放' },
  { value: 'move', title: '移动' },
  { value: 'download', title: '下载' },
  { value: 'caption', title: '标题' },
  { value: 'fullscreen', title: '全屏' },
];

const { loading } = defineProps<{ loading: boolean }>();

const config = reactive<Config>({
  navbar: BUTTONS.map((b) => b.value),
  defaultYaw: 0,
  defaultPitch: 0,
  defaultZoomLvl: 50,
  minFov: 30,
  maxFov: 90,
  mousewheel: true,
  mousemove: true,
  keyboard: true,
  fisheye: false,
  mousewheelCtrlKey: false,
  touchmoveTwoFingers: false,
  moveSpeed: 1,
  zoomSpeed: 1,
  moveInertia: true,
  canvasBackground: '#000000',
});
const configFov = ref([config.minFov, config.maxFov]);
const configBgColor = ref(config.canvasBackground);

const emit = defineEmits<{
  updateConfig: [config: Config];
}>();

watch(configFov, persisFov);

watchDebounced(config, emitConfig, { debounce: 300, maxWait: 9999, deep: true });

onMounted(() => {
  emitConfig();
});

function persisFov() {
  config.minFov = configFov.value[0];
  config.maxFov = configFov.value[1];
}

function persistBgColor(menuOpen: boolean) {
  if (!menuOpen) {
    config.canvasBackground = configBgColor.value;
  }
}

function emitConfig() {
  const c = cloneDeep(config) as Config;
  c.navbar.sort((a, b) => {
    return BUTTONS.findIndex((c) => c.value === a) - BUTTONS.findIndex((c) => c.value === b);
  });
  emit('updateConfig', c);
}
</script>

<style lang="scss" scoped>
.colorpicker-square {
  border-radius: 4px;
  margin: -0.25rem;
  width: 1.5rem;
  aspect-ratio: 1;
  cursor: pointer;
}
</style>
