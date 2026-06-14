'use client';

import React from 'react';
import { Modal } from 'antd';
import { useWalletModal } from '../../context/WalletModalContext';

const ConnectWalletModal = () => {
  const { isVisible, closeModal } = useWalletModal();

  const wallets = [
    { name: 'TronLink', desc: 'Scan with mobile app', icon: '/icons/tronlink.png' },
    { name: 'WalletConnect', desc: 'Scan with any TRON wallet', icon: '/icons/walletconnect.png' },
    { name: 'Trust Wallet', desc: 'Scan with WalletConnect', icon: '/icons/trustwallet.png' },
    { name: 'imToken', desc: 'Scan with mobile app', icon: '/icons/imtoken.png' },
    { name: 'OKX Wallet', desc: 'Scan with mobile app', icon: '/icons/okx.png' },
    { name: 'SafePal', desc: 'Scan QR with WalletConnect', icon: '/icons/safepal.png' },
    { name: 'Ledger', desc: 'USB connection', icon: '/icons/ledger.png' },
  ];

  return (
    <Modal
      open={isVisible}
      onCancel={closeModal}
      footer={null}
      centered
      width={700}
      className="wallet-modal"
    >
      <div className="text-center font-sans">
        {/* Header */}
        <h2 className="text-2xl font-bold text-[#1a1c3d] mb-1">Connect Wallet</h2>
        <p className="text-[#a5b4cc] text-sm mb-8 font-medium">
          Tron • Choose your preferred wallet
        </p>

        {/* Wallet Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {wallets.map((wallet, index) => (
            <button
              key={index}
              className="flex flex-col items-center p-4 border border-[#f0f2f5] rounded-[24px] hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
            >
              {/* Gradient Icon Container */}
              <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-[#627eea] to-[#8c52ff] flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
                <img 
                  src={wallet.icon} 
                  alt={wallet.name} 
                  className="w-8 h-8 object-contain"
                />
              </div>
              
              <h4 className="text-[#1a1c3d] text-sm font-bold mb-1">{wallet.name}</h4>
              <p className="text-[#a5b4cc] text-[10px] leading-tight">
                {wallet.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Footer Text */}
        <p className="text-[#a5b4cc] text-xs font-medium">
          By connecting, you agree to the <span className="text-blue-600 hover:underline cursor-pointer">Terms of Service</span>
        </p>
      </div>

      {/* Global CSS to override Ant Modal defaults */}
      <style>{`
        .wallet-modal .ant-modal-content {
          border-radius: 40px !important;
          overflow: hidden;
        }
        .wallet-modal .ant-modal-close {
          top: 24px;
          right: 24px;
          color: #a5b4cc;
        }
      `}</style>
    </Modal>
  );
};

export default ConnectWalletModal;
