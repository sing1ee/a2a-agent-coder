import { CodeHandler } from './lib/code-handler.js';

const codeHandler = new CodeHandler();

async function main() {
  const messages = [
    {
      role: 'user',
      content: 'Write a simple hello world function in TypeScript'
    }
  ];

  try {
    const stream = await codeHandler.generateCodeStream(messages);
    
    for await (const codeMessage of stream) {
      for (const file of codeMessage.files) {
        if (file.done) {
          console.log(`\nFile: ${file.filename}`);
          console.log('Content:');
          console.log(file.content);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 