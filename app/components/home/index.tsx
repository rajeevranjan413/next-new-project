
'use client';

import { useHome } from '../../context/HomeContext';
import Header from '../Layout/Header';
import CardToday from './CardTodaySection';
import FAQSection from './FAQSection';
import FreeTopUp from './FreeTopupSection';
import HeroSection from './HeroSection';
import HowItWorks from './HowItWorksSection';
import ImpactSection from './ImpactSection';
import JoinUsSection from './JoinUsSection';
import ReceivedPrivileges from './ReceivedPrivileges';
import SpendControlSection from './SpendControlSection';
import TrustAndReferral from './TrustAndReferralSection';



const HomePage = () => {
  // const { homeData, addFeaturedItem } = useHome();

  return (
    <>
     <HeroSection />
     <HowItWorks />
     <TrustAndReferral/>
     <ImpactSection/>
     <CardToday/>
     <FreeTopUp/>
     <SpendControlSection/>
     <ReceivedPrivileges/>
     <FAQSection/>
     <JoinUsSection/>
    </>
  );
};

export default HomePage;