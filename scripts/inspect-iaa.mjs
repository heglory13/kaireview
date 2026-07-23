import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const chromePath =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const targetUrl = process.env.TARGET_URL || "https://iaa.uk.net/";
const port = 9333;
const artifactSlug = process.env.ARTIFACT_SLUG || "iaa.uk.net";
const outRoot = `docs/research/${artifactSlug}`;
const shotsRoot = `docs/design-references/${artifactSlug}`;

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data.toString());
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(JSON.stringify(message.error)));
        else resolve(message.result);
        return;
      }
      if (message.method && this.listeners.has(message.method)) {
        for (const listener of this.listeners.get(message.method)) {
          listener(message.params);
        }
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  once(method) {
    return new Promise((resolve) => {
      const listener = (params) => {
        this.off(method, listener);
        resolve(params);
      };
      this.on(method, listener);
    });
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) || new Set();
    listeners.add(listener);
    this.listeners.set(method, listeners);
  }

  off(method, listener) {
    const listeners = this.listeners.get(method);
    if (!listeners) return;
    listeners.delete(listener);
  }

  close() {
    this.ws.close();
  }
}

async function waitForChrome() {
  const started = Date.now();
  while (Date.now() - started < 10000) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return res.json();
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  throw new Error("Chrome did not expose the debugging endpoint in time.");
}

async function createPage() {
  const res = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {
    method: "PUT",
  });
  if (!res.ok) {
    throw new Error(`Failed to create tab: ${res.status} ${await res.text()}`);
  }
  const tab = await res.json();
  const client = new CdpClient(tab.webSocketDebuggerUrl);
  await client.open();
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("DOM.enable");
  return client;
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(JSON.stringify(result.exceptionDetails, null, 2));
  }
  return result.result.value;
}

async function preparePage(client, viewport) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
  });
  const loaded = client.once("Page.loadEventFired");
  await client.send("Page.navigate", { url: targetUrl });
  await loaded;
  await evaluate(
    client,
    `new Promise((resolve) => {
      const done = () => setTimeout(resolve, 1200);
      if (document.readyState === "complete") done();
      else window.addEventListener("load", done, { once: true });
    })`,
  );
  await evaluate(client, `document.fonts?.ready || Promise.resolve()`);
}

async function captureFullPage(client, filename) {
  const metrics = await client.send("Page.getLayoutMetrics");
  const width = Math.ceil(metrics.cssContentSize.width);
  const height = Math.ceil(metrics.cssContentSize.height);
  const shot = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width, height, scale: 1 },
  });
  await writeFile(filename, Buffer.from(shot.data, "base64"));
}

