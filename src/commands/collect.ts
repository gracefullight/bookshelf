import { setTimeout } from "node:timers/promises";

import { faker } from "@faker-js/faker";
import { Command, Option } from "clipanion";
import { Feed } from "feed";
import { JSDOM, ResourceLoader } from "jsdom";
import { entries, omit, zip } from "lodash";
import { DateTime } from "luxon";

import * as plugins from "../plugins";
import type {
  SelectorKeys,
  SelectorCallback,
  SelectorConfig,
  Selector,
  CrawlPluginOptions,
  FilePluginOptions,
} from "../types";
import { downloadFeed, writeFeed } from "../utils";

const resourceLoader = new ResourceLoader({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
});

export class CollectCommand extends Command {
  static readonly paths = [["collect"]];

  sites = Option.Array("--site", { required: true });

  async execute(): Promise<void> {
    await Promise.all(
      Object.entries(plugins)
        .filter(([key]) => this.sites.includes(key))
        .map(([key, plugin]) => {
          if (plugin.type === "crawl") {
            return this.handleCrawlPlugin(key, plugin).catch((e: Error) =>
              this.context.stderr.write(`${key}: ${e.message}\n`)
            );
          } else {
            return this.handleFilePlugin(key, plugin);
          }
        })
    );
  }

  private async handleFilePlugin(key: string, plugin: FilePluginOptions) {
    await downloadFeed(key, plugin.url);
    this.context.stdout.write(`📰 Done: ${key}\n`);
  }

  private async handleCrawlPlugin(
    key: string,
    plugin: CrawlPluginOptions
  ): Promise<void> {
    this.context.stdout.write(`📗 Find a new book: ${key}\n`);

    const { hostname } = new URL(plugin.url);
    const dom = await JSDOM.fromURL(plugin.url, {
      resources: resourceLoader,
    });
    const mainDocument = dom.window.document;
    const tempUrls = this.getTextFromDocument(
      mainDocument,
      plugin.selectors.url,
      "url"
    );
    const urls = tempUrls.slice(0, plugin.limit ?? tempUrls.length);

    const detailDocumentsCache = plugin.hasDetail
      ? await this.getDetailDocumentsCache(urls)
      : {};

    const result: Record<string, string[]> = {};
    await Promise.all(
      entries(omit(plugin.selectors, "url")).map(async ([key, selector]) => {
        const isDetailSelector =
          (Array.isArray(selector) &&
            selector.length >= 2 &&
            typeof selector[selector.length - 1] === "object" &&
            (selector[selector.length - 1] as SelectorConfig).hasDetail) ??
          false;

        if (isDetailSelector) {
          result[key] = await Promise.all(
            urls.map(async (url) => {
              const [firstElementText] = await this.select(
                detailDocumentsCache[url],
                plugin?.selectors[key as SelectorKeys] as Selector,
                key as SelectorKeys
              );
              return firstElementText;
            })
          );
        } else {
          result[key] = await this.select(
            mainDocument,
            plugin?.selectors[key as SelectorKeys] as Selector,
            key as SelectorKeys
          );
        }
      })
    );

    const {
      title: titles,
      date: dates,
      description: descriptions = [],
      author: authors = [],
      image: images = [],
    } = result;

    const items = zip(urls, titles, dates, descriptions, authors, images)
      .slice(0, plugin.limit ?? urls.length)
      .map(([url, title, date, description, author, image]) => ({
        title: title as string,
        id: url as string,
        link: url as string,
        description,
        author: author
          ? author.split(",").map((person) => ({ name: person.trim() }))
          : undefined,
        date: DateTime.fromISO(date as string).toJSDate(),
        image,
      }));

    const feed = new Feed({
      title: plugin.name,
      description: "Generated by @gracefullight/bookshelf",
      copyright: `All Rights are reserved to ${hostname}`,
      id: plugin.url,
      link: "https://gracefullight.dev",
      language: "ko",
      author: {
        name: "gracefullight",
        email: "gracefullight.dev@gmail.com",
      },
    });

    items.forEach((item) => feed.addItem(item));
    const atom = feed.atom1();
    await writeFeed(key, atom);
    this.context.stdout.write(`📰 Done: ${key}\n`);
  }

  private async select(
    document: Document,
    selector: Selector,
    selectorKey: SelectorKeys
  ): Promise<string[]> {
    if (Array.isArray(selector)) {
      // ? [selector, callback, option]
      if (selector.length === 3) {
        return this.getTextFromDocumentUsingCallback(
          document,
          selector[0],
          selector[1]
        );
        // ? [selector, callback]
      } else if (typeof selector[selector.length - 1] === "function") {
        return this.getTextFromDocumentUsingCallback(
          document,
          selector[0],
          selector[selector.length - 1] as SelectorCallback<HTMLElement>
        );
      }
    }

    // ? [selector, option] || selector
    return this.getTextFromDocument(document, selector, selectorKey);
  }

  private getTextFromDocument(
    document: Document,
    selectorOrSelectorWithOption: Selector,
    selectorKey: SelectorKeys
  ): string[] {
    const selector = Array.isArray(selectorOrSelectorWithOption)
      ? selectorOrSelectorWithOption[0]
      : selectorOrSelectorWithOption;
    return [...document.querySelectorAll<HTMLElement>(String(selector))].map(
      (element) => {
        switch (selectorKey) {
          case "url":
            return (element as HTMLAnchorElement).href;
          case "image":
            return (element as HTMLImageElement).src;
          default:
            return element.textContent as string;
        }
      }
    );
  }

  private async getTextFromDocumentUsingCallback<
    T extends HTMLElement = HTMLElement
  >(
    document: Document,
    selector: string,
    cb: SelectorCallback<T>
  ): Promise<string[]> {
    return Promise.all(
      [...document.querySelectorAll<T>(selector)].map((element) => cb(element))
    );
  }

  private async getDetailDocumentsCache(
    urls: string[]
  ): Promise<Record<string, Document>> {
    const detailDocumentsCache: Record<string, Document> = {};
    await Promise.all(
      urls.map(async (url) => {
        await setTimeout(faker.number.int({ min: 500, max: 2000 }));
        const detailDom = await JSDOM.fromURL(url, {
          resources: resourceLoader,
        });

        detailDocumentsCache[url] = detailDom.window.document;
      })
    );
    return detailDocumentsCache;
  }
}
