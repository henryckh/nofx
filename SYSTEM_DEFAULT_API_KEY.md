# System Default API Key Configuration

When users select "Subscription - System Default" option, the system uses a managed DeepSeek API key that you configure. Users don't need to provide their own API keys.

## Configuration Options

You can configure the system default DeepSeek API key in two ways:

### Option 1: Environment Variable (Recommended)

Create a `.env` file in the `nofx-aio` directory (or set it in your environment):

```bash
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
```

The backend automatically loads `.env` files using `godotenv` (see `main.go` line 163).

**Advantages:**
- Easy to manage
- Can be different per environment (dev/staging/prod)
- Not committed to git (add `.env` to `.gitignore`)

### Option 2: Database Configuration

Set it directly in the database:

```sql
INSERT INTO system_config (key, value) 
VALUES ('system_default_deepseek_api_key', 'sk-your-deepseek-api-key-here');
```

Or use the database API if available.

**Advantages:**
- Can be updated without restarting the server
- Centralized configuration management

## Priority Order

The system checks in this order:
1. Database config: `system_default_deepseek_api_key`
2. Environment variable: `DEEPSEEK_API_KEY`
3. If neither is set, backtest/trade will fail with an error

## How It Works

1. User selects "Subscription - System Default" in the UI
2. Backend receives `ai_model_id: "system_default"`
3. `hydrateBacktestAIConfig()` detects `system_default` and:
   - Skips model database lookup
   - Loads API key from config/database
   - Sets provider to `system_default`
   - Uses `deepseek-chat` model by default
4. Credits are deducted per LLM call (1.0 credit per call)

## Testing

After setting the API key:

1. Start the backend server
2. Check logs for: `🔑 使用系统默认DeepSeek API Key (Provider=system_default)`
3. Select "Subscription - System Default" in backtest page
4. Start a backtest - it should work without requiring user API key

## Security Notes

- **Never commit `.env` files to git**
- Use environment variables in production (Docker, Kubernetes, etc.)
- Consider using secrets management systems for production
- The API key is used for all users selecting system_default, so monitor usage

## Example .env File

```bash
# System Default DeepSeek API Key for Subscription Service
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Other environment variables
NOFX_BACKEND_PORT=8080
JWT_SECRET=your-jwt-secret-here
```

