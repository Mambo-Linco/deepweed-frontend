import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Upload from './pages/Upload.jsx'
import Review from './pages/Review.jsx'
import Analyzing from './pages/Analyzing.jsx'
import Matches from './pages/Matches.jsx'
import Lookup from './pages/Lookup.jsx'
import Results from './pages/Results.jsx'
import HerbicideInfo from './pages/HerbicideInfo.jsx'
import HerbicideForm from './pages/HerbicideForm.jsx'
import Resistance from './pages/Resistance.jsx'
import Learn from './pages/Learn.jsx'
import History from './pages/History.jsx'
import Feedback from './pages/Feedback.jsx'
import { Login, Register } from './pages/Auth.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/identify/upload" replace />} />
        <Route path="identify" element={<Navigate to="/identify/upload" replace />} />
        <Route path="identify/upload" element={<Upload />} />
        <Route path="identify/review" element={<Review />} />
        <Route path="identify/analyzing" element={<Analyzing />} />
        <Route path="identify/matches" element={<Matches />} />
        <Route path="identify/lookup" element={<Lookup />} />
        <Route path="identify/results" element={<Results />} />
        <Route path="herbicides" element={<HerbicideInfo />} />
        <Route path="herbicides/new" element={<HerbicideForm />} />
        <Route path="herbicides/:id/edit" element={<HerbicideForm />} />
        <Route path="resistance" element={<Resistance />} />
        <Route path="learn" element={<Learn />} />
        <Route path="history" element={<History />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<Navigate to="/identify/upload" replace />} />
      </Route>
    </Routes>
  )
}
