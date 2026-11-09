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
      explorer.querySelector(".title-button h2")?.replaceChildren(explorerTitle)
      explorer.querySelector(".mobile-explorer")?.setAttribute("aria-label", explorerTitle)

      const filterExplorer = () => {
        const tree = explorer.querySelector(".explorer-ul")
        if (!tree) return

        tree.querySelectorAll(".folder-container[data-folderpath]").forEach((folder) => {
          const folderPath = folder.dataset.folderpath
          if (folderPath !== "en" && folderPath !== "ko") return

          const row = folder.closest("li")
          if (!row) return
          row.hidden = folderPath !== language
          if (folderPath === language) {
            folder.querySelector(".folder-title")?.replaceChildren(explorerTitle)
            folder.nextElementSibling?.classList.add("open")
          }
        })

        tree.querySelectorAll("a.nav-file-title").forEach((link) => {
          const path = new URL(link.href, window.location.href).pathname.replace(/\/$/, "")
          const localeHome = new RegExp(`/${language}(?:/index)?(?:\\.html)?$`)
          if (localeHome.test(path)) {
            const row = link.closest("li")
            if (row) row.hidden = true
          }
        })
      }

      filterExplorer()
      if (explorer.dataset.languageFilter !== "true") {
        explorer.dataset.languageFilter = "true"
        new MutationObserver(filterExplorer).observe(explorer, { childList: true, subtree: true })
      }
    }

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
