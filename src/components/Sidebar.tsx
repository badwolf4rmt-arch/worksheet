import logoSign from '@/assets/logo-sign.svg'
import logoName from '@/assets/logo-name.svg'
import helperOrb from '@/assets/helper-orb.png'
import avatar from '@/assets/avatar.png'
import iconDesk from '@/assets/sidebar/desk.svg'
import iconMaterials from '@/assets/sidebar/materials.svg'
import iconCalendar from '@/assets/sidebar/calendar.svg'
import iconQuiz from '@/assets/sidebar/quiz.svg'
import iconAnalysis from '@/assets/sidebar/analysis.svg'
import iconResults from '@/assets/sidebar/results.svg'
import iconRatings from '@/assets/sidebar/ratings.svg'
import iconTools from '@/assets/sidebar/tools.svg'
import iconPlus from '@/assets/sidebar/plus.svg'
import iconArrowUpRight from '@/assets/sidebar/arrow-up-right.svg'
import iconExpand from '@/assets/sidebar/expand.svg'
import './Sidebar.css'

type NavItem = {
  id: string
  label: string
  icon?: string
  orb?: boolean
  active?: boolean
  trail?: 'plus' | 'external'
}

const PREP: NavItem[] = [
  { id: 'desk', label: 'Рабочий стол', icon: iconDesk, active: true },
  { id: 'ai', label: 'ИИ-помощник', orb: true },
  { id: 'lib', label: 'Библиотека заданий', icon: iconMaterials, trail: 'plus' },
]

const CONDUCT: NavItem[] = [
  { id: 'schedule', label: 'Расписание', icon: iconCalendar },
  { id: 'quiz', label: 'Викторины', icon: iconQuiz, trail: 'external' },
]

const REFLECT: NavItem[] = [
  { id: 'analysis', label: 'Анализ уроков', icon: iconAnalysis, trail: 'plus' },
  { id: 'results', label: 'Результаты учеников', icon: iconResults },
  { id: 'stats', label: 'Статистика', icon: iconAnalysis },
  { id: 'ratings', label: 'Рейтинги', icon: iconRatings },
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
          <img src={iconExpand} alt="" width={24} height={24} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <Section title="Подготовка к уроку" items={PREP} />
        <Section title="Проведение урока" items={CONDUCT} />
        <Section title="Рефлексия" items={REFLECT} />
      </nav>

      <div className="sidebar-bottom">
        <div className="nav-section-spacer" />
        <button className="nav-item tools" type="button">
          <img src={iconTools} alt="" className="nav-ico-img" width={20} height={20} />
          <span className="nav-label">Инструменты</span>
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

function Section({ title, items }: { title: string; items: NavItem[] }) {
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
          ) : item.icon ? (
            <img src={item.icon} alt="" className="nav-ico-img" width={20} height={20} />
          ) : null}
          <span className="nav-label">{item.label}</span>
          {item.trail === 'plus' ? (
            <img src={iconPlus} alt="" className="nav-trail" width={20} height={20} />
          ) : null}
          {item.trail === 'external' ? (
            <img src={iconArrowUpRight} alt="" className="nav-trail" width={20} height={20} />
          ) : null}
        </button>
      ))}
    </div>
  )
}
