import type { PluginOptions } from "../types";

const options: PluginOptions = {
  name: "bjpublic",
  url: "https://bjpublic.tistory.com/category/새로%20나온%20책",

  selectors: {
    url: "#content_search .link_thumb",

    title: "#content_search .cont_thumb > p:nth-child(1)",
    date: ["#content_search .cont_thumb .thumb_info > .date", (p) => {
      const pText = p.textContent as string;
      return pText.split('.').join('-');
    }],
    author: [
      "#content_search .cont_thumb > p:nth-child(2)",
      (p) => {
        const pText = p.textContent as string;
        const [, author] = pText.match(/저자\s(.+?)\s(?:출판사|역자)/) ?? [];
        return author;
      },
    ],
    description: [
      "#content_search .cont_thumb > p:nth-child(2)",
      (p) => {
        const pText = p.textContent as string;
        const [, description] = pText.match(/책 소개 (.+)/) ?? [];
        return description;
      },
    ],
    image: [
      "#content_search .box_thumb",
      (div) => {
        const [, image] = div.style.backgroundImage.match(/"(.+)"/) ?? [];
        return image;
      },
    ],
  },
};

export default options;
