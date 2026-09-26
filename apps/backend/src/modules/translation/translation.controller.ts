import { Controller } from "@nestjs/common";
import { TranslationService } from "./translation.service";

@Controller("translations")
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}
}
