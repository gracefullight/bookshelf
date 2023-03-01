import { DateTime } from "luxon";

import type { PluginOptions } from "../types";

const options: PluginOptions = {
  name: "wikibook",
  url: "https://wikibook.co.kr/list/",
  limit: 20,

  selectors: {
    url: "#book-list .book-url",
    title: "#book-list .main-title",
    date: [
      "#book-list .pub-date",
      (span) => {
        const spanText = span.textContent as string;
        const [, y, m, d] =
          spanText.match(/(\d{4})년 (\d{1,2})월 (\d{1,2})일/) ?? [];
        return DateTime.fromFormat(`${y}-${m}-${d}`, "yyyy-M-d").toFormat(
          "yyyy-MM-dd"
        );
      },
    ],
    author: [
      "#book-list .author",
      (span) => {
        const spanText = span.textContent as string;
        return spanText.replace("지음", "").trim();
      },
    ],
    description: "#book-list .sub-title",
    image: "#book-list .book-list-image img",
  },
};

export default options;
