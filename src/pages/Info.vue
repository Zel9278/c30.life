<script setup lang="ts">
interface License {
  name: string
  npmName: string
  version: string
  license: string
  repository: string
  publisher?: string
  licenseText: string
  copyright?: string
}

const siteInfo = {
  host: "c30.life",
  owner: "c30 (@c30@mk.c30.life)",
  version: "2026.01.12",
}

const dependencies = [
  { name: "vue", version: "^3.5.25" },
  { name: "vue-router", version: "^4.6.4" },
  { name: "daisyui", version: "^5.5.11" },
  { name: "canvas-confetti", version: "^1.9.4" },
  { name: "marked", version: "^17.0.1" },
  { name: "marked-highlight", version: "^2.2.3" },
  { name: "highlight.js", version: "^11.11.1" },
  { name: "gray-matter", version: "^4.0.3" },
]

const devDependencies = [
  { name: "@biomejs/biome", version: "^2.3.8" },
  { name: "@cloudflare/workers-types", version: "^4.20260111.0" },
  { name: "@tailwindcss/vite", version: "^4.1.17" },
  { name: "@types/canvas-confetti", version: "^1.9.0" },
  { name: "@types/node", version: "^24.10.2" },
  { name: "@vitejs/plugin-vue", version: "^6.0.2" },
  { name: "license-checker", version: "^25.0.1" },
  { name: "prettier", version: "^3.7.4" },
  { name: "tailwindcss", version: "^4.1.17" },
  { name: "vite", version: "^7.2.7" },
  { name: "vite-plugin-sitemap", version: "^0.8.2" },
  { name: "vue-tsc", version: "^3.1.8" },
  { name: "wrangler", version: "^4.58.0" },
]

