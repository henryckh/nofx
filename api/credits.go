package api

import (
	"database/sql"
	// "encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"nofx/config"

	"github.com/gin-gonic/gin"
)

// CreditService handles credit-related operations
type CreditService struct {
	db *config.Database
}

// NewCreditService creates a new credit service
func NewCreditService(db *config.Database) *CreditService {
	return &CreditService{db: db}
}

// UserCredits represents user credit information
type UserCredits struct {
	WalletAddress string  `json:"wallet_address"`
	Credits       float64 `json:"credits"`
	UpdatedAt     string  `json:"updated_at"`
}

// CreditDeductionRequest represents a request to deduct credits
type CreditDeductionRequest struct {
	Amount        float64 `json:"amount"`
	Operation     string  `json:"operation"` // "llm_call", "backtest", "trade"
	WalletAddress string  `json:"wallet_address,omitempty"`
}

// CreditPurchaseRequest represents a request to purchase credits
type CreditPurchaseRequest struct {
	WalletAddress string `json:"wallet_address"`
	Credits       int64  `json:"credits"`
	TxHash        string `json:"tx_hash,omitempty"`
}

const (
	// CreditsPerLLMCall defines how many credits are consumed per LLM call
	CreditsPerLLMCall = 1.0
	// CreditsPerBacktestDecision defines credits per backtest decision
	CreditsPerBacktestDecision = 0.5
	// CreditsPerTradeDecision defines credits per live trade decision
	CreditsPerTradeDecision = 1.0
)

// InitializeCreditsTable creates the credits table if it doesn't exist
func (cs *CreditService) InitializeCreditsTable() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS user_credits (
			wallet_address TEXT PRIMARY KEY,
			credits REAL NOT NULL DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE INDEX IF NOT EXISTS idx_user_credits_wallet ON user_credits(wallet_address)`,
	}
	
	for _, query := range queries {
		if err := cs.db.ExecRaw(query); err != nil {
			return fmt.Errorf("failed to execute query: %w", err)
		}
	}
	return nil
}

// GetUserCredits retrieves credits for a wallet address
func (cs *CreditService) GetUserCredits(walletAddress string) (*UserCredits, error) {
	if walletAddress == "" {
		return nil, fmt.Errorf("wallet address is required")
	}

	normalizedAddr := strings.ToLower(strings.TrimSpace(walletAddress))
	
	var credits float64
	var updatedAt string
	err := cs.db.QueryRowRaw(
		"SELECT credits, updated_at FROM user_credits WHERE wallet_address = ?",
		normalizedAddr,
	).Scan(&credits, &updatedAt)

	if err == sql.ErrNoRows {
		// User doesn't exist yet, return zero credits
		return &UserCredits{
			WalletAddress: normalizedAddr,
			Credits:       0,
			UpdatedAt:     "",
		}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user credits: %w", err)
	}

	return &UserCredits{
		WalletAddress: normalizedAddr,
		Credits:       credits,
		UpdatedAt:     updatedAt,
	}, nil
}

// AddCredits adds credits to a user's account
func (cs *CreditService) AddCredits(walletAddress string, credits float64) error {
	if walletAddress == "" {
		return fmt.Errorf("wallet address is required")
	}
	if credits <= 0 {
		return fmt.Errorf("credits must be positive")
	}

	normalizedAddr := strings.ToLower(strings.TrimSpace(walletAddress))

	// Get current credits first
	currentCredits, err := cs.GetUserCredits(normalizedAddr)
	if err != nil {
		return fmt.Errorf("failed to get current credits: %w", err)
	}
	
	newCredits := currentCredits.Credits + credits
	
	// Use INSERT OR REPLACE for SQLite
	query := `
		INSERT INTO user_credits (wallet_address, credits, updated_at)
		VALUES (?, ?, CURRENT_TIMESTAMP)
		ON CONFLICT(wallet_address) DO UPDATE SET
			credits = excluded.credits,
			updated_at = CURRENT_TIMESTAMP
	`
	
	_, err = cs.db.ExecRawWithArgs(query, normalizedAddr, newCredits)
	if err != nil {
		return fmt.Errorf("failed to add credits: %w", err)
	}

	log.Printf("Added %.2f credits to wallet %s", credits, normalizedAddr)
	return nil
}

// DeductCredits deducts credits from a user's account
func (cs *CreditService) DeductCredits(walletAddress string, amount float64) error {
	if walletAddress == "" {
		return fmt.Errorf("wallet address is required")
	}
	if amount <= 0 {
		return fmt.Errorf("amount must be positive")
	}

	normalizedAddr := strings.ToLower(strings.TrimSpace(walletAddress))

	// Check if user has enough credits
	userCredits, err := cs.GetUserCredits(normalizedAddr)
	if err != nil {
		return fmt.Errorf("failed to check credits: %w", err)
	}

	if userCredits.Credits < amount {
		return fmt.Errorf("insufficient credits: have %.2f, need %.2f", userCredits.Credits, amount)
	}

	query := `
		UPDATE user_credits
		SET credits = credits - ?,
		    updated_at = CURRENT_TIMESTAMP
		WHERE wallet_address = ? AND credits >= ?
	`
	result, err := cs.db.ExecRawWithArgs(query, amount, normalizedAddr, amount)
	if err != nil {
		return fmt.Errorf("failed to deduct credits: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("insufficient credits or wallet not found")
	}

	log.Printf("Deducted %.2f credits from wallet %s", amount, normalizedAddr)
	return nil
}

// CheckCredits checks if user has enough credits
func (cs *CreditService) CheckCredits(walletAddress string, amount float64) (bool, error) {
	userCredits, err := cs.GetUserCredits(walletAddress)
	if err != nil {
		return false, err
	}
	return userCredits.Credits >= amount, nil
}

// RegisterCreditRoutes registers credit-related API routes
func (s *Server) RegisterCreditRoutes() {
	if s.database == nil {
		log.Println("Warning: Database not available, skipping credit routes")
		return
	}

	// Initialize credit service if not already set
	if s.creditService == nil {
		s.creditService = NewCreditService(s.database)
		if err := s.creditService.InitializeCreditsTable(); err != nil {
			log.Printf("Warning: Failed to initialize credits table: %v", err)
		}
	}
	
	creditService := s.creditService

	api := s.router.Group("/api")
	{
		// Public routes (for wallet connection)
		api.POST("/wallet/connect", s.handleWalletConnect)
		
		// Credit routes (require authentication or wallet verification)
		creditsGroup := api.Group("/credits")
		{
			creditsGroup.GET("/:wallet_address", s.handleGetCredits(creditService))
			creditsGroup.POST("/deduct", s.handleDeductCredits(creditService))
			creditsGroup.POST("/purchase", s.handlePurchaseCredits(creditService))
			creditsGroup.GET("/check/:wallet_address/:amount", s.handleCheckCredits(creditService))
		}
	}
}

// handleWalletConnect handles wallet connection
func (s *Server) handleWalletConnect(c *gin.Context) {
	var req struct {
		Address  string `json:"address"`
		ChainID  string `json:"chain_id"`
		WalletType string `json:"wallet_type"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Address == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "wallet address is required"})
		return
	}

	// Normalize wallet address
	normalizedAddr := strings.ToLower(strings.TrimSpace(req.Address))

	// Initialize user credits if they don't exist
	creditService := NewCreditService(s.database)
	_, err := creditService.GetUserCredits(normalizedAddr)
	if err != nil {
		log.Printf("Error getting user credits: %v", err)
	}

	// Store wallet connection info (optional, for analytics)
	log.Printf("Wallet connected: %s (chain: %s, type: %s)", normalizedAddr, req.ChainID, req.WalletType)

	c.JSON(http.StatusOK, gin.H{
		"message": "Wallet connected successfully",
		"address": normalizedAddr,
	})
}

