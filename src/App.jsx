import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import LiuYaoHome from './pages/liuyao/LiuYaoHome.jsx';
import HexagramLibrary from './pages/liuyao/HexagramLibrary.jsx';
import HexagramDetail from './pages/liuyao/HexagramDetail.jsx';
import CoinCast from './pages/liuyao/CoinCast.jsx';
import ReadingResult from './pages/liuyao/ReadingResult.jsx';
import BaZiHome from './pages/bazi/BaZiHome.jsx';
import InputBirthData from './pages/bazi/InputBirthData.jsx';
import BaZiChart from './pages/bazi/BaZiChart.jsx';
import DaLiuRenHome from './pages/daliuren/DaLiuRenHome.jsx';
import ThreePans from './pages/daliuren/ThreePans.jsx';
import QiMenHome from './pages/qimen/QiMenHome.jsx';
import PalaceGrid from './pages/qimen/PalaceGrid.jsx';
import ZiWeiHome from './pages/ziwei/ZiWeiHome.jsx';
import ZiWeiChart from './pages/ziwei/ZiWeiChart.jsx';
import ReadingHistory from './pages/ReadingHistory.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <Layout>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
}
