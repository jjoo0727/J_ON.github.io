(() => {
  const update = () => {
    const slug = document.body?.dataset.slug ?? ""
    const match = slug.match(/^(en|ko)\/(.+)$/)
    if (!match) return

    const [, language, page] = match
    const targetLanguage = language === "en" ? "ko" : "en"
    const basePath = (document.body.dataset.basepath ?? "").replace(/\/$/, "")
    const pageTitle = document.querySelector(".left.sidebar .page-title a")

    if (pageTitle) {
      pageTitle.textContent = "Jaeeon Kim"
      pageTitle.href = `${basePath}/${language}/index.html`
      pageTitle.setAttribute("aria-label", "Jaeeon Kim")
    }

    const explorer = document.querySelector(".left.sidebar .explorer")
    if (explorer) {
      const explorerTitle = language === "en" ? "Pages" : "메뉴"
      const homeTitle = language === "en" ? "Home" : "홈"
      const heading = explorer.querySelector(".title-button h2")
      if (heading && heading.textContent !== explorerTitle) heading.textContent = explorerTitle
      explorer.querySelector(".mobile-explorer")?.setAttribute("aria-label", explorerTitle)

      const filterExplorer = () => {
        const tree = explorer.querySelector(".explorer-ul")
        if (!tree) return

        let homeRow = tree.querySelector(":scope > li [data-language-home='true']")?.closest("li")
        if (!homeRow) {
          homeRow = document.createElement("li")
          const homeLink = document.createElement("a")
          homeLink.className = "nav-file-title tree-item-self"
          homeLink.dataset.languageHome = "true"
          homeRow.append(homeLink)
        }

        const homeLink = homeRow.querySelector("[data-language-home='true']")
        if (homeLink) {
          homeLink.href = `${basePath}/${language}/index.html`
          if (homeLink.textContent !== homeTitle) homeLink.textContent = homeTitle
          homeLink.lang = language
          homeLink.setAttribute("aria-label", homeTitle)
          homeLink.setAttribute("aria-current", page === "index" ? "page" : "false")
        }
        if (homeRow.parentElement !== tree) {
          const firstItem = tree.querySelector(":scope > li:not(.overflow-end)")
          tree.insertBefore(homeRow, firstItem ?? tree.querySelector(":scope > li.overflow-end"))
        }

        tree.querySelectorAll(".folder-container[data-folderpath]").forEach((folder) => {
          const folderLanguage = folder.dataset.folderpath.split("/")[0]
          if (folderLanguage !== "en" && folderLanguage !== "ko") return

          const row = folder.closest("li")
          if (!row) return
          row.hidden = true

          if (folderLanguage === language) {
            const childList = folder.nextElementSibling?.querySelector(".tree-item-children")
            if (childList) {
              Array.from(childList.children).forEach((child) => {
                if (!child.classList.contains("overflow-end")) {
                  const end = tree.querySelector(":scope > li.overflow-end")
                  tree.insertBefore(child, end)
                }
              })
            }
          }
        })

        tree.querySelectorAll("a.nav-file-title").forEach((link) => {
          if (link.dataset.languageHome === "true") {
            const row = link.closest("li")
            if (row) row.hidden = false
            return
          }

          const path = new URL(link.href, window.location.href).pathname.replace(/\/$/, "")
          const normalized = path.replace(/\/index(?:\.html)?$/, "").replace(/\.html$/, "")
          const pathLanguage = normalized.startsWith(`${basePath}/en/`)
            ? "en"
            : normalized.startsWith(`${basePath}/ko/`)
              ? "ko"
              : null
          const localeHome = normalized === `${basePath}/${language}`
          const row = link.closest("li")
          if (row) row.hidden = (pathLanguage !== null && pathLanguage !== language) || localeHome
        })
      }

      filterExplorer()
      if (explorer.dataset.languageFilter !== "true") {
        explorer.dataset.languageFilter = "true"
        new MutationObserver(filterExplorer).observe(explorer, { childList: true, subtree: true })
      }
    }

    const tocTitle = document.querySelector(".right.sidebar .toc .toc-header h3")
    if (tocTitle) tocTitle.textContent = language === "en" ? "On This Page" : "이 페이지에서"

    document.querySelector("[data-language-switch]")?.remove()

    const toolbar = [...document.querySelectorAll(".left.sidebar .flex-component")].find((element) =>
      element.querySelector(".darkmode"),
    )
    if (!toolbar) return

    const link = document.createElement("a")
    link.className = "language-switch"
    link.dataset.languageSwitch = "true"
    link.textContent = language === "en" ? "KO" : "EN"
    link.lang = targetLanguage
    link.title = language === "en" ? "한국어로 전환" : "Switch to English"
    link.setAttribute("aria-label", link.title)
    link.href = `${basePath}/${targetLanguage}/${page}.html`

    const darkMode = toolbar.querySelector(".darkmode")
    const component = darkMode?.parentElement
    if (component?.parentElement === toolbar) {
      toolbar.insertBefore(link, component.nextSibling)
    } else {
      toolbar.append(link)
    }
  }

  document.addEventListener("nav", update)
  document.addEventListener("render", update)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", update, { once: true })
  } else {
    update()
  }
})()
