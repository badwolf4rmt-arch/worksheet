import { useEffect, useMemo, useState } from 'react'
import iconGear from '@/assets/create/gear.svg'
import iconSparkle from '@/assets/create/sparkle.svg'
import iconDrag from '@/assets/create/drag.svg'
import iconClose from '@/assets/create/close.svg'
import iconClear from '@/assets/create/clear.svg'
import { Button, Field, FigmaIcon, Input, Select, Textarea } from '@/components/ui'
import {
  BLOCK_TYPES,
  DIFFICULTY_OPTIONS,
  GRADES,
  PLAN_TASK_TYPES,
  SUBJECTS,
  TASK_COUNTS,
  createPlan,
} from '@/data/worksheet'
import type { WorksheetDraft } from '@/data/worksheet'
import './Create.css'

interface CreateProps {
  mode: 'generate' | 'manual'
  draft: WorksheetDraft
  onChange: (draft: WorksheetDraft) => void
  onModeChange: (mode: 'generate' | 'manual') => void
  onClose: () => void
  onSubmit: () => void
  advancedOpen?: boolean
}

export function Create({
  mode,
  draft,
  onChange,
  onModeChange,
  onClose,
  onSubmit,
  advancedOpen = false,
}: CreateProps) {
  const [advanced, setAdvanced] = useState(advancedOpen)

  useEffect(() => {
    setAdvanced(advancedOpen)
  }, [advancedOpen])

  const canSubmit = useMemo(
    () => Boolean(draft.subject && draft.grade && draft.topic.trim()),
    [draft],
  )

  const syncTaskCount = (count: string) => {
    const n = Number(count) || 6
    onChange({
      ...draft,
      taskCount: count,
      plan: createPlan(n, draft.plan.map((p) => p.type)),
    })
  }

  const updatePlan = (index: number, patch: Partial<(typeof draft.plan)[number]>) => {
    onChange({
      ...draft,
      plan: draft.plan.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    })
  }

  return (
    <div className="create-page">
      <button type="button" className="create-close" onClick={onClose} aria-label="Закрыть">
        <FigmaIcon src={iconClose} size={20} />
      </button>

      <div className="create-inner">
        <header className="create-header">
          <h1>Создание рабочего листа</h1>
          <p>
            Сгенерируйте или создайте вручную рабочий лист, его можно будет редактировать и
            конвертировать в задание для выдачи ученикам
          </p>
        </header>

        <div className="create-shell">
          <aside className="create-sidemenu">
            <button
              type="button"
              className={mode === 'generate' ? 'active' : ''}
              onClick={() => onModeChange('generate')}
            >
              Сгенерировать
            </button>
            <button
              type="button"
              className={mode === 'manual' ? 'active' : ''}
              onClick={() => onModeChange('manual')}
            >
              Создать вручную
            </button>
          </aside>

          <div className="create-form">
            {mode === 'generate' ? (
              <>
                <div className="create-main">
                  <div className="row-3">
                    <Field label="Предмет" required>
                      <Select
                        options={SUBJECTS}
                        placeholder="Выберите предмет"
                        value={draft.subject}
                        onChange={(e) => onChange({ ...draft, subject: e.target.value })}
                      />
                    </Field>
                    <Field label="Параллель" required>
                      <Select
                        options={GRADES}
                        placeholder="Выберите параллель"
                        value={draft.grade}
                        onChange={(e) => onChange({ ...draft, grade: e.target.value })}
                      />
                    </Field>
                    <Field label="Количество заданий">
                      <Select
                        options={TASK_COUNTS}
                        value={draft.taskCount}
                        onChange={(e) => syncTaskCount(e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field label="Тема рабочего листа" required>
                    <div className="input-with-clear">
                      <Input
                        placeholder="Например, умножение дробей"
                        value={draft.topic}
                        onChange={(e) =>
                          onChange({
                            ...draft,
                            topic: e.target.value,
                            title: e.target.value || draft.title,
                          })
                        }
                      />
                      {draft.topic ? (
                        <button
                          type="button"
                          className="clear-btn"
                          aria-label="Очистить"
                          onClick={() => onChange({ ...draft, topic: '', title: '' })}
                        >
                          <FigmaIcon src={iconClear} size={20} />
                        </button>
                      ) : null}
                    </div>
                  </Field>

                  <Field label="Пожелания">
                    <Textarea
                      placeholder="Особенности группы, акценты, ограничение по времени..."
                      value={draft.wishes}
                      maxLength={500}
                      counter={`${draft.wishes.length}/500`}
                      onChange={(e) => onChange({ ...draft, wishes: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="create-advanced-wrap">
                  <button
                    type="button"
                    className="advanced-link"
                    onClick={() => setAdvanced((v) => !v)}
                  >
                    <FigmaIcon src={iconGear} size={20} />
                    {advanced ? 'Скрыть расширенные настройки' : 'Показать расширенные настройки'}
                  </button>

                  {advanced ? (
                    <div className="advanced-settings">
                      <div className="plan-block">
                        <div className="plan-header">
                          <h3>Порядок заданий</h3>
                          <button
                            type="button"
                            className="gen-plan"
                            onClick={() =>
                              onChange({
                                ...draft,
                                plan: createPlan(Number(draft.taskCount) || 6),
                              })
                            }
                          >
                            <FigmaIcon src={iconSparkle} size={20} />
                            Сгенерировать план
                          </button>
                        </div>

                        <div className="plan-rows">
                          {draft.plan.map((row, index) => (
                            <div key={row.id} className="plan-row">
                              <span className="plan-index">{index + 1}.</span>
                              <Select
                                className="plan-type"
                                options={PLAN_TASK_TYPES}
                                value={row.type}
                                onChange={(e) => updatePlan(index, { type: e.target.value })}
                              />
                              <Input
                                className="plan-hint"
                                placeholder="Например, какой-то текст"
                                value={row.hint}
                                onChange={(e) => updatePlan(index, { hint: e.target.value })}
                              />
                              <span className="drag-handle" aria-hidden>
                                <FigmaIcon src={iconDrag} size={20} />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Field label="Сложность" className="difficulty-field">
                        <Select
                          options={DIFFICULTY_OPTIONS}
                          value={draft.difficulty}
                          onChange={(e) => onChange({ ...draft, difficulty: e.target.value })}
                        />
                      </Field>

                      <label className="switch-row">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={draft.showDifficulty}
                          className={`switch ${draft.showDifficulty ? 'on' : ''}`}
                          onClick={() =>
                            onChange({ ...draft, showDifficulty: !draft.showDifficulty })
                          }
                        >
                          <span className="knob" />
                        </button>
                        <span>Показывать сложность</span>
                      </label>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <div className="row-2">
                  <Field label="Предмет" required>
                    <Select
                      options={SUBJECTS}
                      placeholder="Выберите предмет"
                      value={draft.subject}
                      onChange={(e) => onChange({ ...draft, subject: e.target.value })}
                    />
                  </Field>
                  <Field label="Параллель" required>
                    <Select
                      options={GRADES}
                      placeholder="Выберите параллель"
                      value={draft.grade}
                      onChange={(e) => onChange({ ...draft, grade: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Название рабочего листа" required>
                  <Input
                    placeholder="Например, умножение дробей"
                    value={draft.topic}
                    onChange={(e) =>
                      onChange({
                        ...draft,
                        topic: e.target.value,
                        title: e.target.value || draft.title,
                      })
                    }
                  />
                </Field>
                <div className="manual-hint">
                  <p>
                    После создания откроется редактор: добавьте блоки текста, линий, клетки, ответов
                    и изображений.
                  </p>
                  <div className="block-preview-grid">
                    {BLOCK_TYPES.map((b) => (
                      <div key={b.type} className="block-preview">
                        <strong>{b.label}</strong>
                        <span>{b.hint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <footer className="create-footer">
          <Button variant="secondary" size="lg" className="footer-btn" onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant="brand"
            size="lg"
            className="footer-btn"
            disabled={!canSubmit}
            onClick={onSubmit}
          >
            Создать
          </Button>
        </footer>
      </div>
    </div>
  )
}