// handleGetCredits returns a handler for getting user credits
func (s *Server) handleGetCredits(cs *CreditService) gin.HandlerFunc {
	return func(c *gin.Context) {
		walletAddress := c.Param("wallet_address")
		if walletAddress == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "wallet address is required"})
			return
		}

		credits, err := cs.GetUserCredits(walletAddress)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, credits)
	}
}

// handleDeductCredits returns a handler for deducting credits
func (s *Server) handleDeductCredits(cs *CreditService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreditDeductionRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		walletAddress := req.WalletAddress
		if walletAddress == "" {
			// Try to get from auth context if available
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(http.StatusBadRequest, gin.H{"error": "wallet address is required"})
				return
			}
			walletAddress = userID.(string)
		}

		if err := cs.DeductCredits(walletAddress, req.Amount); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		credits, _ := cs.GetUserCredits(walletAddress)
		c.JSON(http.StatusOK, gin.H{
			"message": "Credits deducted successfully",
			"remaining_credits": credits.Credits,
		})
	}
}

// handlePurchaseCredits returns a handler for purchasing credits
func (s *Server) handlePurchaseCredits(cs *CreditService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreditPurchaseRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if req.WalletAddress == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "wallet address is required"})
			return
		}

		// Verify transaction with smart contract (to be implemented)
		// For now, we'll trust the frontend and verify later via blockchain
		
		creditsToAdd := float64(req.Credits)
		if err := cs.AddCredits(req.WalletAddress, creditsToAdd); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		credits, _ := cs.GetUserCredits(req.WalletAddress)
		c.JSON(http.StatusOK, gin.H{
			"message": "Credits purchased successfully",
			"total_credits": credits.Credits,
			"tx_hash": req.TxHash,
		})
	}
}

// handleCheckCredits returns a handler for checking if user has enough credits
func (s *Server) handleCheckCredits(cs *CreditService) gin.HandlerFunc {
	return func(c *gin.Context) {
		walletAddress := c.Param("wallet_address")
		amountStr := c.Param("amount")
		
		if walletAddress == "" || amountStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "wallet address and amount are required"})
			return
		}

		var amount float64
		if _, err := fmt.Sscanf(amountStr, "%f", &amount); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid amount format"})
			return
		}

		hasEnough, err := cs.CheckCredits(walletAddress, amount)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		credits, _ := cs.GetUserCredits(walletAddress)
		c.JSON(http.StatusOK, gin.H{
			"has_enough": hasEnough,
			"current_credits": credits.Credits,
			"required": amount,
		})
	}
}

