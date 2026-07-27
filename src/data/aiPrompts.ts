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

const PEDAGOGY = `Правила:
- Язык: русский, возраст и программа РФ для указанной параллели.
- Формулировки ясные, без воды и без markdown.
- Ответы в correct_* / gaps_answers должны быть реально верными.
- Для математики давай конкретные числа/выражения, не абстрактные «реши пример».
- Не дублируй одно и то же задание разными словами.
- Сложность: 1 — базовое узнавание, 2 — применение, 3 — анализ/перенос.`

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

Верни ТОЛЬКО JSON:
{
  "tasks": [
    { "type": "<код типа>", "expectation": "что именно отработать в этом задании (до 120 символов)" }
  ]
}

Требования:
- Ровно ${draft.taskCount} элементов в tasks.
- Чередуй типы, не ставь подряд больше двух одинаковых.
- Логика: от простого к сложному / от узнавания к применению.
- Учитывай предмет, класс, тему и пожелания учителя.
- expectation — конкретная методическая подсказка, не общая фраза.
${PEDAGOGY}`

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

Верни ТОЛЬКО JSON:
{
  "title": "краткое название листа",
  "intro": "2–3 предложения вступления для ученика (или пустая строка, если intro не нужен)",
  "tasks": [ /* ровно столько, сколько в плане / task_count */ ]
}

${PEDAGOGY}
- Строго соблюдай type из плана для каждого задания.
- Если в плане есть teacher_expectation — опирайся на него.
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

Верни ТОЛЬКО JSON:
{ "task": { ...поля одного задания с type="${taskType}" } }

${PEDAGOGY}
- Не повторяй формулировки из existing_tasks.
- Если есть expectation учителя — следуй ей.`

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
