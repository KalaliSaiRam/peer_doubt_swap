/**
 * compiler.js — Online compiler powered by the Wandbox API (free, no API key)
 * Supports Python, JavaScript (Node), C, C++, Java, SQLite
 */

// Wandbox compiler map — name must match a Wandbox compiler ID
const WANDBOX_URL = 'https://wandbox.org/api/compile.json';

const LANG_MAP = {
    'python': { compiler: 'cpython-3.13.8' },
    'javascript': { compiler: 'nodejs-20.17.0' },
    'c': { compiler: 'gcc-13.2.0-c' },
    'c++': { compiler: 'gcc-13.2.0' },
    'java': { compiler: 'openjdk-jdk-22+36' },
    'sql': { compiler: 'sqlite-3.46.1' }
};

// Default starter snippets
const STARTERS = {
    'python': 'print("Hello from Python!")\n',
    'javascript': 'console.log("Hello from JavaScript!");\n',
    'c': '#include <stdio.h>\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}\n',
    'c++': '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello from C++!" << endl;\n    return 0;\n}\n',
    'java': 'class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}\n',
    'sql': 'CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, grade INTEGER);\nINSERT INTO students VALUES (1, \'Alice\', 90);\nINSERT INTO students VALUES (2, \'Bob\', 78);\nSELECT * FROM students WHERE grade > 80;\n'
};

// Populate starter when language changes
window.addEventListener('DOMContentLoaded', () => {
    const langSel = document.getElementById('lang-select');
    if (langSel) {
        langSel.addEventListener('change', function () {
            const editor = document.getElementById('code-editor');
            if (editor) editor.value = STARTERS[this.value] || '';
        });
    }

    const sel = document.getElementById('lang-select');
    if (sel) sel.value = 'python';
    const editor = document.getElementById('code-editor');
    if (editor && !editor.value.trim()) editor.value = STARTERS['python'];
});

async function runCode() {
    const lang = document.getElementById('lang-select').value;
    const code = document.getElementById('code-editor').value;
    const output = document.getElementById('compiler-output');

    if (!code.trim()) { output.textContent = '⚠️  Write some code first!'; return; }

    const runBtn = document.querySelector('.run-btn');
    runBtn.disabled = true;
    runBtn.textContent = '⏳ Running...';
    output.textContent = 'Executing...';

    const langConfig = LANG_MAP[lang] || LANG_MAP['python'];

    try {
        const res = await fetch(WANDBOX_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                compiler: langConfig.compiler,
                code: code
            })
        });

        if (!res.ok) {
            output.textContent = '❌ Compiler service error: ' + res.status + ' ' + res.statusText;
            return;
        }

        const data = await res.json();

        // Wandbox response fields
        const stdout = data.program_output || '';
        const stderr = data.program_error || '';
        const compileErr = data.compiler_error || '';
        const compileOut = data.compiler_output || '';

        if (compileErr) output.textContent = '🔴 Compile Error:\n' + compileErr;
        else if (stderr) output.textContent = '⚠️  Runtime Error:\n' + stderr;
        else if (stdout) output.textContent = stdout;
        else if (compileOut) output.textContent = compileOut;
        else output.textContent = '(No output produced)';

    } catch (err) {
        output.textContent = '❌ Failed to reach the compiler service. Check your internet connection.\n\nDetails: ' + err.message;
        console.error(err);
    } finally {
        runBtn.disabled = false;
        runBtn.textContent = '▶ Run Code';
    }
}

function clearCompiler() {
    document.getElementById('code-editor').value = '';
    document.getElementById('compiler-output').textContent = 'Run your code to see output here...';
}
