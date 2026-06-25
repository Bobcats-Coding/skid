import type { Observable } from 'rxjs'

export type GoogleFormsService = {
  saveAnswers: (formId: string, answers: Record<string, unknown>) => Observable<void>
}
