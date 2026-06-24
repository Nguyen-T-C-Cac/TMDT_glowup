import { useCallback, useEffect, useRef } from 'react';
import { Bold, Italic, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = '',
  disabled = false,
  minHeight = 140,
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!editorRef.current || isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    isInternalChange.current = true;
    onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const exec = useCallback((command: string, value?: string) => {
    if (disabled) return;
    document.execCommand(command, false, value ?? undefined);
    if (editorRef.current) {
      editorRef.current.focus();
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [disabled, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  return (
    <div className={`rte-wrapper ${disabled ? 'rte-wrapper--disabled' : ''}`}>
      <div className="rte-toolbar">
        <button
          type="button"
          className="rte-btn rte-btn--bold"
          onClick={() => exec('bold')}
          title="In đậm (Ctrl+B)"
          disabled={disabled}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          className="rte-btn rte-btn--italic"
          onClick={() => exec('italic')}
          title="In nghiêng (Ctrl+I)"
          disabled={disabled}
        >
          <Italic size={16} />
        </button>
        <span className="rte-divider" />
        <button
          type="button"
          className="rte-btn rte-btn--red"
          onClick={() => exec('foreColor', '#dc2626')}
          title="Tô màu đỏ"
          disabled={disabled}
        >
          <Type size={16} />
          <span className="rte-red-dot" />
        </button>
        <span className="rte-divider" />
        <button
          type="button"
          className="rte-btn"
          onClick={() => exec('justifyLeft')}
          title="Căn trái"
          disabled={disabled}
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          className="rte-btn"
          onClick={() => exec('justifyCenter')}
          title="Căn giữa"
          disabled={disabled}
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          className="rte-btn"
          onClick={() => exec('justifyRight')}
          title="Căn phải"
          disabled={disabled}
        >
          <AlignRight size={16} />
        </button>
      </div>
      <div
        ref={editorRef}
        className="rte-editor"
        contentEditable={!disabled}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        style={{ minHeight }}
        role="textbox"
        aria-multiline="true"
        suppressContentEditableWarning
      />
    </div>
  );
};
