let runIdCounter = 0;

export async function runJavaScript(code, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.sandbox = 'allow-scripts';
    
    const runId = ++runIdCounter;

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<script>
  const logs = [];
  function serialize(args) {
    return args.map(a => {
      if (typeof a === 'object' && a !== null) {
        try { return JSON.stringify(a); } catch { return String(a); }
      }
      return String(a);
    }).join(' ');
  }

  console.log = (...args) => logs.push(serialize(args));
  console.warn = (...args) => logs.push('Warning: ' + serialize(args));
  console.error = (...args) => logs.push('Error: ' + serialize(args));

  window.addEventListener('message', (event) => {
    if (event.data.type === 'run' && event.data.runId === ${runId}) {
      try {
        const fn = new Function(event.data.code);
        fn();
        window.parent.postMessage({ type: 'done', runId: ${runId}, output: logs.join('\\n') }, '*');
      } catch(err) {
        window.parent.postMessage({ type: 'error', runId: ${runId}, error: err.message }, '*');
      }
    }
  });
</script>
</body>
</html>`;
    
    iframe.srcdoc = html;
    document.body.appendChild(iframe);

    const cleanup = () => {
      window.removeEventListener('message', handler);
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      clearTimeout(timeout);
    };

    const handler = (event) => {
      if (event.data.runId === runId) {
        if (event.data.type === 'done') {
          cleanup();
          resolve({ success: true, output: event.data.output });
        } else if (event.data.type === 'error') {
          cleanup();
          resolve({ success: false, error: event.data.error, output: '' });
        }
      }
    };

    window.addEventListener('message', handler);

    // Wait for iframe to load
    setTimeout(() => {
      iframe.contentWindow?.postMessage({ type: 'run', runId, code }, '*');
    }, 150);

    const timeout = setTimeout(() => {
      cleanup();
      resolve({ success: false, error: 'Execution timed out (5s limit).', output: '' });
    }, timeoutMs);
  });
}

let pyodideInstance = null;
let pyodideLoading = false;
let pyodideCallbacks = [];

export function loadPyodide() {
  if (pyodideInstance) return Promise.resolve(pyodideInstance);
  if (pyodideLoading) {
    return new Promise(resolve => pyodideCallbacks.push(resolve));
  }
  pyodideLoading = true;
  return new Promise((resolve, reject) => {
    pyodideCallbacks.push(resolve);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
    script.onload = async () => {
      try {
        pyodideInstance = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
        });
        pyodideCallbacks.forEach(cb => cb(pyodideInstance));
        pyodideCallbacks = [];
      } catch (err) {
        reject(err);
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function runPython(code) {
  try {
    const pyodide = await loadPyodide();
    // Redirect stdout and stderr
    pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
    `);
    
    pyodide.runPython(code);
    
    const stdout = pyodide.runPython('sys.stdout.getvalue()');
    const stderr = pyodide.runPython('sys.stderr.getvalue()');
    
    if (stderr) {
      return { success: false, error: stderr.trim(), output: stdout.trim() };
    }
    
    return { success: true, output: stdout.trim(), error: '' };
  } catch (err) {
    return { success: false, error: err.message ?? String(err), output: '' };
  }
}

function normalizeOutput(str) {
  return (str ?? '').trim().replace(/\\r\\n/g, '\\n').replace(/\\n+$/, '');
}

export async function validateCode(language, code, expectedOutput) {
  let result;
  if (language === 'python') {
    result = await runPython(code);
  } else {
    result = await runJavaScript(code);
  }
  
  if (!result.success) {
    return { passed: false, error: result.error, actualOutput: result.output || '' };
  }
  
  const match = normalizeOutput(result.output) === normalizeOutput(expectedOutput);
  return { passed: match, actualOutput: result.output, error: '' };
}

/**
 * Run all test cases against user code in a single sandbox execution.
 * Each test case: { call: string, expected: string }
 * The harness eval()s each call inside the user's code context and compares
 * the stringified return value to expected.
 *
 * Returns array of { call, expected, actual, passed, error }
 */
export async function runTestCases(language, userCode, testCases) {
  if (!testCases || testCases.length === 0) return [];

  const harness = `
;(function() {
  const __cases = ${JSON.stringify(testCases)};
  const __results = [];
  for (const tc of __cases) {
    try {
      const __val = eval(tc.call);
      const __actual = String(__val);
      __results.push({
        call: tc.call,
        expected: tc.expected,
        actual: __actual,
        passed: __actual.trim() === String(tc.expected).trim(),
        error: ''
      });
    } catch(e) {
      __results.push({
        call: tc.call,
        expected: tc.expected,
        actual: '',
        passed: false,
        error: e.message
      });
    }
  }
  console.log('__TC_RESULTS__:' + JSON.stringify(__results));
})();`;

  const code = userCode + '\n' + harness;
  let result;
  if (language === 'python') {
    result = await runPython(code);
  } else {
    result = await runJavaScript(code);
  }

  const lines = (result.output || '').split('\n');
  for (const line of lines) {
    if (line.startsWith('__TC_RESULTS__:')) {
      try {
        return JSON.parse(line.slice('__TC_RESULTS__:'.length));
      } catch {
        break;
      }
    }
  }

  // Harness didn't produce output — map error to all cases
  return testCases.map(tc => ({
    call: tc.call,
    expected: tc.expected,
    actual: '',
    passed: false,
    error: result.error || 'Runtime error',
  }));
}
