<script setup lang="ts">
type TimelineItem = {
  year: string
  title: string
}

const timelineData: TimelineItem[] = [
  {
    year: "2026/01/11",
    title: "ZenSky Projectへ加入した",
  },
  {
    year: "2025/09/30",
    title: "Vul3D MIDIPlayerの開発を始めた",
  },
  {
    year: "2025/04/27",
    title: "最初のHachimitsu MIDI Playerの開発を始めた",
  },
  {
    year: "2025/01/19",
    title: "日記をGithubで始めた",
  },
  {
    year: "2025/01/16",
    title: "自作のファイルサーバーを作ってる",
  },
  {
    year: "2024/05/22",
    title: "mk.tty7.uk（至り来たり宿 第二期）を開設した",
  },
  {
    year: "2024/xx/xx",
    title: "名古屋から横浜へ移動",
  },
  {
    year: "2024/01/05",
    title: "m.tty7.uk (至り来たり宿)を開設した",
  },
  {
    year: "2023/10/29",
    title: "Misskey.art運営再開",
  },
  {
    year: "2023/07/09",
    title: "Misskey.artのリーダーを辞退、裏方へ移動",
  },
  {
    year: "2023/02/06",
    title: "Misskey.artを開設した",
  },
  {
    year: "2022/12/24",
    title: "Misskeyをしようを開設した",
  },
  {
    year: "2022/11/15",
    title: "Misskey.ioに登録した、色々な人と関わり始めた",
  },
  {
    year: "2017～",
    title: "BlackMIDI、黒楽譜を作り始める、動画投稿をし始める",
  },
  {
    year: "2016～2018",
    title: "MCPEのmodをすこし作る、Discordのbot(ZeriaBot)を作る",
  },
]
</script>

<template>
  <ul class="timeline timeline-vertical">
    <li v-for="(item, i) in timelineData" :key="item.year">
      <hr
        class="transition-colors"
        :style="{
          backgroundColor: `rgb(${180 - i * 12}, ${180 - i * 12}, ${180 - i * 12})`,
        }"
      />
      <div
        class="timeline-box bg-neutral-800/50 border-neutral-700"
        :class="i % 2 === 0 ? 'timeline-start' : 'timeline-end'"
      >
        <h5 class="text-sm text-neutral-400">{{ item.year }}</h5>
        <h4 class="text-base text-white">{{ item.title }}</h4>
      </div>
      <hr
        class="transition-colors"
        :style="{
          backgroundColor: `rgb(${180 - i * 12}, ${180 - i * 12}, ${180 - i * 12})`,
        }"
      />
    </li>
  </ul>
</template>
