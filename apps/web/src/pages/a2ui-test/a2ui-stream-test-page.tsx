import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { Link } from "react-router";
import type { A2uiMessage } from "@a2ui/web_core/v0_9";
import { A2uiOfficialRenderer, createA2uiTestProcessor, ECHART_CATALOG_ID } from "./a2ui-official-renderer";

const OPERATIONS = [
  {
    version: "v0.9",
    createSurface: { surfaceId: "mock-sales", catalogId: ECHART_CATALOG_ID },
  },
  {
    version: "v0.9",
    updateComponents: {
      surfaceId: "mock-sales",
      components: [{
        id: "root",
        component: "EChart",
        height: 360,
        option: {
          animationDuration: 500,
          title: { text: "销售趋势", left: 20, top: 16 },
          grid: { left: 54, right: 28, top: 76, bottom: 42 },
          xAxis: { type: "category", data: [] },
          yAxis: { type: "value" },
          series: [{ name: "销售额", type: "bar", data: [], itemStyle: { color: "#2563eb" } }],
        },
      }],
    },
  },
  {
    version: "v0.9",
    updateComponents: {
      surfaceId: "mock-sales",
      components: [{
        id: "root",
        component: "EChart",
        height: 360,
        option: {
          animationDuration: 700,
          title: { text: "近 7 日销售趋势", subtext: "Mock 数据", left: 20, top: 14 },
          tooltip: { trigger: "axis" },
          grid: { left: 54, right: 28, top: 86, bottom: 42 },
          xAxis: { type: "category", data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"] },
          yAxis: { type: "value", name: "万元" },
          series: [{ name: "销售额", type: "bar", data: [12, 18, 15, 23, 29, 34, 31], itemStyle: { color: "#2563eb", borderRadius: [3, 3, 0, 0] } }],
        },
      }],
    },
  },
] as const;

const JSONL = OPERATIONS.map((operation) => JSON.stringify(operation)).join("\n") + "\n";
const CHUNK_SIZE = 18;

export function A2uiStreamTestPage() {
  const [cursor, setCursor] = useState(0);
  const [running, setRunning] = useState(false);
  const [messages, setMessages] = useState<unknown[]>([]);
  const [buffer, setBuffer] = useState("");
  const [error, setError] = useState<string>();
  const cursorRef = useRef(0);
  const decoderBuffer = useRef("");
  const [processor, setProcessor] = useState(() => createA2uiTestProcessor());

  const pushChunk = useCallback(() => {
    const current = cursorRef.current;
    if (current >= JSONL.length) {
      setRunning(false);
      return;
    }
    const next = Math.min(current + CHUNK_SIZE, JSONL.length);
    cursorRef.current = next;
    decoderBuffer.current += JSONL.slice(current, next);
    const lines = decoderBuffer.current.split("\n");
    decoderBuffer.current = lines.pop() ?? "";
    try {
      const completed = lines.filter(Boolean).map((line) => JSON.parse(line));
      if (completed.length) {
        processor.processMessages(completed as A2uiMessage[]);
        setMessages((value) => [...value, ...completed]);
      }
      setBuffer(decoderBuffer.current);
      setCursor(next);
      if (next >= JSONL.length) setRunning(false);
    } catch (cause) {
      setRunning(false);
      setError(cause instanceof Error ? cause.message : "JSONL 解析失败");
    }
  }, [processor]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(pushChunk, 45);
    return () => window.clearInterval(timer);
  }, [pushChunk, running]);

  const reset = useCallback(() => {
    setRunning(false);
    setCursor(0);
    setMessages([]);
    setBuffer("");
    setError(undefined);
    cursorRef.current = 0;
    decoderBuffer.current = "";
    setProcessor(createA2uiTestProcessor());
  }, []);

  const progress = useMemo(() => Math.round((cursor / JSONL.length) * 100), [cursor]);

  return (
    <main className="a2ui-test-page">
      <header className="a2ui-test-header">
        <Link className="a2ui-test-icon-button" aria-label="返回工作区" title="返回工作区" to="/"><ArrowLeft /></Link>
        <div className="a2ui-test-heading">
          <h1>A2UI 流式渲染测试</h1>
          <p>模拟模型持续输出 JSONL；仅完整 operation 会进入渲染器。</p>
        </div>
        <div className="a2ui-test-controls">
          <button className="a2ui-test-icon-button" onClick={() => setRunning((value) => !value)} title={running ? "暂停" : "播放"} type="button">
            {running ? <Pause /> : <Play />}
          </button>
          <button className="a2ui-test-icon-button" disabled={running || cursor >= JSONL.length} onClick={pushChunk} title="推进一个分片" type="button"><StepForward /></button>
          <button className="a2ui-test-icon-button" onClick={reset} title="重置" type="button"><RotateCcw /></button>
        </div>
      </header>

      <div className="a2ui-test-progress" aria-label={`生成进度 ${progress}%`}><span style={{ width: `${progress}%` }} /></div>

      <section className="a2ui-test-grid">
        <div className="a2ui-test-pane">
          <div className="a2ui-test-pane-title"><h2>模型输出</h2><span>{cursor} / {JSONL.length} 字符</span></div>
          <pre className="a2ui-test-code">{JSONL.slice(0, cursor)}<mark>{buffer ? "▌" : ""}</mark></pre>
        </div>

        <div className="a2ui-test-pane">
          <div className="a2ui-test-pane-title"><h2>校验结果</h2><span>{messages.length} / {OPERATIONS.length} 条已接受</span></div>
          <ol className="a2ui-test-events">
            {OPERATIONS.map((operation, index) => {
              const name = Object.keys(operation).find((key) => key !== "version");
              return <li className={index < messages.length ? "is-complete" : ""} key={name}>{name}<span>{index < messages.length ? "有效" : "等待"}</span></li>;
            })}
          </ol>
          {buffer ? <p className="a2ui-test-buffer">当前分片尚未构成完整 JSON，暂不渲染。</p> : null}
          {error ? <p className="pi-a2ui-error">{error}</p> : null}
        </div>

        <div className="a2ui-test-pane a2ui-test-preview">
          <div className="a2ui-test-pane-title"><h2>Surface 预览</h2><span>{messages.length ? "实时更新" : "等待数据"}</span></div>
          <A2uiOfficialRenderer processor={processor} />
        </div>
      </section>
    </main>
  );
}
