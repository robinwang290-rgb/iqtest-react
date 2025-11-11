import React, { useState, useEffect, useMemo } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

// ===============================
// 📊 智商测试主组件
// ===============================
export default function App() {
  const [step, setStep] = useState("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [unlocked, setUnlocked] = useState(false);

  // 🔹 埋点工具函数
  const trackEvent = (eventName) => {
    if (window.umami && typeof window.umami.track === "function") {
      window.umami.track(eventName);
      console.log("Tracked event:", eventName);
    } else {
      console.log("Event:", eventName);
    }
  };

  // 🔹 页面加载时记录访问
  useEffect(() => {
    trackEvent("visit");
  }, []);

  // ===============================
  // 🧠 题库（示例30题）
  // ===============================
  const QUESTIONS = [
    { id: 1, dimension: "logic", stem: "A 比 B 高，B 比 C 高，下列哪项一定为真？", options: ["A 比 C 高", "C 比 A 高", "A 与 C 一样高", "无法判断"], answer: 0 },
    { id: 2, dimension: "logic", stem: "若所有 X 都是 Y，且有些 Y 是 Z，则下列哪项必然为真？", options: ["所有 X 都是 Z", "有些 Z 是 X", "所有 Z 都是 X", "无法确定"], answer: 1 },
    { id: 3, dimension: "logic", stem: "在一排座位上，甲坐在乙左边，丙坐在乙右边，丁坐在甲左边。谁最左？", options: ["甲", "乙", "丙", "丁"], answer: 3 },
    { id: 4, dimension: "logic", stem: "若今天星期四，那么 100 天后是星期几？", options: ["星期日", "星期一", "星期二", "星期三"], answer: 2 },
    { id: 5, dimension: "logic", stem: "一个钟表在 6 点整时，时针与分针的夹角为？", options: ["0°", "90°", "180°", "150°"], answer: 3 },
    { id: 6, dimension: "numeric", stem: "数列：2, 6, 18, 54, ?", options: ["108", "162", "216", "324"], answer: 1 },
    { id: 7, dimension: "numeric", stem: "数列：1, 1, 2, 3, 5, 8, ?", options: ["13", "14", "15", "21"], answer: 0 },
    { id: 8, dimension: "numeric", stem: "数列：7, 10, 16, 25, 37, ?", options: ["50", "52", "54", "55"], answer: 3 },
    { id: 9, dimension: "numeric", stem: "若 3x + 2 = 17，则 x = ?", options: ["4", "5", "6", "7"], answer: 1 },
    { id: 10, dimension: "numeric", stem: "一个长方形长为 8，宽为 5，周长为？", options: ["13", "26", "40", "80"], answer: 1 },
    { id: 11, dimension: "verbal", stem: "‘简洁’ 对 ‘冗长’ 如同：", options: ["清晰 对 模糊", "准确 对 错误", "生动 对 乏味", "高效 对 缓慢"], answer: 0 },
    { id: 12, dimension: "verbal", stem: "下列哪一组为同义关系？", options: ["广阔-狭窄", "谨慎-小心", "急促-悠闲", "柔和-坚硬"], answer: 1 },
    { id: 13, dimension: "verbal", stem: "‘书籍’ 之于 ‘知识’ 如同：", options: ["土壤 之于 植物", "画笔 之于 绘画", "钥匙 之于 门", "雨水 之于 河流"], answer: 1 },
    { id: 14, dimension: "verbal", stem: "填空：他做事一丝不__。", options: ["苟", "苟且", "拘", "苟同"], answer: 0 },
    { id: 15, dimension: "verbal", stem: "下列成语搭配正确的是：", options: ["根深叶茂", "迫不急待", "循序渐进", "走投无路"], answer: 2 },
    // ...（为了演示，实际可补足到30题）
  ];

  // ===============================
  // 🔢 评分逻辑
  // ===============================
  const totalScore = useMemo(() => {
    return answers.reduce((acc, a, i) => acc + (a === QUESTIONS[i]?.answer ? 1 : 0), 0);
  }, [answers]);

  const iq = Math.round(70 + (totalScore / QUESTIONS.length) * 70);
  const iqLevel =
    iq >= 126 ? "顶尖" : iq >= 111 ? "优秀" : iq >= 91 ? "常规" : "基础";

  // ===============================
  // ⚙️ 页面逻辑
  // ===============================
  const startTest = () => {
    setStep("quiz");
    trackEvent("start_test");
  };

  const chooseOption = (option) => {
    const next = [...answers];
    next[index] = option;
    setAnswers(next);

    if (index + 1 < QUESTIONS.length) {
      setIndex(index + 1);
    } else {
      setStep("result");
      trackEvent("finish_test");
    }
  };

  const reset = () => {
    setStep("intro");
    setAnswers([]);
    setIndex(0);
    setUnlocked(false);
  };

  const unlockReport = () => {
    trackEvent("unlock_click");
    setUnlocked(true);
    trackEvent("unlock_success");
  };

  // ===============================
  // 📈 雷达图数据
  // ===============================
  const dimScores = useMemo(() => {
    const dims = { logic: { correct: 0, total: 0 }, numeric: { correct: 0, total: 0 }, verbal: { correct: 0, total: 0 } };
    QUESTIONS.forEach((q, i) => {
      dims[q.dimension].total += 1;
      if (answers[i] === q.answer) dims[q.dimension].correct += 1;
    });
    return dims;
  }, [answers]);

  const radarData = Object.keys(dimScores).map((key) => ({
    dimension: key,
    score: Math.round((dimScores[key].correct / dimScores[key].total) * 100),
  }));

  // ===============================
  // 🧱 界面结构
  // ===============================
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 800, margin: "0 auto", padding: 20 }}>
      {step === "intro" && (
        <div>
          <h1>AI 智商测试（专业版）</h1>
          <p>本测评包含 30 道逻辑、数学与语言理解题目。完成后系统将为你估算 IQ 值并生成报告。</p>
          <button onClick={startTest}>开始测试</button>
        </div>
      )}

      {step === "quiz" && (
        <div>
          <h2>第 {index + 1} / {QUESTIONS.length} 题</h2>
          <p>{QUESTIONS[index].stem}</p>
          {QUESTIONS[index].options.map((opt, i) => (
            <button
              key={i}
              style={{ display: "block", margin: "6px 0", width: "100%" }}
              onClick={() => chooseOption(i)}
            >
              {String.fromCharCode(65 + i)}. {opt}
            </button>
          ))}
        </div>
      )}

      {step === "result" && (
        <div>
          <h2>测试结果摘要</h2>
          <p>总得分：{totalScore} / {QUESTIONS.length}</p>
          <p>估算智商：{iq}（{iqLevel}）</p>
          <button onClick={unlockReport}>解锁完整报告（模拟付费）</button>
          <button onClick={reset}>重新测试</button>

          {unlocked && (
            <div style={{ marginTop: 30 }}>
              <h3>完整智商分析报告</h3>
              <p>你的智商处于 <b>{iqLevel}</b> 水平。</p>

              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="得分" dataKey="score" fill="#4e79a7" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <p style={{ marginTop: 20 }}>
                <b>改进建议：</b><br />
                • 逻辑推理：多练数列与图形规律题。<br />
                • 数学能力：巩固心算与抽象运算。<br />
                • 语言理解：每天阅读不同领域的文章。
              </p>

              <p style={{ fontSize: 12, color: "#777" }}>
                注：本测评仅供娱乐和教育用途，不代表正式心理测量结果。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
