import type {
  SystemStatus,
  AccountInfo,
  Position,
  DecisionRecord,
  Statistics,
  TraderInfo,
  TraderConfigData,
  AIModel,
  Exchange,
  CreateTraderRequest,
  UpdateModelConfigRequest,
  UpdateExchangeConfigRequest,
  CompetitionData,
  BacktestRunsResponse,
  BacktestStartConfig,
  BacktestStatusPayload,
  BacktestEquityPoint,
  BacktestTradeEvent,
  BacktestMetrics,
  BacktestRunMetadata,
} from '../types'
import { CryptoService } from './crypto'
import { httpClient } from './httpClient'

const API_BASE = '/api'
const HYPER_ALPHA_ARENA_API_BASE = (import.meta.env?.VITE_HYPER_ALPHA_ARENA_API_BASE as string) || 'http://localhost:8802/api';

// Helper function to get auth headers
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

export const api = {
  // AI交易员管理接口
  async getTraders(): Promise<TraderInfo[]> {
    const res = await httpClient.get(`${API_BASE}/my-traders`, getAuthHeaders())
    if (!res.ok) throw new Error('获取trader列表失败')
    return res.json()
  },

  // 获取公开的交易员列表（无需认证）
  async getPublicTraders(): Promise<any[]> {
    const res = await httpClient.get(`${API_BASE}/traders`)
    if (!res.ok) throw new Error('获取公开trader列表失败')
    return res.json()
  },

  async createTrader(request: CreateTraderRequest): Promise<TraderInfo> {
    const res = await httpClient.post(
      `${API_BASE}/traders`,
      request,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('创建交易员失败')
    return res.json()
  },

  async deleteTrader(traderId: string): Promise<void> {
    const res = await httpClient.delete(
      `${API_BASE}/traders/${traderId}`,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('删除交易员失败')
  },

  async startTrader(traderId: string): Promise<void> {
    const res = await httpClient.post(
      `${API_BASE}/traders/${traderId}/start`,
      undefined,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('启动交易员失败')
  },

  async stopTrader(traderId: string): Promise<void> {
    const res = await httpClient.post(
      `${API_BASE}/traders/${traderId}/stop`,
      undefined,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('停止交易员失败')
  },

  async updateTraderPrompt(
    traderId: string,
    customPrompt: string
  ): Promise<void> {
    const res = await httpClient.put(
      `${API_BASE}/traders/${traderId}/prompt`,
      { custom_prompt: customPrompt },
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('更新自定义策略失败')
  },

  async getTraderConfig(traderId: string): Promise<TraderConfigData> {
    const res = await httpClient.get(
      `${API_BASE}/traders/${traderId}/config`,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('获取交易员配置失败')
    return res.json()
  },

  async updateTrader(
    traderId: string,
    request: CreateTraderRequest
  ): Promise<TraderInfo> {
    const res = await httpClient.put(
      `${API_BASE}/traders/${traderId}`,
      request,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('更新交易员失败')
    return res.json()
  },

  // AI模型配置接口
  async getPromptTemplates(): Promise<string[]> {
    const res = await httpClient.get(`${API_BASE}/prompt-templates`, getAuthHeaders())
    if (!res.ok) throw new Error('获取提示词模板失败')
    const data = await res.json()
    // Backend returns { templates: [{ name: "..." }, ...] }
    if (Array.isArray(data.templates)) {
      return data.templates.map((item: { name: string }) => item.name)
    }
    return []
  },

  async getPromptTemplate(name: string): Promise<string> {
    const res = await httpClient.get(`${API_BASE}/prompt-templates/${name}`, getAuthHeaders())
    if (!res.ok) throw new Error(`获取提示词模板失败: ${name}`)
    const data = await res.json()
    return data.content || ''
  },

  async getModelConfigs(): Promise<AIModel[]> {
    const res = await httpClient.get(`${API_BASE}/models`, getAuthHeaders())
    if (!res.ok) throw new Error('获取模型配置失败')
    return res.json()
  },

  // 获取系统支持的AI模型列表（无需认证）
  async getSupportedModels(): Promise<AIModel[]> {
    const res = await httpClient.get(`${API_BASE}/supported-models`)
    if (!res.ok) throw new Error('获取支持的模型失败')
    return res.json()
  },

  async updateModelConfigs(request: UpdateModelConfigRequest): Promise<void> {
    // 获取RSA公钥
    const publicKey = await CryptoService.fetchPublicKey()

    // 初始化加密服务
    await CryptoService.initialize(publicKey)

    // 获取用户信息（从localStorage或其他地方）
    const userId = localStorage.getItem('user_id') || ''
    const sessionId = sessionStorage.getItem('session_id') || ''

    // 加密敏感数据
    const encryptedPayload = await CryptoService.encryptSensitiveData(
      JSON.stringify(request),
      userId,
      sessionId
    )

    // 发送加密数据
    const res = await httpClient.put(
      `${API_BASE}/models`,
      encryptedPayload,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('更新模型配置失败')
  },

  // 交易所配置接口
  async getExchangeConfigs(): Promise<Exchange[]> {
    const res = await httpClient.get(`${API_BASE}/exchanges`, getAuthHeaders())
    if (!res.ok) throw new Error('获取交易所配置失败')
    return res.json()
  },

  // 获取系统支持的交易所列表（无需认证）
  async getSupportedExchanges(): Promise<Exchange[]> {
    const res = await httpClient.get(`${API_BASE}/supported-exchanges`)
    if (!res.ok) throw new Error('获取支持的交易所失败')
    return res.json()
  },

  async updateExchangeConfigs(
    request: UpdateExchangeConfigRequest
  ): Promise<void> {
    const res = await httpClient.put(
      `${API_BASE}/exchanges`,
      request,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('更新交易所配置失败')
  },

  // 使用加密传输更新交易所配置
  async updateExchangeConfigsEncrypted(
    request: UpdateExchangeConfigRequest
  ): Promise<void> {
    // 获取RSA公钥
    const publicKey = await CryptoService.fetchPublicKey()

    // 初始化加密服务
    await CryptoService.initialize(publicKey)

    // 获取用户信息（从localStorage或其他地方）
    const userId = localStorage.getItem('user_id') || ''
    const sessionId = sessionStorage.getItem('session_id') || ''

    // 加密敏感数据
    const encryptedPayload = await CryptoService.encryptSensitiveData(
      JSON.stringify(request),
      userId,
      sessionId
    )

    // 发送加密数据
    const res = await httpClient.put(
      `${API_BASE}/exchanges`,
      encryptedPayload,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('更新交易所配置失败')
  },

  // 获取系统状态（支持trader_id）
  async getStatus(traderId?: string): Promise<SystemStatus> {
    const url = traderId
      ? `${API_BASE}/status?trader_id=${traderId}`
      : `${API_BASE}/status`
    const res = await httpClient.get(url, getAuthHeaders())
    if (!res.ok) throw new Error('获取系统状态失败')
    return res.json()
  },

  // 获取账户信息（支持trader_id）
  async getAccount(traderId?: string): Promise<AccountInfo> {
    const url = traderId
      ? `${API_BASE}/account?trader_id=${traderId}`
      : `${API_BASE}/account`
    const res = await httpClient.request(url, {
      cache: 'no-store',
      headers: {
        ...getAuthHeaders(),
        'Cache-Control': 'no-cache',
      },
    })
    if (!res.ok) throw new Error('获取账户信息失败')
    const data = await res.json()
    console.log('Account data fetched:', data)
    return data
  },

  // 获取持仓列表（支持trader_id）
  async getPositions(traderId?: string): Promise<Position[]> {
    const url = traderId
      ? `${API_BASE}/positions?trader_id=${traderId}`
      : `${API_BASE}/positions`
    const res = await httpClient.get(url, getAuthHeaders())
    if (!res.ok) throw new Error('获取持仓列表失败')
    return res.json()
  },

  // 获取决策日志（支持trader_id）
  async getDecisions(traderId?: string): Promise<DecisionRecord[]> {
    const url = traderId
      ? `${API_BASE}/decisions?trader_id=${traderId}`
      : `${API_BASE}/decisions`
    const res = await httpClient.get(url, getAuthHeaders())
    if (!res.ok) throw new Error('获取决策日志失败')
    return res.json()
  },

  // 获取最新决策（支持trader_id和limit参数）
  async getLatestDecisions(
    traderId?: string,
    limit: number = 5
  ): Promise<DecisionRecord[]> {
    const params = new URLSearchParams()
    if (traderId) {
      params.append('trader_id', traderId)
    }
    params.append('limit', limit.toString())

    const res = await httpClient.get(
      `${API_BASE}/decisions/latest?${params}`,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('获取最新决策失败')
    return res.json()
  },

  // 获取统计信息（支持trader_id）
  async getStatistics(traderId?: string): Promise<Statistics> {
    const url = traderId
      ? `${API_BASE}/statistics?trader_id=${traderId}`
      : `${API_BASE}/statistics`
    const res = await httpClient.get(url, getAuthHeaders())
    if (!res.ok) throw new Error('获取统计信息失败')
    return res.json()
  },

  // 获取收益率历史数据（支持trader_id）
  async getEquityHistory(traderId?: string): Promise<any[]> {
    const url = traderId
      ? `${API_BASE}/equity-history?trader_id=${traderId}`
      : `${API_BASE}/equity-history`
    const res = await httpClient.get(url, getAuthHeaders())
    if (!res.ok) throw new Error('获取历史数据失败')
    return res.json()
  },

  // 批量获取多个交易员的历史数据（无需认证）
  async getEquityHistoryBatch(traderIds: string[]): Promise<any> {
    const res = await httpClient.post(`${API_BASE}/equity-history-batch`, {
      trader_ids: traderIds,
    })
    if (!res.ok) throw new Error('获取批量历史数据失败')
    return res.json()
  },

  // 获取前5名交易员数据（无需认证）
  async getTopTraders(): Promise<any[]> {
    const res = await httpClient.get(`${API_BASE}/top-traders`)
    if (!res.ok) throw new Error('获取前5名交易员失败')
    return res.json()
  },

  // 获取公开交易员配置（无需认证）
  async getPublicTraderConfig(traderId: string): Promise<any> {
    const res = await httpClient.get(`${API_BASE}/trader/${traderId}/config`)
    if (!res.ok) throw new Error('获取公开交易员配置失败')
    return res.json()
  },

  // 获取AI学习表现分析（支持trader_id）
  async getPerformance(traderId?: string): Promise<any> {
    const url = traderId
      ? `${API_BASE}/performance?trader_id=${traderId}`
      : `${API_BASE}/performance`
    const res = await httpClient.get(url, getAuthHeaders())
    if (!res.ok) throw new Error('获取AI学习数据失败')
    return res.json()
  },

  // 获取竞赛数据（无需认证）
  async getCompetition(): Promise<CompetitionData> {
    const res = await httpClient.get(`${API_BASE}/competition`)
    if (!res.ok) throw new Error('获取竞赛数据失败')
    return res.json()
  },

  // 用户信号源配置接口
  async getUserSignalSource(): Promise<{
    coin_pool_url: string
    oi_top_url: string
  }> {
    const res = await httpClient.get(
      `${API_BASE}/user/signal-sources`,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('获取用户信号源配置失败')
    return res.json()
  },

  async saveUserSignalSource(
    coinPoolUrl: string,
    oiTopUrl: string
  ): Promise<void> {
    const res = await httpClient.post(
      `${API_BASE}/user/signal-sources`,
      {
        coin_pool_url: coinPoolUrl,
        oi_top_url: oiTopUrl,
      },
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('保存用户信号源配置失败')
  },

  // 获取服务器IP（需要认证，用于白名单配置）
  async getServerIP(): Promise<{
    public_ip: string
    message: string
  }> {
    const res = await httpClient.get(`${API_BASE}/server-ip`, getAuthHeaders())
    if (!res.ok) throw new Error('获取服务器IP失败')
    return res.json()
  },

  async getHyperAlphaArenaAssetCurve(params?: {
    timeframe?: string;
    trading_mode?: string;
    environment?: string;
    wallet_address?: string;
  }): Promise<any[]> {
    const searchParams = new URLSearchParams();
    if (params?.timeframe) searchParams.append('timeframe', params.timeframe);
    if (params?.trading_mode) searchParams.append('trading_mode', params.trading_mode);
    if (params?.environment) searchParams.append('environment', params.environment);
    if (params?.wallet_address) searchParams.append('wallet_address', params.wallet_address);

    const query = searchParams.toString();
    const url = `${HYPER_ALPHA_ARENA_API_BASE}/account/asset-curve${query ? `?${query}` : ''}`;

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Failed to fetch asset curve data from Hyper-Alpha-Arena');
    return res.json();
  },

  async getHyperAlphaArenaTrades(params?: {
    limit?: number;
    account_id?: number;
    trading_mode?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.account_id) searchParams.append('account_id', params.account_id.toString());
    if (params?.trading_mode) searchParams.append('trading_mode', params.trading_mode);

    const query = searchParams.toString();
    const url = `${HYPER_ALPHA_ARENA_API_BASE}/arena/trades${query ? `?${query}` : ''}`;

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Failed to fetch trades from Hyper-Alpha-Arena');
    return res.json();
  },

  async getHyperAlphaArenaModelChat(params?: {
    limit?: number;
    account_id?: number;
    trading_mode?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.account_id) searchParams.append('account_id', params.account_id.toString());
    if (params?.trading_mode) searchParams.append('trading_mode', params.trading_mode);

    const query = searchParams.toString();
    const url = `${HYPER_ALPHA_ARENA_API_BASE}/arena/model-chat${query ? `?${query}` : ''}`;

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Failed to fetch model chat from Hyper-Alpha-Arena');
    return res.json();
  },

  async getHyperAlphaArenaPositions(params?: {
    account_id?: number;
    trading_mode?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.account_id) searchParams.append('account_id', params.account_id.toString());
    if (params?.trading_mode) searchParams.append('trading_mode', params.trading_mode);

    const query = searchParams.toString();
    const url = `${HYPER_ALPHA_ARENA_API_BASE}/arena/positions${query ? `?${query}` : ''}`;

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Failed to fetch positions from Hyper-Alpha-Arena');
    return res.json();
  },

  // Backtest APIs
  async getBacktestRuns(params?: {
    state?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<BacktestRunsResponse> {
    const query = new URLSearchParams()
    if (params?.state) query.set('state', params.state)
    if (params?.search) query.set('search', params.search)
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.offset) query.set('offset', String(params.offset))
    const res = await httpClient.get(
      `${API_BASE}/backtest/runs${query.toString() ? `?${query}` : ''}`,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('获取回测列表失败')
    return res.json()
  },

  async startBacktest(config: BacktestStartConfig): Promise<BacktestRunMetadata> {
    const res = await httpClient.post(
      `${API_BASE}/backtest/start`,
      { config },
      getAuthHeaders()
    )
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || '启动回测失败')
    }
    return res.json()
  },

  async pauseBacktest(runId: string): Promise<BacktestRunMetadata> {
    const res = await httpClient.post(
      `${API_BASE}/backtest/pause`,
      { run_id: runId },
      getAuthHeaders()
    )
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || '暂停回测失败')
    }
    return res.json()
  },

  async resumeBacktest(runId: string): Promise<BacktestRunMetadata> {
    const res = await httpClient.post(
      `${API_BASE}/backtest/resume`,
      { run_id: runId },
      getAuthHeaders()
    )
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || '恢复回测失败')
    }
    return res.json()
  },

  async stopBacktest(runId: string): Promise<BacktestRunMetadata> {
    const res = await httpClient.post(
      `${API_BASE}/backtest/stop`,
      { run_id: runId },
      getAuthHeaders()
    )
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || '停止回测失败')
    }
    return res.json()
  },

  async updateBacktestLabel(
    runId: string,
    label: string
  ): Promise<BacktestRunMetadata> {
    const res = await httpClient.post(
      `${API_BASE}/backtest/label`,
      { run_id: runId, label },
      getAuthHeaders()
    )
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || '更新标签失败')
    }
    return res.json()
  },

  async deleteBacktestRun(runId: string): Promise<void> {
    const res = await httpClient.post(
      `${API_BASE}/backtest/delete`,
      { run_id: runId },
      getAuthHeaders()
    )
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || '删除回测失败')
    }
  },

  async getBacktestStatus(runId: string): Promise<BacktestStatusPayload> {
    const res = await httpClient.get(
      `${API_BASE}/backtest/status?run_id=${runId}`,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('获取回测状态失败')
    return res.json()
  },

  async getBacktestEquity(
    runId: string,
    timeframe?: string,
    limit?: number
  ): Promise<BacktestEquityPoint[]> {
    const query = new URLSearchParams({ run_id: runId })
    if (timeframe) query.set('tf', timeframe)
    if (limit) query.set('limit', String(limit))
    const res = await httpClient.get(
      `${API_BASE}/backtest/equity?${query}`,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('获取回测权益曲线失败')
    return res.json()
  },

  async getBacktestTrades(
    runId: string,
    limit = 200
  ): Promise<BacktestTradeEvent[]> {
    const query = new URLSearchParams({
      run_id: runId,
      limit: String(limit),
    })
    const res = await httpClient.get(
      `${API_BASE}/backtest/trades?${query}`,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('获取回测交易记录失败')
    return res.json()
  },

  async getBacktestMetrics(runId: string): Promise<BacktestMetrics> {
    const res = await httpClient.get(
      `${API_BASE}/backtest/metrics?run_id=${runId}`,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('获取回测指标失败')
    return res.json()
  },

  async getBacktestTrace(
    runId: string,
    cycle?: number
  ): Promise<DecisionRecord> {
    const query = new URLSearchParams({ run_id: runId })
    if (cycle) query.set('cycle', String(cycle))
    const res = await httpClient.get(
      `${API_BASE}/backtest/trace?${query}`,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('获取回测AI Trace失败')
    return res.json()
  },

  async getBacktestDecisions(
    runId: string,
    limit = 20,
    offset = 0
  ): Promise<DecisionRecord[]> {
    const query = new URLSearchParams({
      run_id: runId,
      limit: String(limit),
      offset: String(offset),
    })
    const res = await httpClient.get(
      `${API_BASE}/backtest/decisions?${query}`,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('获取回测决策记录失败')
    return res.json()
  },

  async exportBacktest(runId: string): Promise<Blob> {
    const res = await fetch(`${API_BASE}/backtest/export?run_id=${runId}`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) {
      const text = await res.text()
      try {
        const data = text ? JSON.parse(text) : null
        throw new Error(
          data?.error || data?.message || text || '导出失败，请稍后再试'
        )
      } catch (err) {
        if (err instanceof Error && err.message) {
          throw err
        }
        throw new Error(text || '导出失败，请稍后再试')
      }
    }
    return res.blob()
  },

  // Credit system APIs
  async getUserCredits(walletAddress: string): Promise<{
    wallet_address: string
    credits: number
    updated_at: string
  }> {
    const res = await httpClient.get(
      `${API_BASE}/credits/${walletAddress}`,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('获取用户积分失败')
    return res.json()
  },

  async deductCredits(
    walletAddress: string,
    amount: number,
    operation: string
  ): Promise<{ message: string; remaining_credits: number }> {
    const res = await httpClient.post(
      `${API_BASE}/credits/deduct`,
      {
        wallet_address: walletAddress,
        amount,
        operation,
      },
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('扣除积分失败')
    return res.json()
  },

  async purchaseCredits(
    walletAddress: string,
    credits: number,
    txHash?: string
  ): Promise<{ message: string; total_credits: number; tx_hash?: string }> {
    const res = await httpClient.post(
      `${API_BASE}/credits/purchase`,
      {
        wallet_address: walletAddress,
        credits,
        tx_hash: txHash,
      },
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('购买积分失败')
    return res.json()
  },

  async checkCredits(
    walletAddress: string,
    amount: number
  ): Promise<{
    has_enough: boolean
    current_credits: number
    required: number
  }> {
    const res = await httpClient.get(
      `${API_BASE}/credits/check/${walletAddress}/${amount}`,
      getAuthHeaders()
    )
    if (!res.ok) throw new Error('检查积分失败')
    return res.json()
  },
}
