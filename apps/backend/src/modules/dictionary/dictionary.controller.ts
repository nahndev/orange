import { Controller } from "@nestjs/common";
import { DictionaryService } from "./dictionary.service";

@Controller("dictionaries")
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}
}
