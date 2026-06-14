import Header from './Header.jsx';
import Footer from './Footer.jsx';
import BottomNav from './BottomNav.jsx';
import PwaInstallPrompt from './PwaInstallPrompt.jsx';
import styles from './Layout.module.css';

export default function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
      <PwaInstallPrompt />
      <BottomNav />
    </div>
  );
}
