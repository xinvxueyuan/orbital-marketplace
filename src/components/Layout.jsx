import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

export default function Layout({ children }) {
  return (
    <div className="grain relative flex min-h-screen flex-col">
      <Navbar />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
    </div>
  )
}
