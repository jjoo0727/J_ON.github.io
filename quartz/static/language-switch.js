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
      pageTitle.textContent = language === "en" ? "Home" : "홈"
      pageTitle.href = `${basePath}/${language}/index.html`
      pageTitle.setAttribute("aria-label", language === "en" ? "Home" : "홈")
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
