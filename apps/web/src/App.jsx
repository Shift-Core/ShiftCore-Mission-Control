import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './Pages/Login'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/mission-control"
        element={
          <div className="p-10">
            Mission Control
          </div>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  )
}

export default App