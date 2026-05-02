import { Loader } from '../../components/Loader';
import { ScrollProgress } from '../../components/ScrollProgress';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Marquee } from '../../components/Marquee';
import { Hero } from '../../components/Hero';
import { TrustBar } from '../../components/TrustBar';
import { StatsBar } from '../../components/StatsBar';
import { Categories } from '../../components/Categories';
import { ProductsSection } from '../../components/ProductsSection';
import { RecentlyViewed } from '../../components/RecentlyViewed';
import { Testimonials } from '../../components/Testimonials';
import { Brands } from '../../components/Brands';
import { Offers } from '../../components/Offers';
import { Newsletter } from '../../components/Newsletter';
import { Footer } from '../../components/Footer';
import { CartPanel } from '../../components/CartPanel';
import { Modal } from '../../components/Modal';
import { CompareBar } from '../../components/CompareBar';
import { ToastContainer } from '../../components/ToastContainer';
import { ScrollTop } from '../../components/ScrollTop';
import NewsletterPopup from '../../components/NewsletterPopup';

export const Home = () => {
  return (
    <>
      <NewsletterPopup />
      <Loader />
      <ScrollProgress />
      <Sidebar />
      <Header />
      <Marquee />
      <Hero />
      <TrustBar />
      <StatsBar />
      <Categories />
      <ProductsSection />
      <RecentlyViewed />
      <Testimonials />
      <Brands />
      <Offers />
      <Newsletter />
      <Footer />
      <CartPanel />
      <Modal />
      <CompareBar />
      <ToastContainer />
      <ScrollTop />
    </>
  );
}
