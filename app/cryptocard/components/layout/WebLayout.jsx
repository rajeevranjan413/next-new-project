'use client';

import { useCryptoCard } from '../../CryptoCardContext';
import { CSS_VARS } from '../../config/theme';
import StatusBar    from '../StatusBar';
import TopHeader    from '../TopHeader';
import BottomNav    from '../BottomNav';
import Toast        from '../Toast';
import ChatFab      from '../ChatFab';
import HomeScreen   from '../screens/HomeScreen';
import CardScreen   from '../screens/CardScreen';
import ApplyScreen  from '../screens/apply';
import SafetyScreen from '../screens/SafetyScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SupportSheet      from '../sheets/SupportSheet';
import TermsSheet        from '../sheets/TermsSheet';
import PhysicalCardSheet from '../sheets/PhysicalCardSheet';
import ChatSheet         from '../sheets/ChatSheet';
import WebNav        from './WebNav';
import HeroPanel     from './HeroPanel';
import FeaturesPanel from './FeaturesPanel';
import s from '../../cryptocard.module.css';

// Mobile app — the centered phone-frame column
function CryptoCardApp() {
  const { screen, dir } = useCryptoCard();
  return (
    <div className={s.ccApp} dir={dir} style={CSS_VARS}>
      <StatusBar />
      <TopHeader />
      <div className={s.screens}>
        <HomeScreen   active={screen === 'home'}    />
        <CardScreen   active={screen === 'card'}    />
        <ApplyScreen  active={screen === 'apply'}   />
        <SafetyScreen active={screen === 'safety'}  />
        <ProfileScreen active={screen === 'profile'} />
      </div>
      <BottomNav />
      <SupportSheet />
      <TermsSheet />
      <PhysicalCardSheet />
      <ChatSheet />
      <Toast />
    </div>
  );
}

// Full desktop layout: hero | phone | features
export default function WebLayout() {
  const { dir } = useCryptoCard();
  return (
    <div className={s.webPage} dir={dir}>
      <div className={s.bgBlob1} />
      <div className={s.bgBlob2} />
      <div className={s.bgBlob3} />
      <div className={s.bgGrid} />
      <WebNav />
      <div className={s.webMain}>
        <div className={s.leftCol}><HeroPanel /></div>
        <div className={s.centerCol}>
          <div className={s.appContainer}><CryptoCardApp /></div>
        </div>
        <div className={s.rightCol}><FeaturesPanel /></div>
      </div>
      <ChatFab />
    </div>
  );
}
