import { useEffect, useMemo, useState, type FormEvent } from 'react'
import useSWR from 'swr'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { api } from '../lib/api'
import { useLanguage } from '../contexts/LanguageContext'
import { t } from '../i18n/translations'
import { DecisionCard } from './DecisionCard'
import { deductMockCredits } from '../lib/mockCredits'
import { CreditDisplay } from './CreditDisplay'
import { initMockCredits } from '../lib/mockCredits'
import type {
  BacktestStatusPayload,
  BacktestEquityPoint,
  BacktestTradeEvent,
  BacktestMetrics,
  DecisionRecord,
  AIModel,
} from '../types'

const timeframeOptions = ['1m', '3m', '5m', '15m', '1h', '4h', '1d']
type ControlAction = 'pause' | 'resume' | 'stop'

const toLocalInput = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export function BacktestPage() {
  const { language } = useLanguage()
  const tr = (key: string, params?: Record<string, string | number>) =>
    t(`backtestPage.${key}`, language, params)
  const titleText = tr('title')
  const subtitleText = tr('subtitle')
  const now = new Date()
  const [formState, setFormState] = useState({
    runId: '',
    symbols: 'BTCUSDT,ETHUSDT,SOLUSDT',
    timeframes: '3m,15m,4h',
    decisionTf: '3m',
    cadence: 20,
    start: toLocalInput(new Date(now.getTime() - 3 * 24 * 3600 * 1000)),
    end: toLocalInput(now),
    balance: 1000,
    fee: 5,
    slippage: 2,
    btcEthLeverage: 5,
    altcoinLeverage: 5,
    fill: 'next_open',
    prompt: 'baseline',
    promptTemplate: 'default',
    customPrompt: '',
    overridePrompt: false,
    cacheAI: true,
    replayOnly: false,
    aiModelId: '',
  })
  const [stateFilter, setStateFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedRunId, setSelectedRunId] = useState<string>()
  const [equityTf, setEquityTf] = useState('1h')
  const [showCustomPromptEditor, setShowCustomPromptEditor] = useState(false)
  const [promptTemplateContent, setPromptTemplateContent] = useState<string>('')
  const [previousCustomPrompt, setPreviousCustomPrompt] = useState<string>('')
  const [toast, setToast] = useState<{
    text: string
    tone: 'info' | 'error' | 'success'
  } | null>(null)
  const [trace, setTrace] = useState<DecisionRecord>()
  const [traceCycle, setTraceCycle] = useState('')
  const [actionLoading, setActionLoading] = useState<ControlAction | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [labelDraft, setLabelDraft] = useState('')
  
  // Initialize credits when component mounts
  useEffect(() => {
    const walletAddress = localStorage.getItem('wallet_address')
    if (walletAddress) {
      initMockCredits(walletAddress)
    }
  }, [])
  
  const quickRanges = useMemo(
    () => [
      { label: tr('quickRanges.h24'), hours: 24 },
      { label: tr('quickRanges.d3'), hours: 72 },
      { label: tr('quickRanges.d7'), hours: 24 * 7 },
    ],
    [language]
  )
  const actionLabels: Record<ControlAction, string> = {
    pause: tr('actions.pause'),
    resume: tr('actions.resume'),
    stop: tr('actions.stop'),
  }
  const stateOptions = useMemo(
    () =>
      ['running', 'paused', 'completed', 'failed', 'liquidated'].map(
        (value) => ({
          value,
          label: tr(`states.${value}`),
        })
      ),
    [language]
  )
  const stateLabels = useMemo(
    () =>
      stateOptions.reduce<Record<string, string>>((acc, option) => {
        acc[option.value] = option.label
        return acc
      }, {}),
    [stateOptions]
  )

  const { data: runsResp, mutate: refreshRuns } = useSWR(
    ['backtest-runs', stateFilter, search],
    () =>
      api.getBacktestRuns({
        state: stateFilter || undefined,
        search: search || undefined,
        limit: 200,
        offset: 0,
      }),
    { 
      refreshInterval: 8000,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )
  const runs = runsResp?.items ?? []

  useEffect(() => {
    if (!selectedRunId && runs.length > 0) {
      setSelectedRunId(runs[0].run_id)
    }
  }, [runs, selectedRunId])

  useEffect(() => {
    const current = runs.find((run) => run.run_id === selectedRunId)
    setLabelDraft(current?.label ?? '')
  }, [runs, selectedRunId])

  const selectedRun = runs.find((run) => run.run_id === selectedRunId)

  const { data: status } = useSWR<BacktestStatusPayload>(
    selectedRunId ? ['bt-status', selectedRunId] : null,
    () => api.getBacktestStatus(selectedRunId!),
    { 
      refreshInterval: 4000,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  const { data: equity } = useSWR<BacktestEquityPoint[]>(
    selectedRunId ? ['bt-equity', selectedRunId, equityTf] : null,
    () => api.getBacktestEquity(selectedRunId!, equityTf, 1000),
    { 
      refreshInterval: 6000,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  const { data: trades } = useSWR<BacktestTradeEvent[]>(
    selectedRunId ? ['bt-trades', selectedRunId] : null,
    () => api.getBacktestTrades(selectedRunId!, 200),
    { 
      refreshInterval: 8000,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  const { data: metrics } = useSWR<BacktestMetrics>(
    selectedRunId ? ['bt-metrics', selectedRunId] : null,
    () => api.getBacktestMetrics(selectedRunId!),
    { 
      refreshInterval: 12000,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 3000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )
  const { data: decisions } = useSWR<DecisionRecord[]>(
    selectedRunId ? ['bt-decisions', selectedRunId] : null,
    () => api.getBacktestDecisions(selectedRunId!, 50),
    { 
      refreshInterval: 8000,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  // Deduct credits when new cycles appear (for demo with mock credits)
  useEffect(() => {
    if (decisions && decisions.length > 0 && formState.aiModelId === 'system_default') {
      const walletAddress = localStorage.getItem('wallet_address')
      if (!walletAddress) return
      
      // Deduct 1.0 credit per new cycle (only once per cycle)
      decisions.forEach((decision) => {
        const cycleKey = `deducted_${selectedRunId}_${decision.cycle_number}`
        if (!localStorage.getItem(cycleKey) && decision.success) {
          const result = deductMockCredits(1.0)
          if (result.success) {
            localStorage.setItem(cycleKey, 'true')
            console.log(`💳 Deducted 1.0 credit for cycle ${decision.cycle_number}`)
          }
        }
      })
    }
  }, [decisions, selectedRunId, formState.aiModelId])

  const { data: promptTemplates } = useSWR<string[]>(
    'prompt-templates',
    api.getPromptTemplates
  )
  const { data: aiModels } = useSWR<AIModel[]>(
    'ai-models',
    api.getModelConfigs,
    { refreshInterval: 30000 }
  )

  const selectedModel = useMemo(
    () => aiModels?.find((model) => model.id === formState.aiModelId),
    [aiModels, formState.aiModelId]
  )

  const selectedTimeframes = useMemo(() => {
    return formState.timeframes
      .split(',')
      .map((tf) => tf.trim())
      .filter(Boolean)
  }, [formState.timeframes])

  useEffect(() => {
    if (
      selectedTimeframes.length > 0 &&
      !selectedTimeframes.includes(formState.decisionTf)
    ) {
      handleFormChange('decisionTf', selectedTimeframes[0])
    }
  }, [selectedTimeframes, formState.decisionTf])

  // Load prompt template content when template changes
  useEffect(() => {
    if (formState.promptTemplate && promptTemplates?.includes(formState.promptTemplate)) {
      api.getPromptTemplate(formState.promptTemplate)
        .then((content) => setPromptTemplateContent(content || ''))
        .catch(() => setPromptTemplateContent(''))
    } else {
      setPromptTemplateContent('')
    }
  }, [formState.promptTemplate, promptTemplates])

  const handleEditTemplate = () => {
    if (promptTemplateContent && !showCustomPromptEditor) {
      setPreviousCustomPrompt(formState.customPrompt)
      setFormState(prev => ({
        ...prev,
        customPrompt: promptTemplateContent,
        overridePrompt: true
      }))
      setShowCustomPromptEditor(true)
    }
  }

  const handleCancelEdit = () => {
    setFormState(prev => ({
      ...prev,
      customPrompt: previousCustomPrompt,
      overridePrompt: previousCustomPrompt.length > 0
    }))
    setShowCustomPromptEditor(false)
  }

  const handleSavePrompt = () => {
    setShowCustomPromptEditor(false)
  }

  useEffect(() => {
    if (formState.aiModelId || !aiModels || aiModels.length === 0) {
      return
    }
    const enabled = aiModels.find((model) => model.enabled)
    handleFormChange('aiModelId', (enabled ?? aiModels[0]).id)
  }, [aiModels, formState.aiModelId])

  const handleFormChange = (key: string, value: string | number | boolean) =>
    setFormState((prev) => ({ ...prev, [key]: value }))

  const handleStart = async (event: FormEvent) => {
    event.preventDefault()
    
    // Allow system_default without requiring it to be in aiModels list
    const isSystemDefault = formState.aiModelId === 'system_default'
    
    if (!isSystemDefault) {
      if (!selectedModel) {
        setToast({
          text: tr('toasts.selectModel'),
          tone: 'error',
        })
        return
      }
      if (!selectedModel.enabled) {
        setToast({
          text: tr('toasts.modelDisabled', { name: selectedModel.name }),
          tone: 'error',
        })
        return
      }
    }
    try {
      setIsStarting(true)
      setToast(null)
      const start = new Date(formState.start).getTime()
      const end = new Date(formState.end).getTime()
      if (!start || !end || end <= start)
        throw new Error(tr('toasts.invalidRange'))
      const payload = await api.startBacktest({
        run_id: formState.runId.trim() || undefined,
        symbols: formState.symbols
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        timeframes: formState.timeframes
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        decision_timeframe: formState.decisionTf,
        decision_cadence_nbars: Number(formState.cadence),
        start_ts: Math.floor(start / 1000),
        end_ts: Math.floor(end / 1000),
        initial_balance: Number(formState.balance),
        fee_bps: Number(formState.fee),
        slippage_bps: Number(formState.slippage),
        fill_policy: formState.fill,
        prompt_variant: formState.prompt,
        prompt_template: formState.promptTemplate || undefined,
        custom_prompt: formState.customPrompt.trim() || undefined,
        override_prompt: formState.overridePrompt,
        cache_ai: formState.cacheAI,
        replay_only: formState.replayOnly,
        ai_model_id: formState.aiModelId || undefined,
        leverage: {
          btc_eth_leverage: Number(formState.btcEthLeverage),
          altcoin_leverage: Number(formState.altcoinLeverage),
        },
      })
      setToast({ text: tr('toasts.startSuccess', { id: payload.run_id }), tone: 'success' })
      setSelectedRunId(payload.run_id)
      await refreshRuns()
    } catch (error: any) {
      setToast({
        text: error?.message ?? tr('toasts.startFailed'),
        tone: 'error',
      })
    } finally {
      setIsStarting(false)
    }
  }

  const handleControl = async (action: ControlAction) => {
    if (!selectedRunId) return
    setActionLoading(action)
    try {
      if (action === 'pause') await api.pauseBacktest(selectedRunId)
      if (action === 'resume') await api.resumeBacktest(selectedRunId)
      if (action === 'stop') await api.stopBacktest(selectedRunId)
      setToast({
        text: tr('toasts.actionSuccess', {
          action: actionLabels[action] ?? action,
          id: selectedRunId,
        }),
        tone: 'success',
      })
      await refreshRuns()
    } catch (error: any) {
      setToast({
        text: error?.message ?? tr('toasts.actionFailed'),
        tone: 'error',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleSaveLabel = async () => {
    if (!selectedRunId) return
    try {
      await api.updateBacktestLabel(selectedRunId, labelDraft)
      setToast({ text: tr('toasts.labelSaved'), tone: 'success' })
      await refreshRuns()
    } catch (error: any) {
      setToast({
        text: error?.message ?? tr('toasts.labelFailed'),
        tone: 'error',
      })
    }
  }

  const handleDeleteRun = async () => {
    if (!selectedRunId) return
    if (
      typeof window !== 'undefined' &&
      !window.confirm(tr('toasts.confirmDelete', { id: selectedRunId }))
    ) {
      return
    }
    try {
      await api.deleteBacktestRun(selectedRunId)
      setToast({ text: tr('toasts.deleteSuccess'), tone: 'success' })
      setSelectedRunId(undefined)
      await refreshRuns()
    } catch (error: any) {
      setToast({
        text: error?.message ?? tr('toasts.deleteFailed'),
        tone: 'error',
      })
    }
  }

  const handleTrace = async () => {
    if (!selectedRunId) return
    try {
      const record = await api.getBacktestTrace(
        selectedRunId,
        traceCycle ? Number(traceCycle) : undefined
      )
      setTrace(record)
    } catch (error: any) {
      setToast({
        text: error?.message ?? tr('toasts.traceFailed'),
        tone: 'error',
      })
    }
  }

  const handleExport = async () => {
    if (!selectedRunId) return
    try {
      const blob = await api.exportBacktest(selectedRunId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedRunId}_export.zip`
      link.click()
      URL.revokeObjectURL(url)
      setToast({
        text: tr('toasts.exportSuccess', { id: selectedRunId }),
        tone: 'success',
      })
    } catch (error: any) {
      setToast({
        text: error?.message ?? tr('toasts.exportFailed'),
        tone: 'error',
      })
    }
  }

  const toggleTimeframe = (tf: string) => {
    const set = new Set(selectedTimeframes)
    if (set.has(tf)) {
      if (set.size === 1) {
        return
      }
      set.delete(tf)
    } else {
      set.add(tf)
    }
    handleFormChange('timeframes', Array.from(set).join(','))
  }

  const applyQuickRange = (hours: number) => {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - hours * 3600 * 1000)
    handleFormChange('start', toLocalInput(startDate))
    handleFormChange('end', toLocalInput(endDate))
  }

  const equitySeries = useMemo(
    () =>
      equity?.map((point) => ({
        time: new Date(point.ts).toLocaleString(),
        equity: point.equity,
        pnl_pct: point.pnl_pct,
      })) ?? [],
    [equity]
  )

  const latestTrades = useMemo(
    () => (trades ? [...trades].slice(-15).reverse() : []),
    [trades]
  )

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className="p-3 text-sm rounded border"
          style={{
            background:
              toast.tone === 'error'
                ? 'rgba(246,70,93,0.1)'
                : toast.tone === 'success'
                ? 'rgba(14,203,129,0.1)'
                : 'rgba(231,129,253,0.1)',
            color:
              toast.tone === 'error'
                ? '#F6465D'
                : toast.tone === 'success'
                ? '#0ECB81'
                : '#E781FD',
            borderColor:
              toast.tone === 'error'
                ? 'rgba(246,70,93,0.3)'
                : toast.tone === 'success'
                ? 'rgba(14,203,129,0.4)'
                : 'rgba(231,129,253,0.4)',
          }}
        >
          {toast.text}
        </div>
      )}
      {/* Compact Header Section */}
      <div className="mb-4">
        <h1 className="text-xl font-bold mb-1" style={{ color: '#EAECEF' }}>
          {titleText}
        </h1>
        <p className="text-xs" style={{ color: '#848E9C' }}>
          {subtitleText}
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <form className="p-4 space-y-4 binance-card" onSubmit={handleStart} style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          borderRadius: '8px',
        }}>
          {/* Start Button - Compact */}
          <div className="flex items-center justify-between pb-3 border-b mb-3" style={{ borderColor: 'var(--panel-border)' }}>
            <h3 className="text-base font-semibold" style={{ color: '#EAECEF' }}>
              Configuration
            </h3>
            <button
              type="submit"
              disabled={isStarting || (!formState.aiModelId || (formState.aiModelId !== 'system_default' && (!selectedModel || !selectedModel.enabled)))}
              className="px-4 py-2 rounded-lg font-semibold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: 'linear-gradient(135deg, #E781FD 0%, #FF89DF 100%)',
                color: '#000',
                boxShadow: '0 2px 8px rgba(231, 129, 253, 0.4)',
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.transform = 'scale(1.02)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {isStarting ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Starting...
                </span>
              ) : (
                tr('start')
              )}
            </button>
          </div>

          {/* AI Model Selection */}
          <div className="space-y-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium" style={{ color: '#848E9C' }}>{tr('form.aiModelLabel')}</span>
              <select
                className="input text-xs py-1.5"
                style={{
                  background: '#1E2329',
                  border: '1px solid #2B3139',
                  color: '#EAECEF',
                  borderRadius: '6px',
                }}
                value={formState.aiModelId}
                onChange={(e) => handleFormChange('aiModelId', e.target.value)}
                disabled={!aiModels || aiModels.length === 0}
              >
                <option value="">{tr('form.selectAiModel')}</option>
                <option value="system_default">
                  Subscription - System Default
                </option>
                {aiModels?.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.provider})
                  </option>
                ))}
              </select>
            </label>
            {/* Credit Display - Show when using system default */}
            {formState.aiModelId === 'system_default' && (
              <div className="mt-2">
                <CreditDisplay 
                  requiredCredits={1.0}
                  onInsufficientCredits={() => {
                    setToast({
                      text: 'Insufficient credits! Please purchase credits to use System Default.',
                      tone: 'error',
                    })
                  }}
                />
              </div>
            )}
            {formState.aiModelId === 'system_default' ? (
              <div
                className="flex flex-wrap gap-3 text-[10px] px-2 py-1.5 rounded"
                style={{ 
                  color: '#848E9C',
                  background: 'rgba(14, 203, 129, 0.05)',
                  border: '1px solid rgba(14, 203, 129, 0.2)',
                }}
              >
                <span>
                  {tr('form.providerLabel')}: <span style={{ color: '#0ECB81', fontWeight: '600' }}>System Default</span>
                </span>
                <span>•</span>
                <span>
                  {tr('form.statusLabel')}: <span style={{ color: '#0ECB81', fontWeight: '600' }}>{tr('form.enabled')}</span>
                </span>
              </div>
            ) : selectedModel && (
              <div
                className="flex flex-wrap gap-3 text-[10px] px-2 py-1.5 rounded"
                style={{ 
                  color: '#848E9C',
                  background: selectedModel.enabled 
                    ? 'rgba(14, 203, 129, 0.05)' 
                    : 'rgba(246, 70, 93, 0.05)',
                  border: `1px solid ${selectedModel.enabled 
                    ? 'rgba(14, 203, 129, 0.2)' 
                    : 'rgba(246, 70, 93, 0.2)'}`,
                }}
              >
                <span>
                  {tr('form.providerLabel')}: <span style={{ color: '#EAECEF', fontWeight: '600' }}>{selectedModel.provider}</span>
                </span>
                <span>•</span>
                <span>
                  {tr('form.statusLabel')}:{' '}
                  <span style={{ color: selectedModel.enabled ? '#0ECB81' : '#F6465D', fontWeight: '600' }}>
                    {selectedModel.enabled ? tr('form.enabled') : tr('form.disabled')}
                  </span>
                </span>
              </div>
            )}
            {!selectedModel && aiModels && aiModels.length === 0 && (
              <div className="text-[10px] px-2 py-1.5 rounded" style={{ 
                color: '#F6465D',
                background: 'rgba(246, 70, 93, 0.1)',
                border: '1px solid rgba(246, 70, 93, 0.3)',
              }}>
                ⚠️ {tr('form.noModelWarning')}
              </div>
            )}
          </div>

          {/* Run Configuration */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--panel-border)' }}>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium" style={{ color: '#848E9C' }}>{tr('form.runIdLabel')}</span>
                <input
                  className="input text-xs py-1.5"
                  style={{
                    background: '#1E2329',
                    border: '1px solid #2B3139',
                    color: '#EAECEF',
                    borderRadius: '6px',
                  }}
                  value={formState.runId}
                  onChange={(e) => handleFormChange('runId', e.target.value)}
                  placeholder={tr('form.runIdPlaceholder')}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium" style={{ color: '#848E9C' }}>{tr('form.decisionTfLabel')}</span>
                <select
                  className="input text-xs py-1.5"
                  style={{
                    background: '#1E2329',
                    border: '1px solid #2B3139',
                    color: '#EAECEF',
                    borderRadius: '6px',
                  }}
                  value={formState.decisionTf}
                  onChange={(e) => handleFormChange('decisionTf', e.target.value)}
                >
                  {(selectedTimeframes.length > 0
                    ? selectedTimeframes
                    : timeframeOptions
                  ).map((tf) => (
                    <option key={tf}>{tf}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium" style={{ color: '#848E9C' }}>{tr('form.cadenceLabel')}</span>
                <input
                  type="number"
                  className="input text-xs py-1.5"
                  style={{
                    background: '#1E2329',
                    border: '1px solid #2B3139',
                    color: '#EAECEF',
                    borderRadius: '6px',
                  }}
                  min={1}
                  value={formState.cadence}
                  onChange={(e) =>
                    handleFormChange('cadence', Number(e.target.value))
                  }
                />
              </label>
            </div>
          </div>

          {/* Time Range */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--panel-border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: '#848E9C' }}>
                {tr('form.timeRangeLabel')}
              </span>
              <div className="flex gap-1.5">
                {quickRanges.map((range) => (
                  <button
                    type="button"
                    key={range.label}
                    className="px-2 py-1 text-[10px] font-medium rounded transition-all"
                    style={{
                      background: 'rgba(231, 129, 253, 0.1)',
                      border: '1px solid rgba(231, 129, 253, 0.3)',
                      color: '#EDA9FF',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(231, 129, 253, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(231, 129, 253, 0.1)'
                    }}
                    onClick={() => applyQuickRange(range.hours)}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <input
                type="datetime-local"
                className="input text-xs py-1.5"
                style={{
                  background: '#1E2329',
                  border: '1px solid #2B3139',
                  color: '#EAECEF',
                  borderRadius: '6px',
                }}
                value={formState.start}
                onChange={(e) => handleFormChange('start', e.target.value)}
              />
              <input
                type="datetime-local"
                className="input text-xs py-1.5"
                style={{
                  background: '#1E2329',
                  border: '1px solid #2B3139',
                  color: '#EAECEF',
                  borderRadius: '6px',
                }}
                value={formState.end}
                onChange={(e) => handleFormChange('end', e.target.value)}
              />
            </div>
          </div>

          {/* Symbols & Timeframes */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--panel-border)' }}>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-medium" style={{ color: '#848E9C' }}>{tr('form.symbolsLabel')}</span>
              <textarea
                className="input min-h-[50px] text-xs py-1.5"
                style={{
                  background: '#1E2329',
                  border: '1px solid #2B3139',
                  color: '#EAECEF',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                }}
                value={formState.symbols}
                onChange={(e) => handleFormChange('symbols', e.target.value)}
                placeholder="BTCUSDT,ETHUSDT,SOLUSDT"
              />
            </label>
            <div>
              <div className="text-[10px] font-medium mb-1.5" style={{ color: '#848E9C' }}>Timeframes</div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {timeframeOptions.map((tf) => {
                  const active = selectedTimeframes.includes(tf)
                  return (
                    <button
                      type="button"
                      key={tf}
                      onClick={() => toggleTimeframe(tf)}
                      className="px-2 py-1 text-[10px] font-medium rounded transition-all"
                      style={{
                        background: active ? 'rgba(231, 129, 253, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${active ? '#E781FD' : '#2B3139'}`,
                        color: active ? '#EDA9FF' : '#848E9C',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        }
                      }}
                    >
                      {tf}
                    </button>
                  )
                })}
              </div>
              <input
                className="input text-xs py-1.5"
                style={{
                  background: '#1E2329',
                  border: '1px solid #2B3139',
                  color: '#EAECEF',
                  borderRadius: '6px',
                }}
                placeholder={tr('form.customTfPlaceholder')}
                value={formState.timeframes}
                onChange={(e) => handleFormChange('timeframes', e.target.value)}
              />
            </div>
          </div>

          {/* Financial Parameters */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--panel-border)' }}>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium" style={{ color: '#848E9C' }}>{tr('form.initialBalanceLabel')}</span>
                <input
                  type="number"
                  className="input text-xs py-1.5"
                  style={{
                    background: '#1E2329',
                    border: '1px solid #2B3139',
                    color: '#EAECEF',
                    borderRadius: '6px',
                  }}
                  min={100}
                  value={formState.balance}
                  onChange={(e) =>
                    handleFormChange('balance', Number(e.target.value))
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium" style={{ color: '#848E9C' }}>{tr('form.feeLabel')}</span>
                <input
                  type="number"
                  className="input text-xs py-1.5"
                  style={{
                    background: '#1E2329',
                    border: '1px solid #2B3139',
                    color: '#EAECEF',
                    borderRadius: '6px',
                  }}
                  min={0}
                  value={formState.fee}
                  onChange={(e) => handleFormChange('fee', Number(e.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium" style={{ color: '#848E9C' }}>{tr('form.slippageLabel')}</span>
                <input
                  type="number"
                  className="input text-xs py-1.5"
                  style={{
                    background: '#1E2329',
                    border: '1px solid #2B3139',
                    color: '#EAECEF',
                    borderRadius: '6px',
                  }}
                  min={0}
                  value={formState.slippage}
                  onChange={(e) =>
                    handleFormChange('slippage', Number(e.target.value))
                  }
                />
              </label>
            </div>
          </div>

          {/* Strategy Options */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--panel-border)' }}>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium" style={{ color: '#848E9C' }}>Fill Policy</span>
                <select
                  className="input text-xs py-1.5"
                  style={{
                    background: '#1E2329',
                    border: '1px solid #2B3139',
                    color: '#EAECEF',
                    borderRadius: '6px',
                  }}
                  value={formState.fill}
                  onChange={(e) => handleFormChange('fill', e.target.value)}
                >
                  <option value="next_open">{tr('form.fillPolicies.nextOpen')}</option>
                  <option value="bar_vwap">{tr('form.fillPolicies.barVwap')}</option>
                  <option value="mid">{tr('form.fillPolicies.midPrice')}</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium" style={{ color: '#848E9C' }}>Prompt Preset</span>
                <select
                  className="input text-xs py-1.5"
                  style={{
                    background: '#1E2329',
                    border: '1px solid #2B3139',
                    color: '#EAECEF',
                    borderRadius: '6px',
                  }}
                  value={formState.prompt}
                  onChange={(e) => handleFormChange('prompt', e.target.value)}
                >
                  <option value="baseline">{tr('form.promptPresets.baseline')}</option>
                  <option value="aggressive">{tr('form.promptPresets.aggressive')}</option>
                  <option value="conservative">{tr('form.promptPresets.conservative')}</option>
                  <option value="scalping">{tr('form.promptPresets.scalping')}</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium" style={{ color: '#848E9C' }}>Template</span>
                <select
                  className="input text-xs py-1.5"
                  style={{
                    background: '#1E2329',
                    border: '1px solid #2B3139',
                    color: '#EAECEF',
                    borderRadius: '6px',
                  }}
                  value={formState.promptTemplate}
                  onChange={(e) =>
                    handleFormChange('promptTemplate', e.target.value)
                  }
                >
                  {(promptTemplates ?? ['default']).map((tpl) => (
                    <option key={tpl} value={tpl}>
                      {tpl}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--panel-border)' }}>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.cacheAI}
                  onChange={(e) => handleFormChange('cacheAI', e.target.checked)}
                  className="w-3.5 h-3.5 rounded cursor-pointer"
                  style={{
                    accentColor: '#E781FD',
                  }}
                />
                <span className="text-[10px]" style={{ color: '#EAECEF' }}>{tr('form.cacheAiLabel')}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.replayOnly}
                  onChange={(e) =>
                    handleFormChange('replayOnly', e.target.checked)
                  }
                  className="w-3.5 h-3.5 rounded cursor-pointer"
                  style={{
                    accentColor: '#E781FD',
                  }}
                />
                <span className="text-[10px]" style={{ color: '#EAECEF' }}>{tr('form.replayOnlyLabel')}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.overridePrompt}
                  onChange={(e) =>
                    handleFormChange('overridePrompt', e.target.checked)
                  }
                  className="w-3.5 h-3.5 rounded cursor-pointer"
                  style={{
                    accentColor: '#E781FD',
                  }}
                />
                <span className="text-[10px]" style={{ color: '#EAECEF' }}>{tr('form.overridePromptLabel')}</span>
              </label>
            </div>
          </div>

          {/* Leverage Settings */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--panel-border)' }}>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium" style={{ color: '#848E9C' }}>{tr('form.btcEthLeverageLabel')}</span>
                <input
                  type="number"
                  className="input text-xs py-1.5"
                  style={{
                    background: '#1E2329',
                    border: '1px solid #2B3139',
                    color: '#EAECEF',
                    borderRadius: '6px',
                  }}
                  min={1}
                  max={125}
                  value={formState.btcEthLeverage}
                  onChange={(e) =>
                    handleFormChange('btcEthLeverage', Number(e.target.value))
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-medium" style={{ color: '#848E9C' }}>{tr('form.altcoinLeverageLabel')}</span>
                <input
                  type="number"
                  className="input text-xs py-1.5"
                  style={{
                    background: '#1E2329',
                    border: '1px solid #2B3139',
                    color: '#EAECEF',
                    borderRadius: '6px',
                  }}
                  min={1}
                  max={75}
                  value={formState.altcoinLeverage}
                  onChange={(e) =>
                    handleFormChange('altcoinLeverage', Number(e.target.value))
                  }
                />
              </label>
            </div>
          </div>

          {/* Enhanced Custom Prompt Section */}
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span>{tr('form.customPromptLabel')}</span>
              {promptTemplateContent && !showCustomPromptEditor && (
                <button
                  type="button"
                  onClick={handleEditTemplate}
                  className="px-2 py-1 text-[10px] rounded transition-colors"
                  style={{
                    background: 'rgba(231, 129, 253, 0.1)',
                    border: '1px solid rgba(231, 129, 253, 0.3)',
                    color: '#EDA9FF',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(231, 129, 253, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(231, 129, 253, 0.1)'
                  }}
                >
                  Edit Template
                </button>
              )}
            </div>

            {showCustomPromptEditor ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] font-medium mb-1" style={{ color: '#848E9C' }}>
                      Template Preview (Read-only)
                    </div>
                    <textarea
                      value={promptTemplateContent}
                      readOnly
                      className="w-full min-h-[200px] text-xs p-2 rounded"
                      style={{ 
                        background: '#0B0E11',
                        border: '1px solid #2B3139',
                        color: '#848E9C',
                        fontFamily: 'monospace',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-[10px] font-medium mb-1" style={{ color: '#848E9C' }}>
                      Custom Prompt Editor
                    </div>
                    <textarea
                      value={formState.customPrompt}
                      onChange={(e) => handleFormChange('customPrompt', e.target.value)}
                      className="w-full min-h-[200px] text-xs p-2 rounded"
                      style={{ 
                        background: '#0B0E11',
                        border: '1px solid #2B3139',
                        color: '#EAECEF',
                        fontFamily: 'monospace',
                        resize: 'vertical',
                      }}
                      placeholder={tr('form.customPromptPlaceholder')}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--panel-border)' }}>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formState.overridePrompt}
                        onChange={(e) => handleFormChange('overridePrompt', e.target.checked)}
                        className="w-3.5 h-3.5 rounded cursor-pointer"
                        style={{ accentColor: '#E781FD' }}
                      />
                      <span className="text-[10px]" style={{ color: '#EAECEF' }}>
                        {tr('form.overridePromptLabel')}
                      </span>
                    </label>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ 
                      color: '#E781FD',
                      background: 'rgba(231, 129, 253, 0.1)',
                      border: '1px solid rgba(231, 129, 253, 0.3)',
                    }}>
                      ⚠️ {language === 'zh' ? '启用后将完全替换默认策略' : 'Will completely replace default strategy'}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={handleSavePrompt}
                      className="px-3 py-1 text-[10px] font-semibold rounded transition-all"
                      style={{
                        background: 'rgba(14, 203, 129, 0.1)',
                        border: '1px solid rgba(14, 203, 129, 0.3)',
                        color: '#0ECB81',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(14, 203, 129, 0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(14, 203, 129, 0.1)'
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1 text-[10px] font-semibold rounded transition-all"
                      style={{
                        background: 'rgba(246, 70, 93, 0.1)',
                        border: '1px solid rgba(246, 70, 93, 0.3)',
                        color: '#F6465D',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(246, 70, 93, 0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(246, 70, 93, 0.1)'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.overridePrompt}
                      onChange={(e) => handleFormChange('overridePrompt', e.target.checked)}
                      className="w-3.5 h-3.5 rounded cursor-pointer"
                      style={{ accentColor: '#E781FD' }}
                    />
                    <span className="text-[10px]" style={{ color: '#EAECEF' }}>
                      {tr('form.overridePromptLabel')}
                    </span>
                  </label>
                </div>
                <textarea
                  className="w-full min-h-[80px] text-xs p-2 rounded"
                  style={{ 
                    background: '#0B0E11',
                    border: '1px solid #2B3139',
                    color: '#EAECEF',
                    fontFamily: 'monospace',
                    resize: 'vertical',
                  }}
                  placeholder={
                    formState.overridePrompt
                      ? (language === 'zh' ? '完全自定义策略提示词...' : 'Fully customize strategy prompt...')
                      : tr('form.customPromptPlaceholder')
                  }
                  value={formState.customPrompt}
                  onChange={(e) => handleFormChange('customPrompt', e.target.value)}
                />
                {formState.customPrompt && (
                  <div className="text-[10px] px-1" style={{ color: '#848E9C' }}>
                    {formState.customPrompt.length} {language === 'zh' ? '字符' : 'characters'}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        <div className="p-5 space-y-3 binance-card xl:col-span-2">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div>
              <h3
                className="text-lg font-semibold"
                style={{ color: '#EAECEF' }}
              >
                {tr('runList.title')}
              </h3>
              <p className="text-xs" style={{ color: '#848E9C' }}>
                {tr('runList.count', { count: runs.length })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <select
                className="input"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
              >
                <option value="">{tr('filters.allStates')}</option>
                {stateOptions.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
              <input
                className="input"
                placeholder={tr('filters.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead style={{ color: '#848E9C' }}>
                <tr>
                  <th className="py-2 text-left">
                    {tr('tableHeaders.runId')}
                  </th>
                  <th className="py-2 text-left">{tr('tableHeaders.label')}</th>
                  <th className="py-2 text-left">{tr('tableHeaders.state')}</th>
                  <th className="py-2 text-left">
                    {tr('tableHeaders.progress')}
                  </th>
                  <th className="py-2 text-left">{tr('tableHeaders.equity')}</th>
                  <th className="py-2 text-left">
                    {tr('tableHeaders.lastError')}
                  </th>
                  <th className="py-2 text-left">
                    {tr('tableHeaders.updated')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {runs.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-6 text-center"
                      style={{ color: '#5E6673' }}
                    >
                      {tr('emptyStates.noRuns')}
                    </td>
                  </tr>
                )}
                {runs.map((run) => (
                  <tr
                    key={run.run_id}
                    className="cursor-pointer hover:bg-[#1E2329]"
                    style={{
                      background:
                        run.run_id === selectedRunId
                          ? 'rgba(240,185,11,0.08)'
                          : 'transparent',
                    }}
                    onClick={() => setSelectedRunId(run.run_id)}
                  >
                    <td className="py-2 font-mono">{run.run_id}</td>
                    <td className="py-2">{run.label || '-'}</td>
                    <td className="py-2">
                      {stateLabels[run.state] ?? run.state}
                    </td>
                    <td className="py-2">
                      {run.summary.progress_pct.toFixed(1)}%
                    </td>
                    <td className="py-2">
                      {run.summary.equity_last.toFixed(2)}
                    </td>
                    <td
                      className="py-2"
                      style={{ color: run.last_error ? '#F6465D' : '#848E9C' }}
                    >
                      {run.last_error ? run.last_error : '--'}
                    </td>
                    <td className="py-2">
                      {new Date(run.updated_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {!selectedRunId ? (
        <div
          className="p-6 text-center binance-card"
          style={{ color: '#5E6673' }}
        >
          {tr('emptyStates.selectRun')}
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="p-5 space-y-3 binance-card">
              <div className="flex justify-between items-center">
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: '#EAECEF' }}
                  >
                    {selectedRunId}
                  </h3>
                  <p className="text-xs" style={{ color: '#848E9C' }}>
                    {tr('detail.tfAndSymbols', {
                      tf: selectedRun?.summary.decision_tf ?? '--',
                      count: selectedRun?.summary.symbol_count ?? 0,
                    })}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <input
                      className="input"
                      placeholder={tr('detail.labelPlaceholder')}
                      value={labelDraft}
                      onChange={(e) => setLabelDraft(e.target.value)}
                      style={{ minWidth: 160 }}
                    />
                    <button
                      type="button"
                      className="px-3 py-1 text-xs rounded border border-[#2B3139]"
                      onClick={handleSaveLabel}
                    >
                      {tr('detail.saveLabel')}
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-xs rounded border border-[#2B3139]"
                      onClick={handleDeleteRun}
                      style={{ color: '#F6465D', borderColor: '#F6465D' }}
                    >
                      {tr('detail.deleteLabel')}
                    </button>
                  </div>
                </div>
                <button
                  className="text-xs transition-colors hover:opacity-80"
                  style={{ color: '#E781FD' }}
                  onClick={handleExport}
                >
                  {tr('detail.exportLabel')}
                </button>
              </div>
              {(status?.last_error || selectedRun?.last_error) && (
                <div
                  className="text-xs rounded p-2 border"
                  style={{
                    color: '#F6465D',
                    borderColor: 'rgba(246,70,93,0.4)',
                    background: 'rgba(246,70,93,0.05)',
                  }}
                >
                  {tr('detail.errorLabel')}:{' '}
                  {status?.last_error || selectedRun?.last_error}
                </div>
              )}
              <div className="flex flex-wrap gap-2 text-xs">
                {(['pause', 'resume', 'stop'] as ControlAction[]).map(
                  (action) => (
                    <button
                      key={action}
                      onClick={() => handleControl(action)}
                      disabled={actionLoading === action}
                      className="px-3 py-1.5 rounded border border-[#2B3139]"
                    >
                      {actionLoading === action ? '...' : actionLabels[action]}
                    </button>
                  )
                )}
              </div>
              {status?.note && (
                <div
                  className="p-2 text-xs rounded"
                  style={{ background: '#1E2329', color: '#F6465D' }}
                >
                  {status.note}
                </div>
              )}
            </div>
            <div className="p-5 space-y-2 text-sm binance-card">
              <Metric
                label={t('equity', language)}
                value={status?.equity}
                suffix="USDT"
              />
              <Metric
                label={tr('metrics.realized')}
                value={status?.realized_pnl}
                suffix="USDT"
              />
              <Metric
                label={tr('metrics.unrealized')}
                value={status?.unrealized_pnl}
                suffix="USDT"
              />
            </div>
            <div className="p-5 space-y-2 text-xs binance-card">
              <div className="flex justify-between items-center">
                <span style={{ color: '#EAECEF' }}>{tr('aiTrace.title')}</span>
                <button
                  className="transition-colors hover:opacity-80"
                  style={{ color: '#E781FD' }}
                  onClick={() => setTrace(undefined)}
                >
                  {tr('aiTrace.clear')}
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder={tr('aiTrace.cyclePlaceholder')}
                  value={traceCycle}
                  onChange={(e) => setTraceCycle(e.target.value)}
                />
                <button
                  className="px-3 py-1.5 text-xs rounded bg-[#2B3139]"
                  onClick={handleTrace}
                >
                  {tr('aiTrace.fetch')}
                </button>
              </div>
              {trace && (
                <div className="overflow-y-auto space-y-2 max-h-52 mono text-[11px]">
                  <div style={{ color: '#848E9C' }}>
                    {tr('aiTrace.cycleTag', { cycle: trace.cycle_number })}
                  </div>
                  <div>
                    <div className="mb-1" style={{ color: '#5E6673' }}>
                      {tr('aiTrace.prompt')}
                    </div>
                    <pre className="whitespace-pre-wrap">
                      {trace.input_prompt}
                    </pre>
                  </div>
                  {trace.cot_trace && (
                    <div>
                      <div className="mb-1" style={{ color: '#5E6673' }}>
                        {tr('aiTrace.cot')}
                      </div>
                      <pre className="whitespace-pre-wrap">
                        {trace.cot_trace}
                      </pre>
                    </div>
                  )}
                  {trace.decision_json && (
                    <div>
                      <div className="mb-1" style={{ color: '#5E6673' }}>
                        {tr('aiTrace.output')}
                      </div>
                      <pre className="whitespace-pre-wrap">
                        {trace.decision_json}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="p-5 space-y-3 binance-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: '#EAECEF' }}>
                  {tr('decisionTrail.title')}
                </h3>
                <p className="text-xs" style={{ color: '#848E9C' }}>
                  {decisions?.length
                    ? tr('decisionTrail.subtitle', {
                        count: decisions.length,
                      })
                    : tr('decisionTrail.empty')}
                </p>
              </div>
            </div>
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {decisions && decisions.length > 0 ? (
                decisions.map((decision) => (
                  <DecisionCard
                    key={`${decision.cycle_number}-${decision.timestamp}`}
                    decision={decision}
                    language={language}
                  />
                ))
              ) : (
                <div
                  className="py-12 text-center text-sm"
                  style={{ color: '#5E6673' }}
                >
                  {tr('decisionTrail.emptyHint')}
                </div>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="p-4 binance-card xl:col-span-2">
              <div className="flex justify-between items-center mb-3">
                <span style={{ color: '#EAECEF' }}>
                  {tr('charts.equityTitle')}
                </span>
                <select
                  className="text-xs input"
                  value={equityTf}
                  onChange={(e) => setEquityTf(e.target.value)}
                >
                  {timeframeOptions.map((tf) => (
                    <option key={tf}>{tf}</option>
                  ))}
                </select>
              </div>
              {equitySeries.length === 0 ? (
                <div className="py-12 text-center" style={{ color: '#5E6673' }}>
                  {tr('charts.equityEmpty')}
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer>
                    <LineChart data={equitySeries}>
                      <CartesianGrid stroke="#2B3139" strokeDasharray="3 3" />
                      <XAxis dataKey="time" hide />
                      <YAxis width={60} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="equity"
                        stroke="#E781FD"
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="p-4 space-y-2 text-xs binance-card">
              <h3
                className="text-sm font-semibold"
                style={{ color: '#EAECEF' }}
              >
                {tr('metrics.title')}
              </h3>
              {metrics ? (
                <>
                  <Metric
                    label={tr('metrics.totalReturn')}
                    value={metrics.total_return_pct}
                  />
                  <Metric
                    label={tr('metrics.maxDrawdown')}
                    value={metrics.max_drawdown_pct}
                  />
                  <Metric label={tr('metrics.sharpe')} value={metrics.sharpe_ratio} />
                  <Metric
                    label={tr('metrics.profitFactor')}
                    value={metrics.profit_factor}
                  />
                </>
              ) : (
                <div style={{ color: '#5E6673' }}>{tr('metrics.pending')}</div>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="p-5 binance-card">
              <h3
                className="mb-3 text-sm font-semibold"
                style={{ color: '#EAECEF' }}
              >
                {tr('trades.title')}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead style={{ color: '#848E9C' }}>
                    <tr>
                      <th className="py-2 text-left">
                        {tr('trades.headers.time')}
                      </th>
                      <th className="py-2 text-left">
                        {tr('trades.headers.symbol')}
                      </th>
                      <th className="py-2 text-left">
                        {tr('trades.headers.action')}
                      </th>
                      <th className="py-2 text-left">
                        {tr('trades.headers.qty')}
                      </th>
                      <th className="py-2 text-left">
                        {tr('trades.headers.leverage')}
                      </th>
                      <th className="py-2 text-left">
                        {tr('trades.headers.pnl')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestTrades.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-6 text-center"
                          style={{ color: '#5E6673' }}
                        >
                          {tr('trades.empty')}
                        </td>
                      </tr>
                    )}
                    {latestTrades.map((trade) => (
                      <tr key={`${trade.ts}-${trade.symbol}-${trade.action}`}>
                        <td className="py-1">
                          {new Date(trade.ts).toLocaleString()}
                        </td>
                        <td className="py-1 font-mono">{trade.symbol}</td>
                        <td className="py-1">{trade.action}</td>
                        <td className="py-1">{trade.qty.toFixed(4)}</td>
                        <td className="py-1">
                          {trade.leverage ? `${trade.leverage}x` : '--'}
                        </td>
                        <td
                          className="py-1 mono"
                          style={{
                            color:
                              trade.realized_pnl >= 0 ? '#0ECB81' : '#F6465D',
                          }}
                        >
                          {trade.realized_pnl.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-5 space-y-1 text-xs binance-card">
              <h3
                className="text-sm font-semibold"
                style={{ color: '#EAECEF' }}
              >
                {tr('metadata.title')}
              </h3>
              <div>
                {tr('metadata.created')}: {selectedRun?.created_at}
              </div>
              <div>
                {tr('metadata.updated')}: {selectedRun?.updated_at}
              </div>
              <div>
                {tr('metadata.processedBars')}:{' '}
                {selectedRun?.summary.processed_bars}
              </div>
              <div>
                {tr('metadata.maxDrawdown')}:{' '}
                {selectedRun?.summary.max_drawdown_pct.toFixed(2)}%
              </div>
              <div>
                {tr('metadata.liquidated')}:{' '}
                {selectedRun?.summary.liquidated ? (
                  <span style={{ color: '#F6465D' }}>{tr('metadata.yes')}</span>
                ) : (
                  tr('metadata.no')
                )}
              </div>
              {selectedRun?.summary.liquidation_note && (
                <div style={{ color: '#F6465D' }}>
                  {selectedRun.summary.liquidation_note}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function Metric({
  value,
  label,
  suffix,
}: {
  value?: number
  label: string
  suffix?: string
}) {
  return (
    <div>
      <div className="text-xs" style={{ color: '#848E9C' }}>
        {label}
      </div>
      <div className="text-lg font-semibold" style={{ color: '#EAECEF' }}>
        {value !== undefined && value !== null ? value.toFixed(2) : '--'}
        {suffix ? ` ${suffix}` : ''}
      </div>
    </div>
  )
}

