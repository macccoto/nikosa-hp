/*
  script.js
  - ハンバーガーメニュー開閉
  - 現在位置のメニュー強調（スクロール位置ベース）
  - ページ内リンクはブラウザ標準の # ジャンプ（style.css の scroll-margin-top でヘッダー回避）
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

  const getHeaderOffset = () => {
    const h = header ? header.getBoundingClientRect().height : 0;
    return Math.max(0, Math.round(h));
  };

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
  window.addEventListener("hashchange", updateActiveNav);
  updateActiveNav();

})();

