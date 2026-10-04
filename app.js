import { countText } from './counter.js';

const input = document.querySelector('#text-input');
const copy = document.querySelector('#copy');
const clear = document.querySelector('#clear');
const undo = document.querySelector('#undo');
const status = document.querySelector('#action-status');
const announcement = document.querySelector('#count-announcement');
const outputs = { withSpaces: 'with-spaces', withoutSpaces: 'without-spaces', words: 'words', lines: 'lines', bytes: 'bytes' };
const formatter = new Intl.NumberFormat('ko-KR');
let previousText = '';
let announceTimer;
let statusTimer;

function update() {
  const result = countText(input.value);
  for (const [key, id] of Object.entries(outputs)) document.getElementById(id).textContent = formatter.format(result[key]);
  copy.disabled = clear.disabled = !input.value;
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => { announcement.textContent = `공백 포함 ${formatter.format(result.withSpaces)}자, 공백 제외 ${formatter.format(result.withoutSpaces)}자`; }, 450);
  return result;
}
function showStatus(message) {
  clearTimeout(statusTimer);
  status.textContent = message;
  statusTimer = setTimeout(() => { status.textContent = ''; }, 3500);
}
input.addEventListener('input', () => {
  previousText = '';
  undo.hidden = true;
  status.textContent = '';
  update();
});
clear.addEventListener('click', () => {
  previousText = input.value;
  input.value = '';
  undo.hidden = false;
  update();
  input.focus();
  showStatus('글을 지웠어요.');
});
undo.addEventListener('click', () => {
  input.value = previousText;
  previousText = '';
  undo.hidden = true;
  update();
  input.focus();
  showStatus('글을 복원했어요.');
});
copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(input.value);
    showStatus('복사했어요.');
  } catch {
    input.focus();
    input.select();
    showStatus('선택된 글을 직접 복사해 주세요.');
  }
});
update();

// Progressive enhancement: ordinary browsers need no agent integration.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  try {
    Promise.resolve(document.modelContext.registerTool({
      name: 'count_current_text', title: '현재 글자수 확인',
      description: 'Return counts for the text currently shown in the editor without changing it.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(args) {
        if (!args || typeof args !== 'object' || Array.isArray(args) || Object.keys(args).length) throw new Error('Expected an empty object');
        return countText(input.value);
      }
    }, { signal: lifecycle.signal })).catch(() => {});
    window.addEventListener('pagehide', () => lifecycle.abort(), { once: true });
  } catch { /* Optional browser integration must not affect counting. */ }
}
