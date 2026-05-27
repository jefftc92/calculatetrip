import { Switch, Route, Router as WouterRouter } from 'wouter'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import AllResortsPage from './pages/AllResortsPage'
import ResortDetailPage from './pages/ResortDetailPage'
import CompareHubPage from './pages/CompareHubPage'
import ComparePage from './pages/ComparePage'
import DestinationPage from './pages/DestinationPage'
import AdultsOnlyPage from './pages/AdultsOnlyPage'
import FamilyPage from './pages/FamilyPage'
import BestValuePage from './pages/BestValuePage'
import BestBeachPage from './pages/BestBeachPage'

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
      <div>
        <h1 className="font-serif text-4xl font-bold text-ocean-950 mb-3">Page Not Found</h1>
        <p className="font-sans text-ocean-500">The page you're looking for doesn't exist.</p>
      </div>
    </div>
  )
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f7f4]">
      <Navigation />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/resorts" component={AllResortsPage} />
          <Route path="/resorts/:slug" component={ResortDetailPage} />
          <Route path="/compare" component={CompareHubPage} />
          <Route path="/compare/:pair" component={ComparePage} />
          <Route path="/destination/:country" component={DestinationPage} />
          <Route path="/best-adults-only-all-inclusive-resorts" component={AdultsOnlyPage} />
          <Route path="/best-family-all-inclusive-resorts" component={FamilyPage} />
          <Route path="/best-value-all-inclusive-resorts" component={BestValuePage} />
          <Route path="/best-beach-all-inclusive-resorts" component={BestBeachPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Router />
    </WouterRouter>
  )
}

export default App
