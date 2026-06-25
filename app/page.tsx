import { headers } from 'next/headers';
import HomePage from './components/home'
import Header from './components/Layout/Header'
import Layout from './components/Layout/Layout'
import StickyBanner from './components/Layout/StickyBanner'
import { PaginationIndicators } from './components/PaginationIndicators'
import { ConnectWalletModal } from './components/modals'
import Footer from './components/Layout/Footer'
import { CardGuide } from './components/CardGuide'
import { isInstagramBrowser } from './utils/detectInstagram'
import {VoucherPopup} from './components/modals' // <-- Import the new popup

export default async function Home() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isInstagram = isInstagramBrowser(userAgent);

  // if (!isInstagram) {
  //   return <CardGuide />;
  // }

  return (
    <>
      <PaginationIndicators totalPages={5} />
      <Layout header={<Header />} footer={<Footer />}>
        <HomePage />
      </Layout>
      <ConnectWalletModal />
      <StickyBanner />
      <VoucherPopup /> {/* <-- Add it outside the Layout so it overlays everything */}
    </>
  )
}