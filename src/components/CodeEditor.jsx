import React from 'react'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-python'

// padding must NOT be set here — it's passed as the `padding` prop to Editor,
// which applies it to both the textarea and the pre layer in sync.
// Putting it in style only offsets the container, causing the ghost-text doubling bug.
const editorStyle = {
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontSize: 13,
  lineHeight: 1.7,
  background: '#050810',
  color: '#e2e8f0',
  outline: 'none',
}

function highlight(code, language) {
  const grammar = language === 'python' ? Prism.languages.python : Prism.languages.javascript
  return Prism.highlight(code, grammar, language)
}

export default function CodeEditor({ value, onChange, language = 'javascript', readOnly = false }) {
  return (
    <div className="code-editor-container h-full" style={{ background: '#050810' }}>
      <Editor
        value={value}
        onValueChange={readOnly ? () => {} : onChange}
        highlight={code => highlight(code, language)}
        padding={16}
        readOnly={readOnly}
        style={editorStyle}
        textareaClassName="focus:outline-none"
      />
    </div>
  )
}
