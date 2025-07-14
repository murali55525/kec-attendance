import { useState } from 'react'
import LoginSignup from './components/LoginSignup'
import HomeScreen from './components/HomeScreen'

function App() {
  const [user, setUser] = useState(null)

  const handleLogout = () => setUser(null)

  return (
    <div className="w-full">
      {user ? (
        <HomeScreen user={user} onLogout={handleLogout} />
      ) : (
        <LoginSignup onLogin={setUser} />
      )}
    </div>
  )
}

export default App
