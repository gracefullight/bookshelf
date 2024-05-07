import { DateTime } from "luxon";

import type { PluginOptions } from "../types";

const options: PluginOptions = {
  name: "hanbit",
  type: "crawl",
  url: "https://www.hanbit.co.kr/media/books/new_book_list.html",
  hasDetail: true,

  selectors: {
    url: ".sub_book_list .view_box .info p.book_tit a",

    title: ".sub_book_list .view_box .info p.book_tit a",
    // ? https://www.hanbit.co.kr/media/books/book_view.html?p_code=B9403623796
    date: [
      "div.store_product_info_box > ul > li:nth-child(2) > span",
      (span) => {
        const date1Text = String(span.textContent);
        if (DateTime.fromISO(date1Text).isValid) {
          return date1Text;
        }

        const nextSpan =
          span.parentElement?.nextElementSibling?.querySelector("span");
        const date2Text = String(nextSpan?.textContent);
        return date2Text;
      },
      {
        hasDetail: true,
      },
    ],
    author: [
      ".sub_book_list .view_box .info p.book_writer",
      (p) => {
        const pText = String(p.textContent);
        return pText.trim();
      },
    ],
    description: [
      ".store_view_area > div.store_product_info_box > p",
      {
        hasDetail: true,
      },
    ],
    image: ".sub_book_list .view_box .view_box_block img.thumb",
  },
};

export default options;
