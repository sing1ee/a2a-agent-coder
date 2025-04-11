# Coder Agent

这是一个简单的代码编写代理，可以生成完整的代码文件作为输出。

## 环境设置

1. 设置环境变量
   - 复制 `.env.example` 文件为 `.env`
   - 完整设置，兼容 openai 的 API 即可
   - 执行 `export $(cat .env | xargs)`

## 运行

1. 启动 coder agent：
```bash
bun run agents:coder
```

启动后，代理将在 `http://localhost:41241/` 上运行。

