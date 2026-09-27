export class MeilisearchIndexName {
  constructor(private readonly prefix: string) {}

  for(dictionaryId: string): string {
    return `${this.prefix}_${dictionaryId}`;
  }
}
