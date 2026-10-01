import { EventEmitter } from "events";
import { Injectable } from "@nestjs/common";

export interface DictionarySentenceChangedEvent {
  dictionaryId: string;
  sentenceId: string;
  change: "created" | "updated";
}

type SentenceChangedListener = (event: DictionarySentenceChangedEvent) => void;

const SENTENCE_CHANGED = "dictionary.sentence.changed";

/** In-process events emitted by the dictionary module. Listeners must handle their own errors. */
@Injectable()
export class DictionaryEvents {
  private readonly emitter = new EventEmitter();

  emitSentenceChanged(event: DictionarySentenceChangedEvent): void {
    this.emitter.emit(SENTENCE_CHANGED, event);
  }

  onSentenceChanged(listener: SentenceChangedListener): void {
    this.emitter.on(SENTENCE_CHANGED, listener);
  }
}