function extractionExpression() {
  return `(() => {
    const props = [
      "fontSize","fontWeight","fontFamily","lineHeight","letterSpacing","color",
      "textTransform","textDecoration","backgroundColor","background",
      "padding","paddingTop","paddingRight","paddingBottom","paddingLeft",
      "margin","marginTop","marginRight","marginBottom","marginLeft",
      "width","height","maxWidth","minWidth","maxHeight","minHeight",
      "display","flexDirection","justifyContent","alignItems","gap",
      "gridTemplateColumns","gridTemplateRows","columnGap","rowGap",
      "borderRadius","border","borderTop","borderBottom","borderLeft","borderRight",
      "boxShadow","overflow","overflowX","overflowY",
      "position","top","right","bottom","left","zIndex",
      "opacity","transform","transition","cursor",
      "objectFit","objectPosition","mixBlendMode","filter","backdropFilter",
      "whiteSpace","textOverflow","WebkitLineClamp"
    ];
    const keep = new Set([
      "BODY","HEADER","NAV","MAIN","SECTION","ARTICLE","ASIDE","FOOTER",
      "H1","H2","H3","H4","H5","P","A","IMG","UL","LI","FORM","INPUT","BUTTON"
    ]);
    const cleanText = (text) => (text || "").replace(/\\s+/g, " ").trim();
    const stylesOf = (element) => {
      const cs = getComputedStyle(element);
      const styles = {};
      props.forEach((prop) => {
        const value = cs[prop];
        if (
          value &&
          value !== "none" &&
          value !== "normal" &&
          value !== "auto" &&
          value !== "0px" &&
          value !== "rgba(0, 0, 0, 0)"
        ) {
          styles[prop] = value;
        }
      });
      return styles;
    };
    const summarize = (element, depth = 0) => {
      const children = [...element.children];
      const rect = element.getBoundingClientRect();
      const directText = [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => cleanText(node.textContent))
        .filter(Boolean)
        .join(" ");
      return {
        tag: element.tagName.toLowerCase(),
        id: element.id || null,
        classes: typeof element.className === "string" ? element.className : "",
        text: directText || null,
        allText: depth <= 1 ? cleanText(element.textContent).slice(0, 500) : undefined,
        href: element.href || null,
        src: element.currentSrc || element.src || null,
        alt: element.alt || null,
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y + scrollY),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
        styles: stylesOf(element),
        children: children
          .filter((child) => keep.has(child.tagName) || child.children.length || cleanText(child.textContent))
          .slice(0, depth < 2 ? 30 : 14)
          .map((child) => summarize(child, depth + 1)),
      };
    };
    const sectionCandidates = [
      "header",
      ".main-navigation",
      "#masthead",
      "main",
      ".site-main",
      ".main-content",
      ".content-area",
      ".featured-area",
      ".post-list",
      ".widget",
      "footer",
      "#colophon"
    ];
    const sections = sectionCandidates
      .flatMap((selector) => [...document.querySelectorAll(selector)])
      .filter((element, index, list) => list.indexOf(element) === index)
      .map((element) => summarize(element));
    const palette = [...document.querySelectorAll("body, header, nav, main, section, article, h1, h2, h3, h4, p, a, footer, button, input")]
      .flatMap((element) => {
        const cs = getComputedStyle(element);
        return [cs.color, cs.backgroundColor, cs.borderColor].filter(Boolean);
      })
      .filter((value) => value && value !== "rgba(0, 0, 0, 0)")
      .reduce((acc, value) => {
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {});
    const images = [...document.querySelectorAll("img")].map((img) => ({
      src: img.currentSrc || img.src,
      rawSrc: img.getAttribute("src"),
      srcset: img.getAttribute("srcset"),
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight,
      renderedWidth: Math.round(img.getBoundingClientRect().width),
      renderedHeight: Math.round(img.getBoundingClientRect().height),
      parentClasses: img.parentElement?.className?.toString() || "",
    }));
    const backgroundImages = [...document.querySelectorAll("*")]
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        classes: typeof element.className === "string" ? element.className : "",
        backgroundImage: getComputedStyle(element).backgroundImage,
      }))
      .filter((item) => item.backgroundImage && item.backgroundImage !== "none");
    const links = [...document.querySelectorAll("a")].map((a) => ({
      text: cleanText(a.textContent),
      href: a.href,
      classes: a.className?.toString() || "",
    }));
    return {
      title: document.title,
      url: location.href,
      bodyClass: document.body.className,
      htmlClass: document.documentElement.className,
      viewport: { width: innerWidth, height: innerHeight, scrollHeight: document.documentElement.scrollHeight },
      fonts: [...new Set([...document.querySelectorAll("*")].slice(0, 400).map((el) => getComputedStyle(el).fontFamily))],
      palette,
      favicons: [...document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"]')].map((link) => ({
        rel: link.rel,
        href: link.href,
        sizes: link.sizes?.toString() || "",
      })),
      meta: [...document.querySelectorAll("meta")].map((meta) => ({
        name: meta.getAttribute("name"),
        property: meta.getAttribute("property"),
        content: meta.getAttribute("content"),
      })).filter((meta) => meta.name || meta.property),
      images,
      backgroundImages,
      links,
      headings: [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((heading) => ({
        level: heading.tagName.toLowerCase(),
        text: cleanText(heading.textContent),
        classes: heading.className?.toString() || "",
        rect: (() => {
          const rect = heading.getBoundingClientRect();
          return { x: Math.round(rect.x), y: Math.round(rect.y + scrollY), width: Math.round(rect.width), height: Math.round(rect.height) };
        })(),
        styles: stylesOf(heading),
      })),
      sections,
    };
  })()`;
}

