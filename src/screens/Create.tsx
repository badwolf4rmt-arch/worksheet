import { useMemo, useState } from 'react'
import { Button, Field, Icon, Input, Select, Textarea } from '@/components/ui'
import { BLOCK_TYPES, GRADES, SUBJECTS, TASK_COUNTS } from '@/data/worksheet'
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
}: CreateProps) {
  const [advanced, setAdvanced] = useState(false)
  const canSubmit = useMemo(() => {
    if (mode === 'manual') return Boolean(draft.subject && draft.grade && draft.topic)
    return Boolean(draft.subject && draft.grade && draft.topic)
  }, [draft, mode])

  return (
    <div className="create-page full-page">
      <div className="create-inner">
        <header className="create-header">
          <div>
            <h1>Создание рабочего листа</h1>
            <p>
              Сгенерируйте или создайте вручную рабочий лист, его можно будет редактировать и
              конвертировать в задание для выдачи ученикам
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="create-body">
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
                      onChange={(e) => onChange({ ...draft, taskCount: e.target.value })}
                    />
                  </Field>
                </div>

                <Field label="Тема рабочего листа" required>
                  <Input
                    placeholder="Например, умножение дробей"
                    value={draft.topic}
                    onChange={(e) =>
                      onChange({ ...draft, topic: e.target.value, title: e.target.value || draft.title })
                    }
                  />
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

                <button type="button" className="advanced-link" onClick={() => setAdvanced((v) => !v)}>
                  <Icon name="gear" size={16} />
                  {advanced ? 'Скрыть расширенные настройки' : 'Показать расширенные настройки'}
                </button>

                {advanced ? (
                  <div className="advanced-box">
                    <Field label="Уровень сложности">
                      <Select options={['Базовый', 'Средний', 'Повышенный']} defaultValue="Средний" />
                    </Field>
                    <Field label="Формат ответов">
                      <Select
                        options={['Смешанный', 'Только выбор ответа', 'Только открытый ответ']}
                        defaultValue="Смешанный"
                      />
                    </Field>
                  </div>
                ) : null}
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
                      onChange({ ...draft, topic: e.target.value, title: e.target.value || draft.title })
                    }
                  />
                </Field>
                <div className="manual-hint">
                  <p>
                    После создания откроется редактор: добавьте блоки текста, линий, клетки, ответов и
                    изображений.
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
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="brand" disabled={!canSubmit} onClick={onSubmit}>
            Создать
          </Button>
        </footer>
      </div>
    </div>
  )
}
