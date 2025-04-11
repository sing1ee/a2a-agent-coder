import { openai, type OpenAIConfig, defaultConfig } from './openai-config.js';
import { type CodeMessageData, validateCodeMessage } from './code-format-simple.js';

export class CodeHandler {
  private config: OpenAIConfig;

  constructor(config: Partial<OpenAIConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private async generateCode(messages: any[]): Promise<CodeMessageData> {
    try {
      const completion = await openai.chat.completions.create({
        model: this.config.model || defaultConfig.model,
        temperature: this.config.temperature || defaultConfig.temperature,
        max_tokens: this.config.maxTokens || defaultConfig.maxTokens,
        messages: [
          {
            role: 'system',
            content: `You are an expert coding assistant. Generate code according to these instructions:
            - Output code in markdown code blocks
            - Include filename on the same line as opening code ticks
            - Include both language and path
            - Add brief comment at the top describing file purpose
            - For multiple files, separate with two newlines
            Example format:
            \`\`\`ts src/components/Button.tsx
            /** Button component with customizable styles */
            // code here
            \`\`\``,
          },
          ...messages
        ],
      });

      const content = completion.choices[0]?.message?.content || '';
      return validateCodeMessage(extractCode(content));
    } catch (error) {
      console.error('Error generating code:', error);
      throw error;
    }
  }

  async generateCodeStream(messages: any[]): Promise<AsyncGenerator<CodeMessageData, void, unknown>> {
    const stream = await openai.chat.completions.create({
      model: this.config.model || defaultConfig.model,
      temperature: this.config.temperature || defaultConfig.temperature,
      max_tokens: this.config.maxTokens || defaultConfig.maxTokens,
      stream: true,
      messages: [
        {
          role: 'system',
          content: `You are an expert coding assistant. Generate code according to these instructions:
          - Output code in markdown code blocks
          - Include filename on the same line as opening code ticks
          - Include both language and path
          - Add brief comment at the top describing file purpose
          - For multiple files, separate with two newlines
          Example format:
          \`\`\`ts src/components/Button.tsx
          /** Button component with customizable styles */
          // code here
          \`\`\``,
        },
        ...messages
      ],
    });

    let accumulatedContent = '';

    async function* generateChunks() {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          accumulatedContent += content;
          try {
            const parsed = validateCodeMessage(extractCode(accumulatedContent));
            yield parsed;
          } catch (error) {
            // Ignore parsing errors for incomplete chunks
          }
        }
      }
    }

    return generateChunks();
  }
}

function extractCode(source: string): CodeMessageData {
  console.log('source', source);
  const files: CodeMessageData['files'] = [];
  let currentPreamble = '';
  let postamble = '';

  const lines = source.split('\n');
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        const [language, filename] = trimmedLine.substring(3).split(' ');
        files.push({
          preamble: currentPreamble.trim(),
          filename,
          language,
          content: '',
          done: false,
        });
        currentPreamble = '';
      } else {
        inCodeBlock = false;
        files[files.length - 1].done = true;
      }
      continue;
    }

    if (inCodeBlock) {
      files[files.length - 1].content += line + '\n';
    } else {
      if (files.length > 0 && files[files.length - 1].content) {
        postamble += line + '\n';
      } else {
        currentPreamble += line + '\n';
      }
    }
  }

  return {
    files,
    postamble: postamble.trim(),
  };
}