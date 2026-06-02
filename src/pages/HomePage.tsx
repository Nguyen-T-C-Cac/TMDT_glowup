import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { HeroSection } from '../components/home/HeroSection';
import { PopularServices } from '../components/home/PopularServices';
import { TopExperts } from '../components/home/TopExperts';
import { PremiumBanner } from '../components/home/PremiumBanner';
import { Footer } from '../components/layout/Footer';
import './HomePage.css';

const pageMap: Record<string, string> = {
  'home': '/',
  'provider': '/provider',
  'services': '/services',
  'rewards': '/rewards',
  'provider-profile': '/provider-profile',
  'provider-dashboard': '/provider-dashboard',
  'customer-settings': '/customer/account-settings',
  'login': '/auth/login',
};

export const HomePage: React.FC = () => {
  const nav = useNavigate();
  const onNavigate = (page: string, data?: any) => {
    const path = pageMap[page] || '/';
    nav(path, { state: data });
  };

  return (
    <div className="home-page">
      <Header onNavigate={onNavigate} />
      <main className="home-page__main">
        <HeroSection onNavigate={onNavigate} />
        <PopularServices />
        <TopExperts onNavigate={onNavigate} />
        <PremiumBanner />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
