import type { PluginOptions } from "../types";

// ? https://blog.insightbook.co.kr/feed/
const options: PluginOptions = {
  name: "insight",
  url: "https://ebook.insightbook.co.kr/search",
  limit: 20,
  hasDetail: true,

  selectors: {
    url: "#main_container .single-project-content a",
    title: "#main_container .single-project-content a",
    date: [
      "#main_container .single-project-content small",
      (small) => {
        const smallText = small.textContent as string;
        const [, rawDate] = smallText.split("|").map((t) => t.trim());
        return [...rawDate.split("."), "01"].join("-");
      },
    ],
    author: [
      "#main_container .single-project-content small",
      (small) => {
        const smallText = small.textContent as string;
        const [author] = smallText.split("|").map((t) => t.trim());
        return author;
      },
    ],
    description: "#main_container .single-project-content div > p",
    image: "#main_container .book-cover",
  },
};

export default options;
