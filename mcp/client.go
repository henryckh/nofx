package mcp

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

// Provider AI提供商类型
type Provider string

const (
	ProviderDeepSeek Provider = "deepseek"
	ProviderQwen     Provider = "qwen"
	ProviderGemini   Provider = "gemini"
	ProviderCustom   Provider = "custom"
)

// Client AI API配置
type Client struct {
	Provider   Provider
	APIKey     string
	BaseURL    string
	Model      string
	Timeout    time.Duration
	UseFullURL bool // 是否使用完整URL（不添加/chat/completions）
}

func New() *Client {
	// 默认配置
	return &Client{
		Provider: ProviderDeepSeek,
		BaseURL:  "https://api.deepseek.com/v1",
		Model:    "deepseek-chat",
		Timeout:  120 * time.Second, // 增加到120秒，因为AI需要分析大量数据
	}
}

// SetDeepSeekAPIKey 设置DeepSeek API密钥
// customURL 为空时使用默认URL，customModel 为空时使用默认模型
func (client *Client) SetDeepSeekAPIKey(apiKey string, customURL string, customModel string) {
	client.Provider = ProviderDeepSeek
	client.APIKey = apiKey
	if customURL != "" {
		client.BaseURL = customURL
		log.Printf("🔧 [MCP] DeepSeek 使用自定义 BaseURL: %s", customURL)
	} else {
		client.BaseURL = "https://api.deepseek.com/v1"
		log.Printf("🔧 [MCP] DeepSeek 使用默认 BaseURL: %s", client.BaseURL)
	}
	if customModel != "" {
		client.Model = customModel
		log.Printf("🔧 [MCP] DeepSeek 使用自定义 Model: %s", customModel)
	} else {
		client.Model = "deepseek-chat"
		log.Printf("🔧 [MCP] DeepSeek 使用默认 Model: %s", client.Model)
	}
	// 打印 API Key 的前后各4位用于验证
	if len(apiKey) > 8 {
		log.Printf("🔧 [MCP] DeepSeek API Key: %s...%s", apiKey[:4], apiKey[len(apiKey)-4:])
	}
}

// SetQwenAPIKey 设置阿里云Qwen API密钥
// customURL 为空时使用默认URL，customModel 为空时使用默认模型
func (client *Client) SetQwenAPIKey(apiKey string, customURL string, customModel string) {
	client.Provider = ProviderQwen
	client.APIKey = apiKey
	if customURL != "" {
		client.BaseURL = customURL
		log.Printf("🔧 [MCP] Qwen 使用自定义 BaseURL: %s", customURL)
	} else {
		client.BaseURL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
		log.Printf("🔧 [MCP] Qwen 使用默认 BaseURL: %s", client.BaseURL)
	}
	if customModel != "" {
		client.Model = customModel
		log.Printf("🔧 [MCP] Qwen 使用自定义 Model: %s", customModel)
	} else {
		client.Model = "qwen-plus" // 可选: qwen-turbo, qwen-plus, qwen-max
		log.Printf("🔧 [MCP] Qwen 使用默认 Model: %s", client.Model)
	}
	// 打印 API Key 的前后各4位用于验证
	if len(apiKey) > 8 {
		log.Printf("🔧 [MCP] Qwen API Key: %s...%s", apiKey[:4], apiKey[len(apiKey)-4:])
	}
}

