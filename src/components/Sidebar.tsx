import logoSign from '@/assets/logo-sign.svg'
import logoName from '@/assets/logo-name.svg'
import helperOrb from '@/assets/helper-orb.png'
import avatar from '@/assets/avatar.png'
import './Sidebar.css'

const PREP = [
  { id: 'desk', label: 'Рабочий стол', active: true },
  { id: 'ai', label: 'ИИ-помощник', orb: true },
  { id: 'lib', label: 'Библиотека заданий', plus: true },
]

const CONDUCT = [
  { id: 'schedule', label: 'Расписание' },
  { id: 'quiz', label: 'Викторины', external: true },
]

const REFLECT = [
  { id: 'analysis', label: 'Анализ уроков', plus: true },
  { id: 'results', label: 'Результаты учеников' },
  { id: 'stats', label: 'Статистика' },
  { id: 'ratings', label: 'Рейтинги' },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand">
          <img src={logoSign} alt="" className="brand-sign" width={32} height={32} />
          <img src={logoName} alt="Ассистент Преподавателя" className="brand-name" height={20} />
        </div>
        <button className="collapse-btn" aria-label="Свернуть меню" type="button">
          ‹
        </button>
      </div>

      <nav className="sidebar-nav">
        <Section title="Подготовка к уроку" items={PREP} />
        <Section title="Проведение урока" items={CONDUCT} />
        <Section title="Рефлексия" items={REFLECT} />
      </nav>

      <div className="sidebar-bottom">
        <button className="nav-item tools" type="button">
          <span className="nav-ico">◈</span>
          <span>Инструменты</span>
          <span className="beta">beta</span>
        </button>

        <div className="tariff">
          <div className="tariff-row">
            <span>100 из 240 минут</span>
            <div className="bar">
              <i style={{ width: '42%' }} />
            </div>
          </div>
          <div className="tariff-row">
            <span>5 из 10 генераций</span>
            <div className="bar">
              <i style={{ width: '50%' }} />
            </div>
          </div>
        </div>

        <button className="profile" type="button">
          <img src={avatar} alt="" width={40} height={40} />
          <div>
            <strong>Павел Ларичев</strong>
            <span>Преподаватель</span>
          </div>
        </button>
      </div>
    </aside>
  )
}

function Section({
  title,
  items,
}: {
  title: string
  items: { id: string; label: string; active?: boolean; orb?: boolean; plus?: boolean; external?: boolean }[]
}) {
  return (
    <div className="nav-section">
      <div className="nav-section-title">{title}</div>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-item ${item.active ? 'active' : ''}`}
        >
          {item.orb ? (
            <img src={helperOrb} alt="" className="nav-orb" width={20} height={20} />
          ) : (
            <span className="nav-ico">○</span>
          )}
          <span className="nav-label">{item.label}</span>
          {item.plus ? <span className="nav-plus">+</span> : null}
          {item.external ? <span className="nav-ext">↗</span> : null}
        </button>
      ))}
    </div>
  )
}
