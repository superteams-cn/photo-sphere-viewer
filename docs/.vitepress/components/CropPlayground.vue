<template>
  <v-card>
    <v-card-text>
      <v-file-input label="全景图图片" v-model="file" accept="image/*" />

      <v-row class="no-v-gutters">
        <v-col cols="4">
          <v-number-input label="完整宽度" v-model="panoData.fullWidth" :min="0" :disabled="loading" />
        </v-col>
        <v-col cols="4">
          <v-number-input label="裁剪宽度" v-model="panoData.croppedWidth" :min="0" :disabled="loading" />
        </v-col>
        <v-col cols="4">
          <v-number-input label="裁剪 X" v-model="panoData.croppedX" :min="0" :disabled="loading" />
        </v-col>
        <v-col cols="4">
          <v-number-input label="完整高度" v-model="panoData.fullHeight" :min="0" :disabled="loading" />
        </v-col>
        <v-col cols="4">
          <v-number-input label="裁剪高度" v-model="panoData.croppedHeight" :min="0" :disabled="loading" />
        </v-col>
        <v-col cols="4">
          <v-number-input label="裁剪 Y" v-model="panoData.croppedY" :min="0" :disabled="loading" />
        </v-col>
        <v-col cols="4">
          <SliderInput
            label="姿态朝向"
            v-model="panoData.poseHeading"
            :min="0"
            :max="360"
            :step="1"
            :ticks="[0, 90, 180, 270, 360]"
            :disabled="loading"
          />
        </v-col>
        <v-col cols="4">
          <SliderInput
            label="姿态俯仰"
            v-model="panoData.posePitch"
            :min="-90"
            :max="90"
            :step="1"
            :ticks="[-90, -45, 0, 45, 90]"
            :disabled="loading"
          />
        </v-col>
        <v-col cols="4">
          <SliderInput
            label="姿态翻滚"
            v-model="panoData.poseRoll"
            :min="-180"
            :max="180"
            :step="1"
            :ticks="[-180, -90, 0, 90, 180]"
            :disabled="loading"
          />
        </v-col>
      </v-row>

      <v-btn color="primary" @click="apply">应用</v-btn>

      <div v-if="error" class="custom-block danger">
        <p class="custom-block-title">图片无法加载</p>
        <p>
          加载全景图时发生未知错误。如果图片很大，并且你正在使用 Firefox，请尝试改用 Chrome，因为 Firefox 处理大型
          base64 图片时可能会遇到问题。
        </p>
      </div>
    </v-card-text>
  </v-card>

  <v-card v-show="!loading" style="margin-top: 20px">
    <v-tabs v-model="currentTab" bg-color="primary">
      <v-tab value="preview">预览</v-tab>
      <v-tab value="data">XMP 数据</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="currentTab">
        <v-tabs-window-item value="preview">
          <div id="viewer"></div>
        </v-tabs-window-item>

        <v-tabs-window-item value="data">
          <div class="language-xml">
            <pre class="language-xml"><code>{{ xmpData }}</code></pre>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import type { PanoData, Viewer } from '../../../packages/core';
import { LOADER } from './constants';
import SliderInput from './SliderInput.vue';

const file = ref<File | null>(null);
const loading = ref(true);
const error = ref(false);
const currentTab = ref('preview');

let viewer: Viewer;
let imageData: string | null;

const panoData = reactive<PanoData>({
  fullWidth: 0,
  fullHeight: 0,
  croppedWidth: 0,
  croppedHeight: 0,
  croppedX: 0,
  croppedY: 0,
  poseHeading: 0,
  posePitch: 0,
  poseRoll: 0,
});

const xmpData = computed(
  () => `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:GPano="http://ns.google.com/photos/1.0/panorama/">
      <GPano:ProjectionType>equirectangular</GPano:ProjectionType>
      <GPano:FullPanoWidthPixels>${panoData.fullWidth}</GPano:FullPanoWidthPixels>
      <GPano:FullPanoHeightPixels>${panoData.fullHeight}</GPano:FullPanoHeightPixels>
      <GPano:CroppedAreaImageWidthPixels>${panoData.croppedWidth}</GPano:CroppedAreaImageWidthPixels>
      <GPano:CroppedAreaImageHeightPixels>${panoData.croppedHeight}</GPano:CroppedAreaImageHeightPixels>
      <GPano:CroppedAreaLeftPixels>${panoData.croppedX}</GPano:CroppedAreaLeftPixels>
      <GPano:CroppedAreaTopPixels>${panoData.croppedY}</GPano:CroppedAreaTopPixels>
      <GPano:PoseHeadingDegrees>${panoData.poseHeading}</GPano:PoseHeadingDegrees>
      <GPano:PosePitchDegrees>${panoData.posePitch}</GPano:PosePitchDegrees>
      <GPano:PoseRollDegrees>${panoData.poseRoll}</GPano:PoseRollDegrees>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="r"?>`,
);

watch(
  () => panoData.fullWidth,
  (fullWidth) => {
    panoData.fullHeight = Math.round(fullWidth / 2);
  },
);
watch(
  () => panoData.fullHeight,
  (fullHeight) => {
    panoData.fullWidth = Math.round(fullHeight * 2);
  },
);

watch(file, () => {
  error.value = false;
  loading.value = true;

  if (imageData) {
    URL.revokeObjectURL(imageData);
    imageData = null;
  }

  if (file.value) {
    const reader = new FileReader();

    reader.onload = (event) => {
      imageData = event.target!.result as string;

      const image = new Image();

      image.onload = () => {
        computePanoData(image.width, image.height);
        apply();

        loading.value = false;
      };

      image.onerror = () => {
        URL.revokeObjectURL(imageData!);
        imageData = null;
        error.value = true;
      };

      image.src = imageData;
    };

    reader.readAsDataURL(file.value);
  }
});

onBeforeUnmount(() => {
  viewer?.destroy();
});

function computePanoData(width: number, height: number) {
  const fullWidth = Math.max(width, height * 2);
  const fullHeight = Math.round(fullWidth / 2);
  const croppedX = Math.round((fullWidth - width) / 2);
  const croppedY = Math.round((fullHeight - height) / 2);

  panoData.fullWidth = fullWidth;
  panoData.fullHeight = fullHeight;
  panoData.croppedWidth = width;
  panoData.croppedHeight = height;
  panoData.croppedX = croppedX;
  panoData.croppedY = croppedY;
  panoData.poseHeading = 0;
  panoData.posePitch = 0;
  panoData.poseRoll = 0;
}

async function apply() {
  if (viewer) {
    viewer.setPanorama(imageData, {
      panoData: panoData,
      position: { yaw: 0, pitch: 0 },
      transition: false,
    });
  } else {
    const { Viewer } = await import('@photo-sphere-viewer/core');

    viewer = new Viewer({
      panorama: imageData,
      container: 'viewer',
      loadingImg: LOADER,
      panoData: panoData,
      navbar: ['zoom', 'move', 'fullscreen'],
      size: {
        width: '100%',
        height: '500px',
      },
    });
  }
}
</script>

<style lang="scss" scoped>
#viewer {
  border-radius: 5px;
  overflow: hidden;
}
</style>
