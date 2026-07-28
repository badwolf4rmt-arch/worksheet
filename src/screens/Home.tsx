import helperOrb from '@/assets/helper-orb.png'
import cardTask from '@/assets/card-create-task.png'
import cardWorksheet from '@/assets/card-worksheet.png'
import cardTest from '@/assets/card-test.png'
import cardPlan from '@/assets/card-plan.png'
import cardText from '@/assets/card-text.png'
import emptySchedule from '@/assets/empty-schedule.png'
import quiz1 from '@/assets/quiz-thumb-1.png'
import quiz2 from '@/assets/quiz-thumb-2.png'
import arrowUpRight from '@/assets/arrow-up-right.svg'
import arrowRight from '@/assets/arrow-right.svg'
import { Button } from '@/components/ui'
import './Home.css'

const TABS = [
  'Создать вопросы',
  'Подготовить текст',
  'Спланировать занятия',
  'Написать письмо',
  'Посоветоваться',
]

const PREP_CARDS = [
  { title: 'Создать задание с помощью ИИ или вручную', img: cardTask },
  { title: 'Подготовить рабочий лист', img: cardWorksheet, isNew: true, action: 'worksheet' as const },
  { title: 'Создать тест', img: cardTest },
  { title: 'Написать план урока', img: cardPlan },
  { title: 'Подготовить текст', img: cardText },
]

const QUIZZES = [
  { title: 'Уроки со всего света', count: '10 вопросов', img: quiz1 },
  { title: 'Физика вокруг нас: проверь свои знания (автор Семенова С.Н.)', count: '9 вопросов', img: quiz2 },
  { title: 'Атомный ледокольный флот России', count: '8 вопросов', img: quiz1 },
]

interface HomeProps {
  onCreateWorksheet: () => void
}

export function Home({ onCreateWorksheet }: HomeProps) {
  return (
    <div className="home page-pad">
      <section className="hero">
        <div className="hero-title">
          <img src={helperOrb} alt="" width={32} height={32} />
          <h1>Чем вам помочь</h1>
        </div>

        <div className="tabs">
          {TABS.map((tab, i) => (
            <button key={tab} type="button" className={`tab ${i === 0 ? 'active' : ''}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="prompt">
          <textarea
            placeholder="Расскажите, по какой теме нужны вопросы. Например: «Русский литературный авангард»"
            rows={3}
          />
          <div className="prompt-bar">
            <button type="button" className="chip-select">
              Тип вопросов <span>▾</span>
            </button>
            <button type="button" className="chip-select">
              Количество вопросов <span>▾</span>
            </button>
            <button type="button" className="send" aria-label="Отправить">
              <img src={arrowRight} alt="" width={20} height={20} />
            </button>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <h2>Для подготовки к уроку</h2>
          <p>Создавайте задания, тесты или объяснение теории</p>
        </div>
        <div className="prep-cards">
          {PREP_CARDS.map((card) => (
            <button
              key={card.title}
              type="button"
              className="prep-card"
              onClick={() => card.action === 'worksheet' && onCreateWorksheet()}
            >
              <div className="prep-img-wrap">
                {card.isNew ? <span className="new-badge">NEW</span> : null}
                <img src={card.img} alt="" />
              </div>
              <span>{card.title}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <h2>Для проведения уроков</h2>
          <p>Создавайте викторины и проводите занятия онлайн</p>
        </div>
        <div className="conduct-grid">
          <div className="quiz-widget">
            <div className="widget-head">
              <h3>Провести викторину</h3>
              <button type="button" className="link-btn">
                Все викторины
              </button>
            </div>
            <div className="quiz-list">
              {QUIZZES.map((q) => (
                <div key={q.title} className="quiz-row">
                  <div className="quiz-row-main">
                    <img src={q.img} alt="" />
                    <div>
                      <strong>{q.title}</strong>
                      <span>{q.count}</span>
                    </div>
                  </div>
                  <button type="button" className="quiz-ext" aria-label="Открыть">
                    <img src={arrowUpRight} alt="" width={20} height={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="schedule-empty">
            <img src={emptySchedule} alt="" width={120} height={120} />
            <p>В расписании пока пусто. Планируйте онлайн-занятия</p>
            <Button variant="brand">Запланировать</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
