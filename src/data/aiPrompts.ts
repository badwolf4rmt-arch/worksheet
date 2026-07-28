import type { DifficultyMode, TaskType, WorksheetBlock, WorksheetDraft } from './worksheet'
import { PLAN_TASK_TYPES, labelForType } from './worksheet'

const TASK_TYPES_LIST = PLAN_TASK_TYPES.map((t) => `${t.type} — ${t.label} (${t.hint})`).join('\n')

const TASK_JSON_FIELDS = `Поля задания (используй только нужные для type):
{
  "type": один из: short_answer | single_choice | multiple_choice | fill_gaps | matching | grouping | ordering | extended_answer,
  "instruction": краткая инструкция ученику,
  "question": формулировка задания,
  "options": string[] — 4 варианта для single_choice / multiple_choice,
  "correct_option_index": number — индекс верного (0-based) для single_choice,
  "correct_option_indexes": number[] — индексы верных для multiple_choice,
  "correct_answers": string[] — эталонные ответы / ключ для учителя,
  "answer_lines": number — строк для ответа (short_answer: 1–2, extended_answer: 4–6),
  "gaps_text": string — текст с пропусками ___ (fill_gaps),
  "gaps_answers": string[] — ответы на пропуски по порядку,
  "left_items": string[] — левый столбец (matching),
  "right_items": string[] — правый столбец, перемешанный (matching),
  "groups": [{"title": string, "items": string[]}] — для grouping (2–3 группы),
  "order_items": string[] — элементы в ПЕРЕМЕШАННОМ порядке для ученика (ordering),
  "difficulty": 1 | 2 | 3
}`

/** Правила контента для текстовых полей внутри JSON (question, instruction, intro, options и т.д.). */
const CONTENT_RULES = `
[Язык и стиль]
- Язык — естественный, живой, без профессионального жаргона.
- Современный русский язык, дружелюбный тон, адаптация для школьников.
- Обращение к ученику всегда на «ты».
- Без орфографических и пунктуационных ошибок.
- Без канцеляризмов, архаизмов, просторечий и двусмысленностей.

[Фактология и этика]
- Строгое соответствие проверенным научным данным и российским школьным программам.
- Подчёркивай практическую ценность знаний.
- Безопасность контента: без спорных политических/религиозных оценок, без травмирующих тем.

[Общие правила оформления текста в полях]
- Не добавляй вводных/завершающих фраз от лица модели («Конечно!», «Вот ваше задание:», «Надеюсь, это поможет…», «Привет!») — результат = чистый учебный материал.
- Во внешних строках JSON (question, instruction, intro, options, gaps_text, body и т.п.) используй Markdown при необходимости: заголовки ###, маркированные и нумерованные списки, курсив.
- Не используй HTML, XML, YAML, Markdown-кодовые блоки (\`\`\`) и комментарии.
- В нужных местах используй только кавычки-ёлочки «».
- Не добавляй вступлений и заключений от лица модели.

[Математика и формулы]
- Формулы и числовые значения (целые и дробные) оформляй только в LaTeX, строго в российской нотации:
  · встроенные формулы — $...$;
  · отдельные формулы — $$...$$.
- Для масштабируемых скобок используй \\left( \\right).
- Греческие буквы в LaTeX: \\alpha, \\beta и т.д.
- Пробелы для тригонометрии: $\\sin a$, $\\cos b$.
- Аргументы функций без фигурных скобок: $\\cos 2x$.
- Российская нотация функций (например, $\\mathrm{tg}$ вместо $\\tan$).
- Производная: ^{\\prime}.
- Специальные символы и числа с градусами — только внутри $...$ / $$...$$.
- Не используй Unicode-символы, псевдографику или обычный текст вместо математических выражений.

[Методика]
- Ответы в correct_* / gaps_answers должны быть реально верными.
- Для математики давай конкретные числа/выражения, не абстрактные «реши пример».
- Не дублируй одно и то же задание разными словами.
- Сложность: 1 — базовое узнавание, 2 — применение, 3 — анализ/перенос.
`.trim()

/**
 * Правила поля expectation / userExpectation в плане
 * (пример: «Заполнить пропуски в определении квадратного уравнения»).
 */
const EXPECTATION_FIELD_RULES = `
[Формулировка поля expectation — ожидание к заданию]
Это короткая методическая установка «что сделать в задании», а не текст вопроса ученику и не название типа.

Формат:
- Одна фраза, обычно 5–12 слов (до 120 символов).
- Начинай с глагола в инфинитиве: Заполнить / Записать / Сопоставить / Решить / Вычислить / Выбрать / Объяснить / Найти…
- Дальше — конкретный объект по теме (определение, формула, коэффициенты, вид уравнения, число решений…).
- Привязывай формулировку к теме и предмету; без общих слов вроде «закрепить материал», «проверить знания».
- Не пиши номер задания, не дублируй название типа («Краткий ответ: …»), не обращайся к ученику на «ты» в этом поле.
- Не ставь точку в конце, если фраза короткая и однострочная.
- Каждое expectation в плане уникально: разные акценты темы, без повторов.

Примеры (тема «Квадратные уравнения», алгебра, 8 класс):
- fill_gaps → «Заполнить пропуски в определении квадратного уравнения»
- short_answer → «Записать общую формулу квадратного уравнения»
- matching → «Сопоставить уравнение и значения коэффициентов»
- matching → «Сопоставить квадратное уравнение с его видом»
- matching → «Сопоставить уравнение и количество решений»
- short_answer → «Решить квадратное уравнение»
`.trim()

