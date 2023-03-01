type Awaitable<T> = T | PromiseLike<T>;

export interface SelectorConfig {
  hasDetail?: boolean;
  root?: string;
}

interface Selectors {
  title: Selector;
  // ? assume anchor
  url: Selector;
  date: Selector;
  author?: Selector;
  description?: Selector;
  // ? assume img
  image?: Selector;
}

export type SelectorKeys = keyof Selectors;
export type SelectorCallback<T> = (element: T) => Awaitable<string>;

export type Selector<T extends HTMLElement = HTMLElement> =
  | string
  | [string, SelectorConfig]
  | [string, SelectorCallback<T>]
  | [string, SelectorCallback<T>, SelectorConfig];

export interface PluginOptions {
  name: string;
  url: string;
  limit?: number;
  hasDetail?: boolean;
  userAgent?: string;
  dateFormat?: string;
  timezone?: string;

  selectors: Selectors;
}
