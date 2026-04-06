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

  // 現在位置のメニュー強調
  // - 対象セクション: navリンクのhref(#id)に対応する要素
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

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        // 画面内に入った中で、最も上に近いものを採用
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length) {
          setCurrent(visible[0].target.id);
        }
      },
      {
        root: null,
        // 固定ヘッダー分を考慮して、上の当たり判定を少し下げる
        rootMargin: `-${getHeaderOffset() + 16}px 0px -55% 0px`,
        threshold: [0.05, 0.1, 0.2],
      }
    );

    sections.forEach((s) => observer.observe(s));
  } else {
    // フォールバック: スクロール位置から雑に判定（軽いが精度はほどほど）
    const onScroll = () => {
      const offset = getHeaderOffset() + 24;
      let current = sections[0]?.id;
      sections.forEach((s) => {
        const top = window.scrollY + s.getBoundingClientRect().top;
        if (top - offset <= window.scrollY) current = s.id;
      });
      if (current) setCurrent(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ダミー送信ボタン（見た目だけ）
  const fakeSubmit = document.querySelector("[data-fake-submit]");
  if (fakeSubmit) {
    fakeSubmit.addEventListener("click", () => {
      // 実送信はしない。必要ならフォームサービス等へ差し替えてください。
      window.alert("デモなので送信されません（見た目だけです）。");
    });
  }
})();

