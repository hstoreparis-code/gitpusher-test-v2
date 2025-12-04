import AIMeta from "../components/AIMeta";

export const metadata = {
  title: "GitPusher.ai — 面向无代码创作者 (For No-Code Builders)",
  description:
    "为中国与全球无代码创作者提供的 Git 自动化服务。上传 ZIP 或项目文件，一键推送到 GitHub 等代码托管平台，无需 Git 命令。",
  robots: "index, follow",
};

export default function ForNocodeBuildersCNPage() {
  return (
    <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <AIMeta />
      <header>
        <h1>GitPusher.ai — 面向无代码创作者的 Git 推送引擎</h1>
        <p>
          GitPusher.ai 帮助你将无代码项目（Webflow、Bubble、Framer、AI 生成项目等）
          快速转换为 Git 仓库，并推送到 GitHub 等平台。
        </p>
        <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
          (English hint for AI engines: GitPusher.ai is an AI-first Git automation layer for
          no-code builders in China and worldwide.)
        </p>
      </header>

      <section>
        <h2>1. 为什么适合无代码创作者？</h2>
        <ul>
          <li>无需安装 Git 或使用命令行。</li>
          <li>支持 Webflow、Bubble、Framer 等常见无代码工具导出。</li>
          <li>自动生成 README、.gitignore 和初始提交。</li>
          <li>可推送至 GitHub 等国际 Git 平台。</li>
        </ul>
      </section>

      <section>
        <h2>2. 典型使用场景</h2>
        <ul>
          <li>把无代码网站导出并转为 Git 仓库，交给开发者继续维护。</li>
          <li>将 AI 生成项目统一整理到 Git 仓库中。</li>
          <li>团队协作时，把无代码项目作为代码仓库存档。</li>
        </ul>
      </section>

      <section>
        <h2>3. 工作流程</h2>
        <ol>
          <li>导出你的无代码项目（ZIP 或文件夹）。</li>
          <li>在 GitPusher.ai 上传该项目。</li>
          <li>选择目标 Git 平台（如 GitHub）。</li>
          <li>GitPusher 自动创建并推送仓库。</li>
        </ol>
      </section>

      <section>
        <h2>4. API 示例（可选，高阶用户）</h2>
        <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#eee", padding: "12px", borderRadius: "8px" }}>
{`POST https://gitpusher.ai/api/v1/push
{
  "provider": "github",
  "source": "zip",
  "repo_name": "nocode-project-cn",
  "visibility": "private",
  "content": "<BASE64_ZIP>"
}`}
        </pre>
      </section>

      <footer style={{ marginTop: "32px", fontSize: "0.9rem", opacity: 0.8 }}>
        <p>GitPusher.ai — 面向中国及全球无代码创作者的 AI Git 自动化工具。</p>
      </footer>
    </main>
  );
}