const OUTPUT_FORMAT = `Формат ответа:
- Верни ТОЛЬКО валидный JSON-объект (без текста вокруг, без markdown-обёртки всего ответа).
- Правила языка, Markdown и LaTeX применяются к содержимому строковых полей JSON, а не к оболочке ответа.`

function difficultyHint(mode: DifficultyMode): string {
  switch (mode) {
    case 'starter':
      return 'Все задания сложности 1 (стартовый уровень).'
    case 'basic':
      return 'Все задания сложности 2 (базовый уровень).'
    case 'advanced':
      return 'Все задания сложности 3 (повышенный уровень).'
    default:
      return 'Дифференцированная сложность: от 1 к 3 по ходу листа.'
  }
}

function contextPayload(draft: WorksheetDraft) {
  return {
    subject: draft.subject,
    grade: `${draft.grade} класс`,
    topic: draft.topic,
    teacher_wishes: draft.wishes?.trim() || null,
    task_count: draft.taskCount,
    difficulty_mode: draft.difficulty,
    difficulty_guidance: difficultyHint(draft.difficulty),
    add_intro: draft.addIntro,
  }
}

function planPayload(draft: WorksheetDraft) {
  return draft.plan.map((p, i) => ({
    index: i + 1,
    type: p.taskType,
    type_label: labelForType(p.taskType),
    teacher_expectation: p.userExpectation?.trim() || null,
  }))
}

function existingTasksBrief(blocks: WorksheetBlock[]) {
  return blocks
    .filter((b) => !['page_break', 'text', 'answer_field', 'table'].includes(b.type))
    .map((b, i) => ({
      index: i + 1,
      type: b.type,
      question: b.question || b.gapsText || b.body || '',
    }))
}

export function promptsForPlan(draft: WorksheetDraft) {
  const system = `Ты — методист школьного образования. Составь план рабочего листа: последовательность типов заданий и краткие ожидания учителя к каждому.

Доступные типы:
${TASK_TYPES_LIST}

${OUTPUT_FORMAT}

Верни JSON:
{
  "tasks": [
    { "type": "<код типа>", "expectation": "что именно отработать в этом задании (до 120 символов)" }
  ]
}

Требования к плану:
- Ровно ${draft.taskCount} элементов в tasks.
- Чередуй типы, не ставь подряд больше двух одинаковых.
- Логика: от простого к сложному / от узнавания к применению.
- Учитывай предмет, класс, тему и пожелания учителя.

${EXPECTATION_FIELD_RULES}

${CONTENT_RULES}`

  const user = JSON.stringify(contextPayload(draft), null, 2)
  return { system, user }
}

export function promptsForWorksheet(
  draft: WorksheetDraft,
  mode: 'create' | 'regenerate',
) {
  const modeBlock =
    mode === 'regenerate'
      ? `Режим: ПЕРЕГЕНЕРАЦИЯ. Создай НОВЫЕ задания по тому же плану и теме.
Не копируй формулировки из previous_tasks. Сохрани типы и педагогическую цель, замени содержание.`
      : `Режим: ПЕРВИЧНАЯ ГЕНЕРАЦИЯ рабочего листа по плану.`

  const system = `Ты — опытный методист и автор школьных рабочих листов.
${modeBlock}

${TASK_JSON_FIELDS}

${OUTPUT_FORMAT}

Верни JSON:
{
  "title": "краткое название листа",
  "intro": "2–3 предложения вступления для ученика на «ты» (или пустая строка, если intro не нужен)",
  "tasks": [ /* ровно столько, сколько в плане / task_count */ ]
}

${CONTENT_RULES}

Дополнительно по структуре листа:
- Строго соблюдай type из плана для каждого задания.
- Если в плане есть teacher_expectation — это методическая установка (инфинитив: «Сопоставить…», «Решить…»). Разверни её в полноценное задание для ученика на «ты», не копируй expectation дословно в question.
- Если add_intro=false — верни intro как "".
- order_items: дай ученику перемешанный порядок; correct_answers — правильная последовательность.
- matching: right_items перемешай относительно left_items; в correct_answers укажи пары «лево → право».`

  const user = JSON.stringify(
    {
      ...contextPayload(draft),
      task_plan: planPayload(draft),
      previous_tasks: mode === 'regenerate' ? existingTasksBrief(draft.blocks) : undefined,
    },
    null,
    2,
  )

  return { system, user }
}

export function promptsForSingleTask(
  draft: WorksheetDraft,
  taskType: TaskType,
  expectation: string,
) {
  const system = `Ты — методист. Сгенерируй ОДНО школьное задание для рабочего листа.

Тип: ${taskType} (${labelForType(taskType)}).

${TASK_JSON_FIELDS}

${OUTPUT_FORMAT}

Верни JSON:
{ "task": { ...поля одного задания с type="${taskType}" } }

${CONTENT_RULES}

- Не повторяй формулировки из existing_tasks.
- Если есть teacher_expectation — это установка вида «Решить квадратное уравнение» / «Сопоставить…». Разверни её в задание на «ты», не копируй expectation дословно в question.`

  const user = JSON.stringify(
    {
      ...contextPayload(draft),
      requested_type: taskType,
      teacher_expectation: expectation.trim() || null,
      existing_tasks: existingTasksBrief(draft.blocks),
    },
    null,
    2,
  )

  return { system, user }
}
