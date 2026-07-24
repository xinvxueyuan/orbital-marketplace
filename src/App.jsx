import { Routes, Route, useLocation } from 'react-router'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout.jsx'
import Discover from './pages/Discover.jsx'
import Browse from './pages/Browse.jsx'
import AppDetail from './pages/AppDetail.jsx'
import Subscriptions from './pages/Subscriptions.jsx'
import Updates from './pages/Updates.jsx'
import Library from './pages/Library.jsx'
import Vending from './pages/Vending.jsx'
import DocsHome from './pages/DocsHome.jsx'
import DocArticle from './pages/DocArticle.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  const location = useLocation()
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Discover />} />
          <Route path="/apps" element={<Browse />} />
          <Route path="/apps/:id" element={<AppDetail />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/library" element={<Library />} />
          <Route path="/vending" element={<Vending />} />
          <Route path="/docs" element={<DocsHome />} />
          <Route path="/docs/:slug" element={<DocArticle />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  )
}
