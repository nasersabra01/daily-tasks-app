const API_URL = import.meta.env.VITE_API_URL;
import { useState, useEffect } from 'react'
import './App.css'

const App = () => {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)


  useEffect(() => {
    fetch(`${API_URL}/api/tasks`)
      .then(res => {
        if (!res.ok) {
          throw new Error('فشل جلب المهام')
        }
        return res.json()
      })
      .then(data => {
        setTasks(data)
      })
      .catch(err => {
        console.error('Error:', err)
      })
  }, [])

  const completedTasks = tasks.filter(task => task.completed).length
  const unCompletedTasks = tasks.length - completedTasks
  const progress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0
  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed
    if (filter === 'uncompleted') return !task.completed
    return true
  })

  const handleAddTask = async (event) => {
    event.preventDefault()

    const text = newTask.trim()
    if (!text || isSaving) return

    setError('')
    setIsSaving(true)

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.msg || 'فشل إضافة المهمة')
      }

      // نضيف المهمة التي أعادتها قاعدة البيانات
      setTasks(currentTasks => [...currentTasks, data])
      setNewTask('')
    } catch (err) {
      console.error('Error adding task:', err)
      setError(err.message || 'تعذر الاتصال بالخادم')
    } finally {
      setIsSaving(false)
    }
  }


const handleToggleTask = async (id) => {
  const task = tasks.find(
    task => (task._id || task.id) === id
  )

  if (!task) return

  try {
    const response = await fetch(
      `${API_URL}/api/tasks/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.msg || 'فشل تحديث المهمة')
    }

    setTasks(currentTasks =>
      currentTasks.map(item =>
        (item._id || item.id) === id ? data : item
      )
    )
  } catch (err) {
    console.error('Error updating task:', err)
    alert(err.message || 'تعذر الاتصال بالخادم')
  }
}



const handleDeleteTask = async (id) => {
  try {
    const response = await fetch(
      `${API_URL}/api/tasks/${id}`,
      {
        method: 'DELETE',
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.msg || 'فشل حذف المهمة')
    }

    setTasks(currentTasks =>
      currentTasks.filter(
        task => (task._id || task.id) !== id
      )
    )
  } catch (err) {
    console.error('Error deleting task:', err)
    alert(err.message || 'تعذر الاتصال بالخادم')
  }
}

  return (
    <div className="app">
      <header className="header">
        <div className="header-copy">
          <span className="eyebrow">مساحة يومك</span>
          <h1>إنجازي اليومي</h1>
          <p>رتّب أولوياتك، واحتفل بكل خطوة تنجزها.</p>
        </div>
        <div className="header-mark" aria-hidden="true">إ</div>
      </header>

      <main className="dashboard">
        <section className="summary">
          <div className="summary-heading">
            <div>
              <span className="eyebrow">نظرة سريعة</span>
              <h2>تقدّمك اليوم</h2>
            </div>
            <span className="progress-value">{progress}%</span>
          </div>
          <div className="progress-track" role="progressbar" aria-label="نسبة إنجاز المهام" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p>{tasks.length ? `أنجزت ${completedTasks} من ${tasks.length} مهام اليوم` : 'أضف مهمتك الأولى وابدأ يومك بخطوة واضحة.'}</p>
        </section>

        <section className="tasks">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ابدأ الآن</span>
              <h2>أضف مهمة جديدة</h2>
            </div>
          </div>
          <form onSubmit={handleAddTask}>
            <input
              value={newTask}
              onChange={event => setNewTask(event.target.value)}
              type="text"
              maxLength={120}
              aria-label="عنوان المهمة الجديدة"
              placeholder="مثال: قراءة 20 صفحة"
            />
            <button type="submit" disabled={!newTask.trim() || isSaving}>
              {isSaving ? 'جارٍ الحفظ...' : 'إضافة المهمة'}
              {!isSaving && <span aria-hidden="true">+</span>}
            </button>
          </form>
          {error && <p role="alert">{error}</p>}
          <div className="stats" aria-label="ملخص المهام">
            <div className="stat stat-total"><span>إجمالي المهام</span><strong>{tasks.length}</strong></div>
            <div className="stat stat-done"><span>مكتملة</span><strong>{completedTasks}</strong></div>
            <div className="stat stat-open"><span>قيد الإنجاز</span><strong>{unCompletedTasks}</strong></div>
          </div>
        </section>

        <section className="task-list-section">
          <div className="list-heading">
            <div>
              <span className="eyebrow">خطتك</span>
              <h2>قائمة المهام</h2>
            </div>
            <span className="task-count">{filteredTasks.length} مهام</span>
          </div>
          <div className="filters" role="group" aria-label="تصفية المهام">
            <button className={filter === 'all' ? 'active' : ''} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>الكل</button>
            <button className={filter === 'uncompleted' ? 'active' : ''} aria-pressed={filter === 'uncompleted'} onClick={() => setFilter('uncompleted')}>قيد الإنجاز</button>
            <button className={filter === 'completed' ? 'active' : ''} aria-pressed={filter === 'completed'} onClick={() => setFilter('completed')}>المكتملة</button>
          </div>
          {filteredTasks.length ? (
            <ul>
              {filteredTasks.map(task => (
                <li key={task._id} className={task.completed ? 'task-item is-completed' : 'task-item'}>
                  <button className="task-toggle" aria-label={task.completed ? `إعادة فتح المهمة: ${task.text}` : `إكمال المهمة: ${task.text}`} aria-pressed={task.completed} onClick={() => handleToggleTask(task._id)}>
                    {task.completed && <span aria-hidden="true">✓</span>}
                  </button>
                  <span className="task-text">{task.text}</span>
                  <button className="delete-button" aria-label={`حذف المهمة: ${task.text}`} onClick={() => handleDeleteTask(task._id)}>حذف</button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <span className="empty-mark" aria-hidden="true">✓</span>
              <h3>{tasks.length ? 'لا توجد مهام في هذا التصنيف' : 'قائمتك جاهزة للبداية'}</h3>
              <p>{tasks.length ? 'جرّب تصنيفاً آخر لمشاهدة مهامك.' : 'اكتب مهمة صغيرة في الأعلى، ودع الباقي يتبعها.'}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
