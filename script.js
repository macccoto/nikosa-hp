/*
  script.js
  - ハンバーガーメニュー開閉
  - スムーススクロール
  - 現在位置のメニュー強調（軽量: IntersectionObserver）
*/

(() => {
  "use strict";

  const menuButton = document.querySelector("[data-menu-button]");
  const siteNav = document.querySelector("[data-site-nav]");
  const backdrop = document.querySelector("[data-backdrop]");
  const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));

  const header = document.querySelector(".site-header");

  if (!menuButton || !siteNav || !backdrop) {
    return;
  }

  const setAriaExpanded = (isOpen) => {
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
  };

  const openNav = () => {
    document.body.classList.add("nav-open");
    backdrop.hidden = false;
    setAriaExpanded(true);
  };

  const closeNav = () => {
    document.body.classList.remove("nav-open");
    backdrop.hidden = true;
    setAriaExpanded(false);
  };

  const toggleNav = () => {
    if (document.body.classList.contains("nav-open")) closeNav();
    else openNav();
  };

  menuButton.addEventListener("click", toggleNav);
  backdrop.addEventListener("click", closeNav);

  // Esc で閉じる
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!document.body.classList.contains("nav-open")) return;
    closeNav();
  });

  // クリックしたらメニューを閉じる（スマホ想定）
  navLinks.forEach((a) => {
    a.addEventListener("click", () => {
      closeNav();
    });
  });

  // スムーススクロール（CSSのscroll-behaviorが効かない環境/微調整用）
  // - 固定ヘッダーの高さ分だけオフセット
  const getHeaderOffset = () => {
    const h = header ? header.getBoundingClientRect().height : 0;
    return Math.max(0, Math.round(h));
  };

  const scrollToHash = (hash) => {
    const id = hash.replace("#", "");
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;

    const top = window.scrollY + el.getBoundingClientRect().top - getHeaderOffset() - 10;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // 同一ページ内リンクのみ補正スクロール
  document.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
    if (!target) return;

    const href = target.getAttribute("href");
    if (!href || href === "#") return;

    // 既定のジャンプを抑えて、オフセット付きでスクロール
    e.preventDefault();
    history.pushState(null, "", href);
    scrollToHash(href);
  });

  // 初期ロードでハッシュがあれば位置補正
  window.addEventListener("load", () => {
    if (location.hash) {
      // すぐ動かすと画像ロード等でずれるので少し待つ
      window.setTimeout(() => scrollToHash(location.hash), 50);
    }
  });

  const sectionIds = navLinks
    .map((a) => a.getAttribute("href"))
    .filter((h) => h && h.startsWith("#") && h.length > 1)
    .map((h) => h.slice(1));

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setCurrent = (id) => {
    navLinks.forEach((a) => {
      const href = a.getAttribute("href");
      const isCurrent = href === `#${id}`;
      if (isCurrent) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  };

  // 現在位置のメニュー強調（スクロールスパイ）
  // IntersectionObserver だと #schedule が縦に長く、他セクションへ来ても「スケジュール」のまま残りやすい。
  // 固定ヘッダー直下の基準線 Y より「上にある最後のセクション」を現在とみなす。
  const updateActiveNav = () => {
    if (!sections.length) return;

    const docBottom = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.documentElement.clientHeight
    );
    const scrollBottom = window.scrollY + window.innerHeight;

    // ページ最下部付近は末尾セクションを優先（短い末尾セクション・モバイルアドレスバー対策）
    if (scrollBottom >= docBottom - 24) {
      setCurrent(sections[sections.length - 1].id);
      return;
    }

    const refY = window.scrollY + getHeaderOffset() + 12;
    let currentId = sections[0].id;

    sections.forEach((s) => {
      const topDoc = window.scrollY + s.getBoundingClientRect().top;
      if (topDoc <= refY) currentId = s.id;
    });

    setCurrent(currentId);
  };

  let navTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!navTicking) {
        navTicking = true;
        requestAnimationFrame(() => {
          updateActiveNav();
          navTicking = false;
        });
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", updateActiveNav, { passive: true });
  window.addEventListener("load", updateActiveNav);
  updateActiveNav();

  // ダミー送信ボタン（見た目だけ）
  const fakeSubmit = document.querySelector("[data-fake-submit]");
  if (fakeSubmit) {
    fakeSubmit.addEventListener("click", () => {
      // 実送信はしない。必要ならフォームサービス等へ差し替えてください。
      window.alert("デモなので送信されません（見た目だけです）。");
    });
  }
})();

