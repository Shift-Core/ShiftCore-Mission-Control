import { Navigate, Route, Routes } from 'react-router-dom'

import Login from './Pages/Login'
import MissionControl from './Pages/MissionControl'
import ProtectedRoute from './components/ProtectedRoute'
import SignInUnavailable from './Pages/SignInUnavailable'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/sign-in-unavailable"
        element={<SignInUnavailable />}
      />

      <Route element={<ProtectedRoute />}>
      
        <Route
          path="/mission-control"
          element={<MissionControl />}
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    
    </Routes>
  )
}

export default App