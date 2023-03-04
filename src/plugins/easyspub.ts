import type { PluginOptions } from "../types";

// ! blocked JSDOM
const options: PluginOptions = {
  name: "easyspub",
  type: "crawl",
  url: "http://www.easyspub.co.kr/20_Menu/BookList/PUB",

  selectors: {
    url: [
      "#book_list_wrap .book_list_area li a",
      (a) => {
        const alt = a.getAttribute("alt") as string;
        const bookId = alt.slice(1);
        return `http://www.easyspub.co.kr/20_Menu/BookView/PUB/${bookId}/PUB`;
      },
    ],
    title: "#book_list_wrap .book_list_area li .title",
    date: "#book_list_wrap .book_list_area .brief_info .book_info > span:nth-child(2)",
    author: "#book_list_wrap .book_list_area li .book_info span:first-child",
    description: "#book_list_wrap .book_list_area li .txt_area",
    image: "#book_list_wrap .book_list_area li .img_area img",
  },
};

export default options;
