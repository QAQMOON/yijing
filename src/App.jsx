import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { AccountProvider } from './context/AccountContext.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const LiuYaoHome = lazy(() => import('./pages/liuyao/LiuYaoHome.jsx'));
const HexagramLibrary = lazy(() => import('./pages/liuyao/HexagramLibrary.jsx'));
const HexagramDetail = lazy(() => import('./pages/liuyao/HexagramDetail.jsx'));
const CoinCast = lazy(() => import('./pages/liuyao/CoinCast.jsx'));
const ReadingResult = lazy(() => import('./pages/liuyao/ReadingResult.jsx'));
const BaZiHome = lazy(() => import('./pages/bazi/BaZiHome.jsx'));
const InputBirthData = lazy(() => import('./pages/bazi/InputBirthData.jsx'));
const BaZiChart = lazy(() => import('./pages/bazi/BaZiChart.jsx'));
const DaLiuRenHome = lazy(() => import('./pages/daliuren/DaLiuRenHome.jsx'));
const ThreePans = lazy(() => import('./pages/daliuren/ThreePans.jsx'));
const QiMenHome = lazy(() => import('./pages/qimen/QiMenHome.jsx'));
const PalaceGrid = lazy(() => import('./pages/qimen/PalaceGrid.jsx'));
const ZiWeiHome = lazy(() => import('./pages/ziwei/ZiWeiHome.jsx'));
const ZiWeiChart = lazy(() => import('./pages/ziwei/ZiWeiChart.jsx'));
const ReadingHistory = lazy(() => import('./pages/ReadingHistory.jsx'));
const Account = lazy(() => import('./pages/Account.jsx'));
const Pricing = lazy(() => import('./pages/Pricing.jsx'));
const Privacy = lazy(() => import('./pages/Privacy.jsx'));
const Roadmap = lazy(() => import('./pages/Roadmap.jsx'));
const Terms = lazy(() => import('./pages/Terms.jsx'));

export default function App() {
  return (
    <ErrorBoundary>
      <AccountProvider>
        <Layout>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/liuyao" element={<LiuYaoHome />} />
              <Route path="/liuyao/hexagrams" element={<HexagramLibrary />} />
              <Route path="/liuyao/hexagram/:id" element={<HexagramDetail />} />
              <Route path="/liuyao/cast" element={<CoinCast />} />
              <Route path="/liuyao/reading/:id" element={<ReadingResult />} />
              <Route path="/bazi" element={<BaZiHome />} />
              <Route path="/bazi/chart" element={<InputBirthData />} />
              <Route path="/bazi/result" element={<BaZiChart />} />
              <Route path="/ziwei" element={<ZiWeiHome />} />
              <Route path="/ziwei/chart" element={<ZiWeiChart />} />
              <Route path="/daliuren" element={<DaLiuRenHome />} />
              <Route path="/daliuren/display" element={<ThreePans />} />
              <Route path="/qimen" element={<QiMenHome />} />
              <Route path="/qimen/display" element={<PalaceGrid />} />
              <Route path="/history" element={<ReadingHistory />} />
              <Route path="/account" element={<Account />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </AccountProvider>
    </ErrorBoundary>
  );
}
