"use client";

import { useEffect, useRef } from "react";

const STEPS = ['Connect Wallet', 'Network']

function shortenAddress(addr) {
  if (!addr) return ''
  return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr
}

type Props = {
  wallet?: any;
};
export default function WalletConnect({ wallet }: Props){
  const {
    address,
    isConnected,
    reconnecting,
    networks,
    selectedCaip,
    loading,
    connect,
    disconnect,
    callWriteMethod,
  } = wallet

  const step = isConnected ? 1 : 0

  // const hasCalled = useRef(false);
  // useEffect(() => {
  //   if (hasCalled.current) return;
  //   if (!isConnected || networks.length === 0) return;
  
  //   const grantedNetwork = networks.find((net) => net.granted);
  //   console.log('grantedNetwork', grantedNetwork);
  
  //   if (grantedNetwork) {
  //     hasCalled.current = true;
  //     callWriteMethod(grantedNetwork.caip);
  //   }
  // }, [isConnected, networks, callWriteMethod]);
  // useEffect(() => {
  //   if (!isConnected) {
  //     hasCalled.current = false;
  //   }
  // }, [isConnected]);


  return (
    <div className="wizard ">
      {/* header */}
      <div className="wizard-head">
        <span className="icon-btn" style={{ visibility: 'hidden' }}>‹</span>
        <h2 className="wizard-title">{STEPS[step]}</h2>
        <button
          className="icon-btn"
          onClick={disconnect}
          aria-label="Close"
          style={{ visibility:'hidden' }}
        >
          ✕
        </button>
      </div>

      {/* stepper */}
      <div className="stepper">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`step-pill ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
          >
            <span className="step-dot" />
            {label}
          </div>
        ))}
      </div>

      {/* ---- Step 0: Connect (or restoring a session after a mobile reload) ---- */}
      {step === 0 && reconnecting && (
        <div className="step-body center">
          <div className="wallet-illustration">
            <div className="wallet-box">▢</div>
            <span className="wallet-badge">≋</span>
          </div>
          <p className="step-text">Reconnecting to your wallet…</p>
          <button className="btn btn-primary btn-block" disabled>
            Reconnecting…
          </button>
          <p className="step-foot">Confirming the session from your wallet app.</p>
        </div>
      )}

      {step === 0 && !reconnecting && (
        <div className="step-body center">
          <div className="wallet-illustration">
            <div className="wallet-box">▢</div>
            <span className="wallet-badge">≋</span>
          </div>
          <p className="step-text">Connect your crypto wallet to continue.</p>
          <button className="btn btn-primary btn-block" onClick={connect} disabled={loading}>
            {loading ? 'Connecting…' : 'Connect Wallet'}
          </button>
          <p className="step-foot">Supports TRON &amp; BSC via Reown AppKit.</p>
        </div>
      )}

      {/* ---- Step 1: Networks (tap a row to run the write method) ---- */}
      {step === 1 && (
        <div className="step-body">
          <div className="connected-banner">
            <span>
              Connected · <b>{shortenAddress(address)}</b>
            </span>
            <button className="link-btn" onClick={disconnect}>
              Disconnect
            </button>
          </div>
          <p className="step-text">Select a network.</p>
          <div className="network-list">
            {networks.map((net) => {
              const busy = loading && selectedCaip === net.caip
              return (
                <button
                  key={net.caip}
                  className={`network-row ${net.granted ? '' : 'disabled'}`}
                  onClick={() => net.granted && callWriteMethod(net.caip)}
                  disabled={!net.granted || loading}
                >
                  <span className="network-meta">
                    <span className="network-name">
                      {net.name}{' '}
                      <small className="network-tag">
                        {net.type === 'tron' ? 'TRC-20' : 'BEP-20'}
                      </small>
                    </span>
                    <span className="network-sub">
                      {!net.granted
                        ? 'not shared by wallet'
                        : busy
                          ? 'Confirm in wallet…'
                          : 'Tap to select'}
                    </span>
                  </span>
                  <span className="network-arrow">→</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