// SetGeminiAPIKey 设置Google Gemini API密钥
// customURL 为空时使用默认URL，customModel 为空时使用默认模型
func (client *Client) SetGeminiAPIKey(apiKey string, customURL string, customModel string) {
    client.Provider = ProviderGemini
    client.APIKey = apiKey
    if customURL != "" {
        client.BaseURL = customURL
        log.Printf("🔧 [MCP] Gemini 使用自定义 BaseURL: %s", customURL)
    } else {
        client.BaseURL = "https://generativelanguage.googleapis.com/v1beta"
        log.Printf("🔧 [MCP] Gemini 使用默认 BaseURL: %s", client.BaseURL)
    }
    if customModel != "" {
        client.Model = customModel
        log.Printf("🔧 [MCP] Gemini 使用自定义 Model: %s", customModel)
    } else {
        client.Model = "gemini-1.5-flash"
        log.Printf("🔧 [MCP] Gemini 使用默认 Model: %s", client.Model)
    }
    if len(apiKey) > 8 {
        log.Printf("🔧 [MCP] Gemini API Key: %s...%s", apiKey[:4], apiKey[len(apiKey)-4:])
    }
}

// SetCustomAPI 设置自定义OpenAI兼容API
func (client *Client) SetCustomAPI(apiURL, apiKey, modelName string) {
	client.Provider = ProviderCustom
	client.APIKey = apiKey

	// 检查URL是否以#结尾，如果是则使用完整URL（不添加/chat/completions）
	if strings.HasSuffix(apiURL, "#") {
		client.BaseURL = strings.TrimSuffix(apiURL, "#")
		client.UseFullURL = true
	} else {
		client.BaseURL = apiURL
		client.UseFullURL = false
	}

	client.Model = modelName
	client.Timeout = 120 * time.Second
}

// SetClient 设置完整的AI配置（高级用户）
func (client *Client) SetClient(Client Client) {
	if Client.Timeout == 0 {
		Client.Timeout = 30 * time.Second
	}
	client = &Client
}

// CallWithMessages 使用 system + user prompt 调用AI API（推荐）
func (client *Client) CallWithMessages(systemPrompt, userPrompt string) (string, error) {
	if client.APIKey == "" {
		return "", fmt.Errorf("AI API密钥未设置，请先调用 SetDeepSeekAPIKey() 或 SetQwenAPIKey()")
	}

	// 重试配置
	maxRetries := 3
	var lastErr error

	for attempt := 1; attempt <= maxRetries; attempt++ {
		if attempt > 1 {
			fmt.Printf("⚠️  AI API调用失败，正在重试 (%d/%d)...\n", attempt, maxRetries)
		}

		result, err := client.callOnce(systemPrompt, userPrompt)
		if err == nil {
			if attempt > 1 {
				fmt.Printf("✓ AI API重试成功\n")
			}
			return result, nil
		}

		lastErr = err
		// 如果不是网络错误，不重试
		if !isRetryableError(err) {
			return "", err
		}

		// 重试前等待
		if attempt < maxRetries {
			waitTime := time.Duration(attempt) * 2 * time.Second
			fmt.Printf("⏳ 等待%v后重试...\n", waitTime)
			time.Sleep(waitTime)
		}
	}

	return "", fmt.Errorf("重试%d次后仍然失败: %w", maxRetries, lastErr)
}

