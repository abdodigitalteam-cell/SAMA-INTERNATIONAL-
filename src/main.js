import { createIcons, Sun, Moon, MessageCircleHeart, Sparkles, Copy, ArrowUpLeft, ListChecks, Star, Send, Globe2 } from 'lucide';
import './style.css';

const THEME_KEY = 'sama-review-theme';
const iconSet = { Sun, Moon, MessageCircleHeart, Sparkles, Copy, ArrowUpLeft, ListChecks, Star, Send, Globe2 };

function renderIcons() {
  createIcons({ icons: iconSet, attrs: { 'stroke-width': 1.8 } });
}

function setTheme(theme, persist = true) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#1B2529' : '#FAF8F1';
  const toggle = document.querySelector('#theme-toggle');
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  toggle.setAttribute('aria-label', `تفعيل المظهر ${nextTheme === 'light' ? 'الفاتح' : 'الداكن'}`);
  toggle.innerHTML = `<i data-lucide="${theme === 'dark' ? 'sun' : 'moon'}" aria-hidden="true"></i>`;
  renderIcons();
  if (persist) localStorage.setItem(THEME_KEY, theme);
}

function getPreferredTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return 'clipboard';
  }

  const helper = document.createElement('textarea');
  helper.value = text;
  helper.setAttribute('readonly', '');
  helper.setAttribute('aria-hidden', 'true');
  helper.style.position = 'fixed';
  helper.style.insetInlineStart = '-9999px';
  document.body.append(helper);
  helper.select();
  const copied = document.execCommand('copy');
  helper.remove();
  if (!copied) throw new Error('Clipboard fallback failed');
  return 'fallback';
}

function initSuggestions() {
  const status = document.querySelector('#status-message');
  const cards = [...document.querySelectorAll('[data-suggestion]')];

  cards.forEach((card) => {
    const button = card.querySelector('[data-copy]');
    const label = button.querySelector('span');
    const originalLabel = label.textContent;
    let resetTimer;

    button.addEventListener('click', async () => {
      const comment = card.querySelector('textarea').value.trim();
      if (!comment) {
        status.textContent = 'اكتب تعليقك أو عدّل الاقتراح قبل نسخه.';
        card.querySelector('textarea').focus();
        return;
      }

      try {
        const method = await copyText(comment);
        cards.forEach((otherCard) => {
          const otherButton = otherCard.querySelector('[data-copy]');
          otherButton.querySelector('span').textContent = 'نسخ التعليق';
          otherButton.classList.remove('is-copied');
        });
        clearTimeout(resetTimer);
        label.textContent = 'تم النسخ ✓';
        button.classList.add('is-copied');
        status.textContent = `تم نسخ التعليق${method === 'fallback' ? ' بالطريقة البديلة' : ''}. راجعه والصقه بنفسك داخل Google.`;
        resetTimer = window.setTimeout(() => {
          label.textContent = originalLabel;
          button.classList.remove('is-copied');
        }, 2200);
      } catch (error) {
        console.error('Unable to copy suggested review:', error);
        status.textContent = 'تعذر النسخ تلقائيًا. حدّد التعليق وانسخه يدويًا من مربع النص.';
      }
    });
  });
}

document.querySelector('#theme-toggle').addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

setTheme(getPreferredTheme(), false);
initSuggestions();
document.querySelector('#company-video').addEventListener('error', () => {
  document.querySelector('#video-error').hidden = false;
});
document.querySelector('#google-link').addEventListener('click', () => {
  document.querySelector('#status-message').textContent = 'اختر تقييمك داخل Google، والصق التعليق الذي نسخته، ثم راجعه واضغط نشر بنفسك.';
});
renderIcons();
