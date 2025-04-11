/**
 * Simple code format definitions without genkit dependency
 */

export interface CodeFile {
  preamble?: string;
  filename?: string;
  language?: string;
  content: string;
  done: boolean;
}

export interface CodeMessageData {
  files: CodeFile[];
  postamble?: string;
}

export class CodeMessage implements CodeMessageData {
  constructor(public files: CodeFile[] = [], public postamble: string = '') {}

  /** Returns the first file's preamble. */
  get preamble(): string {
    return this.files[0]?.preamble || '';
  }

  /** Returns the first file's filename. */
  get filename(): string {
    return this.files[0]?.filename || '';
  }

  /** Returns the first file's language. */
  get language(): string {
    return this.files[0]?.language || '';
  }

  /** Returns the first file's content. */
  get content(): string {
    return this.files[0]?.content || '';
  }

  toJSON(): CodeMessageData {
    return {
      files: this.files,
      postamble: this.postamble
    };
  }
}

export function validateCodeMessage(data: any): CodeMessageData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid code message data');
  }

  if (!Array.isArray(data.files)) {
    throw new Error('Files must be an array');
  }

  const files = data.files.map((file: any) => {
    if (typeof file.content !== 'string') {
      throw new Error('File content must be a string');
    }
    if (typeof file.done !== 'boolean') {
      throw new Error('File done must be a boolean');
    }
    return {
      preamble: typeof file.preamble === 'string' ? file.preamble : undefined,
      filename: typeof file.filename === 'string' ? file.filename : undefined,
      language: typeof file.language === 'string' ? file.language : undefined,
      content: file.content,
      done: file.done
    };
  });

  return {
    files,
    postamble: typeof data.postamble === 'string' ? data.postamble : undefined
  };
} 