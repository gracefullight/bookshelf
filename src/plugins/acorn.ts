import type { PluginOptions } from "../types";

const options: PluginOptions = {
  name: "acorn",
  type: "crawl",
  url: "http://www.acornpub.co.kr/book/new",

  selectors: {
    url: "#book-list .book-thumb",

    title: "#book-list .item-box dt strong",
    date: [
      "#book-list .item-box dd.info span",
      (span) => {
        const spanText = span.textContent as string;
        const [, y, m, d] =
          spanText.match(/\| (\d{4})년 (\d{2})월 (\d{2})일 펴냄/) ?? [];
        return `${y}-${m}-${d}`;
      },
    ],
    author: [
      "#book-list .item-box dd.info b:first-child",
      (b) => {
        const bText = b.textContent as string;
        return bText.replace(/지은이\s+-\s?/, "");
      },
    ],
    // ? assume img
    image: "#book-list .book-thumb .thumb img",
    description: [
      "#book-list .item-box dd.desc",
      (dd) => {
        const ddText = dd.textContent as string;
        return ddText.trim();
      },
    ],
  },
};

export default options;
