import AppRouter from './router'
import { UserProfileProvider } from './contexts/UserProfileContext'
import { ToastProvider } from './components/common/Toast'
import './App.css'

export default function App() {
  return (
    <ToastProvider>
      <UserProfileProvider>
        <AppRouter />
      </UserProfileProvider>
    </ToastProvider>
  )
}