function behaviorExpression() {
  return `(() => {
    const link = document.querySelector("a");
    const header = document.querySelector("header, #masthead");
    const search = document.querySelector('input[type="search"], .search-field');
    const menuButton = document.querySelector('button, .menu-toggle');
    const describe = (element) => {
      if (!element) return null;
      const cs = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName.toLowerCase(),
        classes: element.className?.toString() || "",
        text: (element.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 160),
        rect: { x: Math.round(rect.x), y: Math.round(rect.y + scrollY), width: Math.round(rect.width), height: Math.round(rect.height) },
        cursor: cs.cursor,
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        border: cs.border,
        transition: cs.transition,
      };
    };
    return {
      headerAtTop: describe(header),
      firstLink: describe(link),
      search: describe(search),
      menuButton: describe(menuButton),
      animations: [...document.getAnimations({ subtree: true })].map((animation) => ({
        duration: animation.effect?.getTiming?.().duration,
        delay: animation.effect?.getTiming?.().delay,
        playState: animation.playState,
      })),
      smoothScroll: {
        htmlScrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
        bodyScrollBehavior: getComputedStyle(document.body).scrollBehavior,
        hasLenisClass: document.documentElement.className.includes("lenis") || document.body.className.includes("lenis"),
      },
    };
  })()`;
}

async function downloadAsset(asset) {
  const url = new URL(asset.src);
  const extension = extname(url.pathname) || ".bin";
  const base = basename(url.pathname, extension)
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .slice(0, 70);
  const fileName = `${base || "asset"}${extension}`;
  const localPath = join("public", "images", "iaa", fileName);
  const res = await fetch(asset.src);
  if (!res.ok) throw new Error(`Failed ${asset.src}: ${res.status}`);
  await writeFile(localPath, Buffer.from(await res.arrayBuffer()));
  return { ...asset, localPath: `/${localPath.split("public/")[1]}` };
}

async function main() {
  await mkdir(outRoot, { recursive: true });
  await mkdir(shotsRoot, { recursive: true });
  await mkdir("public/images/iaa", { recursive: true });

  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=/tmp/codex-iaa-chrome-${Date.now()}`,
    "about:blank",
  ]);
  chrome.stderr.on("data", () => {});

  try {
    await waitForChrome();
    const client = await createPage();

    await preparePage(client, { width: 1440, height: 1000, mobile: false });
    await captureFullPage(client, join(shotsRoot, "desktop-full.png"));
    const desktop = await evaluate(client, extractionExpression());
    const behaviorTop = await evaluate(client, behaviorExpression());
    await evaluate(client, "scrollTo(0, 220)");
    await new Promise((resolve) => setTimeout(resolve, 300));
    const behaviorScrolled = await evaluate(client, behaviorExpression());
    await writeFile(
      join(outRoot, "desktop-extraction.json"),
      JSON.stringify({ ...desktop, behaviorTop, behaviorScrolled }, null, 2),
    );

    await preparePage(client, { width: 768, height: 1000, mobile: false });
    await captureFullPage(client, join(shotsRoot, "tablet-full.png"));
    const tablet = await evaluate(client, extractionExpression());
    await writeFile(join(outRoot, "tablet-extraction.json"), JSON.stringify(tablet, null, 2));

    await preparePage(client, { width: 390, height: 1000, mobile: true });
    await captureFullPage(client, join(shotsRoot, "mobile-full.png"));
    const mobile = await evaluate(client, extractionExpression());
    await writeFile(join(outRoot, "mobile-extraction.json"), JSON.stringify(mobile, null, 2));

    const uniqueAssets = new Map();
    for (const image of desktop.images) {
      if (image.src && !uniqueAssets.has(image.src)) uniqueAssets.set(image.src, image);
    }
    for (const icon of desktop.favicons) {
      if (icon.href && !uniqueAssets.has(icon.href)) {
        uniqueAssets.set(icon.href, { src: icon.href, alt: icon.rel });
      }
    }
    const downloaded = [];
    for (const asset of uniqueAssets.values()) {
      try {
        downloaded.push(await downloadAsset(asset));
      } catch (error) {
        downloaded.push({ ...asset, error: String(error) });
      }
    }
    await writeFile(join(outRoot, "downloaded-assets.json"), JSON.stringify(downloaded, null, 2));

    client.close();
  } finally {
    chrome.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
