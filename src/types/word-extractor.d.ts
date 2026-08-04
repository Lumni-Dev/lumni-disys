declare module "word-extractor" {
  class WordExtractor {
    extract(input: string | Buffer): Promise<{
      getBody(): string;
      getHeaders(): string;
      getFootnotes(): string;
    }>;
  }
  export = WordExtractor;
}
