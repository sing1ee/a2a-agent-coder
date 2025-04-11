# a2a-agent-coder

一个基于 Bun 运行时的项目，使用 A2A 框架和 OpenRouter API 构建智能代理。

## 环境要求

- [Bun](https://bun.sh) v1.2.5 或更高版本
- Node.js 环境（用于运行 a2a server）

## 开始使用

### 安装

首先克隆项目：

```bash
git clone https://github.com/yourusername/a2a-agent-coder.git
cd a2a-agent-coder
```

安装依赖：

```bash
bun install
```

### 环境配置

1. 设置环境变量
   - 复制 `.env.example` 文件为 `.env`
   - 执行 `export $(cat .env | xargs)`

### 运行

1. 启动 a2a server（需要 Node.js 环境）：
```bash
bun run agents:coder
```

2. 启动 a2a client：
```bash
bun run a2a:cli
```

## 项目说明

本项目基于 [A2A](https://github.com/google/A2A) 框架开发，使用 OpenRouter 作为 LLM 提供者。主要功能包括：

- 代码生成：根据用户需求生成完整的代码文件
- 智能对话：通过自然语言与代理进行交互
- 文件操作：支持创建、修改和删除代码文件

## 开发

### 可用的脚本
- `bun run a2a:cli` - 运行 a2a client
- `bun run agents:coder` - 运行 a2a server

## 技术栈

- [Bun](https://bun.sh) - JavaScript 全能运行时
- TypeScript - 类型安全的 JavaScript 超集
- Node.js - 用于运行 a2a server
- [A2A](https://github.com/google/A2A) - Google 的智能代理框架
- [OpenRouter](https://openrouter.ai/) - LLM API 提供者

## 许可证

MIT

---

This project was created using `bun init` in bun v1.2.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
