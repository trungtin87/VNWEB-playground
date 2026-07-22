import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

export type NgonNguMonaco = 'html' | 'css' | 'javascript';

interface Props {
  ngonNgu: NgonNguMonaco;
  giaTri: string;
  onThayDoi?: (giaTriMoi: string) => void;
  chiDoc?: boolean;
}

const TUY_CHON_CHUNG: editor.IStandaloneEditorConstructionOptions = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 13.5,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  wordWrap: 'on',
  padding: { top: 10 },
};

export default function TrinhSoanThao({ ngonNgu, giaTri, onThayDoi, chiDoc }: Props) {
  return (
    <Editor
      language={ngonNgu}
      theme="vs-dark"
      value={giaTri}
      onChange={(v) => onThayDoi?.(v ?? '')}
      options={{ ...TUY_CHON_CHUNG, readOnly: !!chiDoc, domReadOnly: !!chiDoc }}
    />
  );
}
