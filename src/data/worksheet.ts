export type Screen =
  | 'home'
  | 'create'
  | 'create-manual'
  | 'loader'
  | 'preview'
  | 'edit'
  | 'edit-widget'
  | 'add-block'
  | 'show-answers'

export type Modal =
  | null
  | 'convert'
  | 'convert-success'
  | 'settings'
  | 'menu'
  | 'download'
  | 'duplicate'
  | 'delete'
  | 'regenerate'
  | 'regenerate-empty-topic'

export interface WorksheetBlock {
  id: string
  type: 'text' | 'lines' | 'grid' | 'answer' | 'image' | 'text-image' | 'open'
  title: string
  body?: string
  options?: string[]
  answer?: string
  difficulty?: 1 | 2 | 3
  showAnswer?: boolean
}

export interface WorksheetDraft {
  subject: string
  grade: string
  taskCount: string
  topic: string
  wishes: string
  title: string
  intro: string
  blocks: WorksheetBlock[]
}

export const SUBJECTS = [
  'Математика',
  'Русский язык',
  'Литература',
  'История',
  'Биология',
  'Физика',
  'Химия',
  'География',
  'Английский язык',
]

export const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']

export const TASK_COUNTS = ['4', '5', '6', '8', '10']

export const BLOCK_TYPES: { type: WorksheetBlock['type']; label: string; hint: string }[] = [
  { type: 'text', label: 'Текст', hint: 'Заголовок и абзац' },
  { type: 'open', label: 'Открытый вопрос', hint: 'Вопрос без вариантов' },
  { type: 'lines', label: 'Линии', hint: 'Поле для письма' },
  { type: 'grid', label: 'Клетка', hint: 'Поле в клетку' },
  { type: 'answer', label: 'Выбор ответа', hint: 'Вопрос с вариантами' },
  { type: 'image', label: 'Картинка', hint: 'Иллюстрация' },
  { type: 'text-image', label: 'Текст + картинка', hint: 'Текст рядом с изображением' },
]

export function createDemoWorksheet(topic = 'Закрепление материала'): WorksheetDraft {
  const title = topic || 'Закрепление материала'
  return {
    subject: 'Русский язык',
    grade: '6',
    taskCount: '4',
    topic: title,
    wishes: '',
    title,
    intro:
      'Сегодня мы закрепим знания по суффиксам «е» и «и». Узнаем, какие есть слова-исключения и ещё много разных ништяков',
    blocks: [
      {
        id: 'b1',
        type: 'open',
        title: 'Задание 1',
        body: 'В коробке было 3/4 кг конфет. За день съели 2/3 этого количества. Сколько килограммов конфет съели?',
        answer: '1/2 кг',
        difficulty: 1,
      },
      {
        id: 'b2',
        type: 'open',
        title: 'Задание 2',
        body: 'Как называется высказывание одного человека, обращённое к другим людям или самому себе?',
        answer: 'Монолог',
        difficulty: 1,
      },
      {
        id: 'b3',
        type: 'answer',
        title: 'Задание 3',
        body: 'Выбери слово, в котором на месте пропуска пишется «И»',
        options: ['завис...л', 'увид...л', 'пробле...л', 'кашевар...л'],
        answer: 'увид...л',
        difficulty: 2,
      },
      {
        id: 'b4',
        type: 'answer',
        title: 'Задание 4',
        body: 'Выбери слово, в котором на месте пропуска пишется «А»',
        options: ['скл...ниться', 'оз...рить', 'возр...ст', 'заг...релый'],
        answer: 'возр...ст',
        difficulty: 2,
      },
    ],
  }
}
