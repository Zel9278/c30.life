// Monaco Editor の読み込みと Web Worker の設定 (ブログエディター専用)。
// monaco-editor の既定の Worker 読み込み (new URL("...editorWebWorkerMain.js", import.meta.url))
// は Vite だと依存モジュールが解決できず失敗し、メインスレッドで動く。
// そのため Vite の ?worker でバンドルした Worker を MonacoEnvironment.getWorker から返す。
// エディターは markdown しか扱わないので、json / css / html / ts の言語 Worker は使わない
// (それらの言語のモデルを作らない限り要求されない)。どのラベルでも基本の editor worker を返す
import EditorWorker from "monaco-editor/editor/editor.worker?worker"

self.MonacoEnvironment = {
  getWorker() {
    return new EditorWorker()
  },
}

export * from "monaco-editor"