// callOnce 单次调用AI API（内部使用）
func (client *Client) callOnce(systemPrompt, userPrompt string) (string, error) {
	// 打印当前 AI 配置
	log.Printf("📡 [MCP] AI 请求配置:")
	log.Printf("   Provider: %s", client.Provider)
	log.Printf("   BaseURL: %s", client.BaseURL)
	log.Printf("   Model: %s", client.Model)
	log.Printf("   UseFullURL: %v", client.UseFullURL)
	if len(client.APIKey) > 8 {
		log.Printf("   API Key: %s...%s", client.APIKey[:4], client.APIKey[len(client.APIKey)-4:])
	}

	var jsonData []byte
	var err error

	if client.Provider == ProviderGemini {
		// Gemini 请求体：generateContent
		geminiBody := map[string]interface{}{}

		// system 指令（可选）
		if systemPrompt != "" {
			geminiBody["system_instruction"] = map[string]interface{}{
				"role":  "system",
				"parts": []map[string]string{{"text": systemPrompt}},
			}
		}

		// 用户消息
		geminiBody["contents"] = []map[string]interface{}{
			{
				"role":  "user",
				"parts": []map[string]string{{"text": userPrompt}},
			},
		}

		// 生成参数
		geminiBody["generationConfig"] = map[string]interface{}{
			"temperature": 0.5,
			"maxOutputTokens": 2000,
		}

		jsonData, err = json.Marshal(geminiBody)
		if err != nil {
			return "", fmt.Errorf("序列化Gemini请求失败: %w", err)
		}
	} else {
		// OpenAI 兼容的请求体
		messages := []map[string]string{}
		if systemPrompt != "" {
			messages = append(messages, map[string]string{
				"role":    "system",
				"content": systemPrompt,
			})
		}
		messages = append(messages, map[string]string{
			"role":    "user",
			"content": userPrompt,
		})
		requestBody := map[string]interface{}{
			"model":       client.Model,
			"messages":    messages,
			"temperature": 0.5,
			"max_tokens":  2000,
		}
		jsonData, err = json.Marshal(requestBody)
		if err != nil {
			return "", fmt.Errorf("序列化请求失败: %w", err)
		}
	}
	if err != nil {
		return "", fmt.Errorf("序列化请求失败: %w", err)
	}

	// 创建HTTP请求
	var url string
	if client.Provider == ProviderGemini {
		base := client.BaseURL
		if base == "" {
			base = "https://generativelanguage.googleapis.com/v1beta"
		}
		url = fmt.Sprintf("%s/models/%s:generateContent?key=%s", base, client.Model, client.APIKey)
	} else {
		if client.UseFullURL {
			url = client.BaseURL
		} else {
			url = fmt.Sprintf("%s/chat/completions", client.BaseURL)
		}
	}
	log.Printf("📡 [MCP] 请求 URL: %s", url)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// 根据不同的Provider设置认证方式
	switch client.Provider {
	case ProviderGemini:
		// Gemini 使用查询参数中的 key，不使用 Authorization 头
		// 无需额外处理
	case ProviderDeepSeek:
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", client.APIKey))
	case ProviderQwen:
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", client.APIKey))
	default:
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", client.APIKey))
	}

	// 发送请求
	httpClient := &http.Client{Timeout: client.Timeout}
	resp, err := httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("发送请求失败: %w", err)
	}
	defer resp.Body.Close()

	// 读取响应
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("读取响应失败: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API返回错误 (status %d): %s", resp.StatusCode, string(body))
	}

	// 解析响应
	if client.Provider == ProviderGemini {
		var gres struct {
			Candidates []struct {
				Content struct {
					Parts []struct {
						Text string `json:"text"`
					} `json:"parts"`
				} `json:"content"`
			} `json:"candidates"`
		}
		if err := json.Unmarshal(body, &gres); err != nil {
			return "", fmt.Errorf("解析Gemini响应失败: %w", err)
		}
		if len(gres.Candidates) == 0 || len(gres.Candidates[0].Content.Parts) == 0 {
			return "", fmt.Errorf("API返回空响应")
		}
		return gres.Candidates[0].Content.Parts[0].Text, nil
	} else {
		var result struct {
			Choices []struct {
				Message struct {
					Content string `json:"content"`
				} `json:"message"`
			} `json:"choices"`
		}
		if err := json.Unmarshal(body, &result); err != nil {
			return "", fmt.Errorf("解析响应失败: %w", err)
		}
		if len(result.Choices) == 0 {
			return "", fmt.Errorf("API返回空响应")
		}
		return result.Choices[0].Message.Content, nil
	}
}

// isRetryableError 判断错误是否可重试
func isRetryableError(err error) bool {
	errStr := err.Error()
	// 网络错误、超时、EOF等可以重试
	retryableErrors := []string{
		"EOF",
		"timeout",
		"connection reset",
		"connection refused",
		"temporary failure",
		"no such host",
	}
	for _, retryable := range retryableErrors {
		if strings.Contains(errStr, retryable) {
			return true
		}
	}
	return false
}