const licenses: License[] = [
  {
    name: "Vue.js",
    npmName: "vue",
    version: "3.5.25",
    license: "MIT",
    repository: "https://github.com/vuejs/core",
    publisher: "Evan You",
    copyright: "Copyright (c) 2018-present, Yuxi (Evan) You",
    licenseText: `The MIT License (MIT)

Copyright (c) 2018-present, Yuxi (Evan) You

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.`,
  },
  {
    name: "Vue Router",
    npmName: "vue-router",
    version: "4.6.4",
    license: "MIT",
    repository: "https://github.com/vuejs/router",
    publisher: "Eduardo San Martin Morote",
    copyright: "Copyright (c) 2019-present Eduardo San Martin Morote",
    licenseText: `The MIT License (MIT)

Copyright (c) 2019-present Eduardo San Martin Morote

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    name: "DaisyUI",
    npmName: "daisyui",
    version: "5.5.11",
    license: "MIT",
    repository: "https://github.com/saadeghi/daisyui",
    publisher: "Pouya Saadeghi",
    copyright: "Copyright (c) 2020 Pouya Saadeghi",
    licenseText: `MIT License

Copyright (c) 2020 Pouya Saadeghi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    name: "Tailwind CSS",
    npmName: "tailwindcss",
    version: "4.1.17",
    license: "MIT",
    repository: "https://github.com/tailwindlabs/tailwindcss",
    copyright: "Copyright (c) Tailwind Labs, Inc.",
    licenseText: `MIT License

Copyright (c) Tailwind Labs, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    name: "Vite",
    npmName: "vite",
    version: "7.2.7",
    license: "MIT",
    repository: "https://github.com/vitejs/vite",
    publisher: "Evan You",
    copyright:
      "Copyright (c) 2019-present, VoidZero Inc. and Vite contributors",
    licenseText: `MIT License

Copyright (c) 2019-present, VoidZero Inc. and Vite contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    name: "@vitejs/plugin-vue",
    npmName: "@vitejs/plugin-vue",
    version: "6.0.2",
    license: "MIT",
    repository: "https://github.com/vitejs/vite-plugin-vue",
    publisher: "Evan You",
    copyright:
      "Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors",
    licenseText: `MIT License

Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    name: "@tailwindcss/vite",
    npmName: "@tailwindcss/vite",
    version: "4.1.17",
    license: "MIT",
    repository: "https://github.com/tailwindlabs/tailwindcss",
    copyright: "Copyright (c) Tailwind Labs, Inc.",
    licenseText: `MIT License

Copyright (c) Tailwind Labs, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    name: "Biome",
    npmName: "@biomejs/biome",
    version: "2.3.8",
    license: "MIT OR Apache-2.0",
    repository: "https://github.com/biomejs/biome",
    publisher: "Emanuele Stoppa",
    copyright: "Copyright (c) 2023 Biome Developers and Contributors.",
    licenseText: `MIT License

Copyright (c) 2023 Biome Developers and Contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    name: "Prettier",
    npmName: "prettier",
    version: "3.7.4",
    license: "MIT",
    repository: "https://github.com/prettier/prettier",
    publisher: "James Long",
    copyright: "Copyright © James Long and contributors",
    licenseText: `Copyright © James Long and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    name: "vue-tsc",
    npmName: "vue-tsc",
    version: "3.1.8",
    license: "MIT",
    repository: "https://github.com/vuejs/language-tools",
    copyright: "Copyright (c) 2021-present Johnson Chu",
    licenseText: `MIT License

Copyright (c) 2021-present Johnson Chu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    name: "Wrangler",
    npmName: "wrangler",
    version: "4.58.0",
    license: "MIT OR Apache-2.0",
    repository: "https://github.com/cloudflare/workers-sdk",
    publisher: "Cloudflare",
    licenseText: `MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    name: "canvas-confetti",
    npmName: "canvas-confetti",
    version: "1.9.4",
    license: "ISC",
    repository: "https://github.com/catdad/canvas-confetti",
    publisher: "Kiril Vatev",
    licenseText: `ISC License

Copyright (c) 2020, Kiril Vatev

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.`,
  },
  {
    name: "vite-plugin-sitemap",
    npmName: "vite-plugin-sitemap",
    version: "0.8.2",
    license: "MIT",
    repository: "https://github.com/jbaubree/vite-plugin-sitemap",
    publisher: "jbaubree",
    licenseText: `MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    name: "marked",
    npmName: "marked",
    version: "17.0.1",
    license: "MIT",
    repository: "https://github.com/markedjs/marked",
    publisher: "Christopher Jeffrey",
    copyright: "Copyright (c) 2018+, MarkedJS (https://github.com/markedjs/)",
    licenseText: `MIT License

Copyright (c) 2018+, MarkedJS (https://github.com/markedjs/)
Copyright (c) 2011-2018, Christopher Jeffrey (https://github.com/chjj/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    name: "marked-highlight",
    npmName: "marked-highlight",
    version: "2.2.3",
    license: "MIT",
    repository: "https://github.com/markedjs/marked-highlight",
    publisher: "MarkedJS",
    copyright: "Copyright (c) 2022 MarkedJS",
    licenseText: `MIT License

Copyright (c) 2022 MarkedJS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    name: "highlight.js",
    npmName: "highlight.js",
    version: "11.11.1",
    license: "BSD-3-Clause",
    repository: "https://github.com/highlightjs/highlight.js",
    publisher: "Ivan Googled",
    copyright: "Copyright (c) 2006, Ivan Sagalaev.",
    licenseText: `BSD 3-Clause License

Copyright (c) 2006, Ivan Sagalaev.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`,
  },
  {
    name: "gray-matter",
    npmName: "gray-matter",
    version: "4.0.3",
    license: "MIT",
    repository: "https://github.com/jonschlinkert/gray-matter",
    publisher: "Jon Schlinkert",
    copyright: "Copyright (c) 2014-present, Jon Schlinkert.",
    licenseText: `The MIT License (MIT)

Copyright (c) 2014-present, Jon Schlinkert.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.`,
  },
]

const getLicenseColor = (license: string) => {
  if (license.includes("MIT")) return "badge-success"
  if (license.includes("Apache")) return "badge-info"
  if (license.includes("BSD")) return "badge-warning"
  if (license.includes("ISC")) return "badge-info"
  return "badge-neutral"
}
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Info</h1>
      <p class="text-neutral-400 text-sm mb-4">c30.lifeの情報</p>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

      <!-- Site Info -->
      <ul class="text-neutral-300 space-y-1 mb-4">
        <li>ホスト: {{ siteInfo.host }}</li>
        <li>オーナー: {{ siteInfo.owner }}</li>
        <li class="bg-neutral-700 w-full h-0.5 rounded my-2" />
        <li>このサイトバージョン: {{ siteInfo.version }}</li>
        <li class="bg-neutral-700 w-full h-0.5 rounded my-2" />
        <li>
          Sitemap:
          <a
            href="/sitemap.xml"
            target="_blank"
            class="text-sky-400 hover:text-sky-300 transition-colors"
          >
            sitemap.xml
          </a>
        </li>
        <li>
          Robots:
          <a
            href="/robots.txt"
            target="_blank"
            class="text-sky-400 hover:text-sky-300 transition-colors"
          >
            robots.txt
          </a>
        </li>
        <li>
          Repository:
          <a
            href="https://github.com/Zel9278/c30.life"
            target="_blank"
            class="text-sky-400 hover:text-sky-300 transition-colors"
          >
            git:zel9278/c30.life
          </a>
        </li>
      </ul>

      <div class="bg-neutral-700 w-full h-0.5 rounded my-4" />

      <!-- Dependencies -->
      <details
        class="collapse collapse-arrow bg-neutral-800/50 border border-neutral-700 rounded-lg mb-3"
      >
        <summary class="collapse-title text-lg font-medium text-white">
          Dependencies
        </summary>
        <div class="collapse-content">
          <ul class="text-neutral-300 text-sm space-y-1 pt-2">
            <li v-for="dep in dependencies" :key="dep.name">
              {{ dep.name }}: {{ dep.version }}
            </li>
          </ul>
        </div>
      </details>

      <!-- DevDependencies -->
      <details
        class="collapse collapse-arrow bg-neutral-800/50 border border-neutral-700 rounded-lg mb-3"
      >
        <summary class="collapse-title text-lg font-medium text-white">
          DevDependencies
        </summary>
        <div class="collapse-content">
          <ul class="text-neutral-300 text-sm space-y-1 pt-2">
            <li v-for="dep in devDependencies" :key="dep.name">
              {{ dep.name }}: {{ dep.version }}
            </li>
          </ul>
        </div>
      </details>

      <div class="bg-neutral-700 w-full h-0.5 rounded my-4" />

      <!-- Licenses -->
      <details
        class="collapse collapse-arrow bg-neutral-800/50 border border-neutral-700 rounded-lg"
      >
        <summary class="collapse-title text-lg font-medium text-white">
          Licenses
        </summary>
        <div class="collapse-content">
          <div class="space-y-3 pt-2">
            <div
              v-for="pkg in licenses"
              :key="pkg.name"
              class="collapse collapse-arrow bg-neutral-900/50 border border-neutral-700 rounded-lg"
            >
              <input type="checkbox" />
              <div class="collapse-title">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-white font-medium">{{ pkg.name }}</span>
                  <span class="text-neutral-500 text-sm font-mono">{{
                    pkg.version
                  }}</span>
                  <span
                    class="badge badge-sm"
                    :class="getLicenseColor(pkg.license)"
                  >
                    {{ pkg.license }}
                  </span>
                </div>
                <div class="flex flex-wrap items-center gap-3 mt-1">
                  <a
                    :href="pkg.repository"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sky-400 hover:text-sky-300 transition-colors text-xs flex items-center gap-1 relative z-10 pointer-events-auto"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                      />
                    </svg>
                    GitHub
                  </a>
                  <a
                    :href="`https://www.npmjs.com/package/${pkg.npmName}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-red-400 hover:text-red-300 transition-colors text-xs flex items-center gap-1 relative z-10 pointer-events-auto"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z"
                      />
                    </svg>
                    npm
                  </a>
                  <span v-if="pkg.publisher" class="text-neutral-500 text-xs">
                    by {{ pkg.publisher }}
                  </span>
                </div>
              </div>
              <div class="collapse-content">
                <div
                  class="bg-neutral-900/80 rounded-lg p-3 mt-2 overflow-x-auto border border-neutral-700"
                >
                  <pre
                    class="text-neutral-300 text-xs whitespace-pre-wrap font-mono"
                    >{{ pkg.licenseText }}</pre
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </details>

      <div class="mt-4 pt-4 border-t border-neutral-800">
        <p class="text-neutral-500 text-xs">
          All packages are used under their respective licenses.
        </p>
      </div>
    </div>
  </section>
</template>
