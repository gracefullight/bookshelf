import type { PluginOptions } from "../types";

const options: PluginOptions = {
  name: "gilbut",
  type: "crawl",
  url: "https://www.gilbut.co.kr/search/search_book_list#code=003000000&sub_code=&view_mode=&list_size=20&order=date&descending=true&page=1",

  selectors: {
    url: "#book_list .info > a",
    title: "#book_list .info .title",
    date: [
      "#book_list .info .detail",
      (span) => {
        const spanText = String(span.textContent);
        const details = spanText
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean);
        return details[3].split(".").join("-");
      },
    ],
    author: [
      "#book_list .info .detail",
      (span) => {
        const spanText = String(span.textContent);
        const details = spanText
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean);
        return details[2];
      },
    ],
    description: "#book_list .info .desc",
    image: "#book_list .book img",
  },
};

export default options;
