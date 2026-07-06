# InvestIQ Agent

## 1. Project Overview
InvestIQ Agent is an evidence-first AI investment research assistant. Users enter a company name, and an autonomous AI agent gathers recent web information, evaluates multiple investment factors, calculates a confidence score, and returns an investment recommendation (INVEST, PASS, or INSUFFICIENT EVIDENCE).

## 2. Problem Statement
Many AI investment tools hallucinate facts or confidently make recommendations without sufficient evidence. Investors need an objective tool that refuses to make a decision if reliable data is unavailable.

## 3. Solution
InvestIQ Agent addresses this by utilizing an "Evidence-First" architecture. Before analyzing a company, the agent dynamically generates search queries, gathers real-time data, and extracts concrete factual claims. All subsequent scoring and decision-making are strictly based on these verified claims.

## 4. Key Features
- **Evidence-First Analysis**: Scores are derived strictly from retrieved web evidence.
- **Dynamic Risk Assessment**: Explicitly highlights negative signals and risks.
- **Confidence Scoring System**: A rule-based engine that ensures enough data exists before recommending a decision.
- **Transparent LangGraph Workflow**: Step-by-step observable reasoning process.
- **Modern Responsive UI**: A student-built, portfolio-quality React dashboard.

## 5. Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js
- **AI/Agents**: LangGraph.js, @langchain/core
- **LLM Provider**: Google Gemini API (via @langchain/google-genai)
- **Search API**: Tavily Search API

## 6. System Architecture
The system follows a classic client-server model:
- The React client sends the company name to the Express backend.
- The backend initializes a LangGraph workflow containing 8 sequential nodes.
- LangGraph nodes interact asynchronously with external Search and LLM services.
- The compiled graph state is returned to the frontend and rendered in an interactive dashboard.

## 7. How the AI Agent Works
The agent operates as a multi-step pipeline. Instead of a single massive prompt, the agent breaks the task into specialized functions: planning research, retrieving data, extracting facts, scoring factors, calculating confidence, and finally synthesizing a decision.

## 8. LangGraph Workflow
1. **validateCompany**: Cleans input.
2. **planResearch**: LLM creates 4-5 focused search queries.
3. **collectResearch**: Calls Tavily API to fetch current web data.
4. **extractEvidence**: LLM extracts structured factual claims from the raw HTML/text.
5. **analyzeFactors**: LLM scores Business, Financials, Growth, and Competition (0-10).
6. **analyzeRisks**: LLM evaluates negative signals and calculates a separate risk score.
7. **calculateConfidence**: Rule-based node calculates a 0-100% confidence score.
8. **generateDecision**: Synthesizes the final recommendation and writes the investment thesis.

## 9. Evidence Confidence System
The system refuses to hallucinate. The confidence score is calculated deterministically:
- + Points for having > 5 or > 10 evidence items.
- + Points for having multiple distinct source domains.
- + Points for having coverage across multiple categories (financials, risks, news).
If the total confidence is below 60%, the agent halts and returns `INSUFFICIENT EVIDENCE`.

## 10. Investment Scoring Logic
If confidence is sufficient, an investment score is calculated:
- Business Quality: 25%
- Financial Health: 25%
- Growth Potential: 20%
- Competitive Position: 15%
- Risk Score (Inverted): 15%
If the overall score >= 7.0 and risk is manageable (< 8), the decision is `INVEST`. Otherwise, it's `PASS`.

## 11. Project Structure
\`\`\`
.
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx         # Main dashboard UI
│   │   ├── services/api.js # Axios integration
│   │   └── index.css       # Tailwind entry
├── server/                 # Express & LangGraph backend
│   ├── src/
│   │   ├── agents/
│   │   │   ├── investmentGraph.js # Graph orchestration
│   │   │   ├── state.js           # Shared state definitions
│   │   │   └── nodes/             # The 8 individual logic nodes
│   │   ├── services/
│   │   │   ├── llmService.js      # LLM API wrapper
│   │   │   └── searchService.js   # Tavily Search API wrapper
│   │   ├── controllers/
│   │   └── routes/
├── .env.example
└── README.md
\`\`\`

## 12. How to Run Locally

1. Clone the repository.
2. Create a `.env` file in the root based on `.env.example`.
3. Install backend dependencies:
   \`\`\`bash
   cd server
   npm install
   npm start
   \`\`\`
4. Install frontend dependencies:
   \`\`\`bash
   cd client
   npm install
   npm run dev
   \`\`\`
5. Open \`http://localhost:5173\` in your browser.

## 13. Environment Variables
\`\`\`
PORT=5000
LLM_API_KEY=your_gemini_api_key_here
SEARCH_API_KEY=your_tavily_api_key_here
CLIENT_URL=http://localhost:5173
\`\`\`

## 14. API Endpoint
\`POST /api/research\`
- **Request**: \`{ "companyName": "Microsoft" }\`
- **Response**: Returns a structured JSON containing \`decision\`, \`confidence\`, \`overallScore\`, \`factorScores\`, \`investmentThesis\`, and \`sources\`.

## 15. Example Runs
- **NVIDIA**: Usually returns **INVEST** due to high growth metrics, strong competitive moat in AI, and excellent financial health. Confidence is near 100%.
- **Peloton**: Usually returns **PASS** due to declining revenues, high debt, and strong competition in the fitness hardware space, driving up the risk score.
- **Obscure Startup LLC**: Returns **INSUFFICIENT EVIDENCE** because the search API cannot retrieve enough recent financial or business data to clear the confidence threshold.

## 16. Key Decisions and Trade-offs
- **Why LangGraph?** Instead of a single LLM prompt, LangGraph allows us to break the task into predictable, debuggable steps. If the research step fails, we don't waste tokens on the analysis step.
- **Why Rule-Based Confidence?** Letting an LLM "guess" its own confidence leads to overconfidence. A strict rule-based approach based on source count and variety is much more reliable.

## 17. Limitations
- The system relies heavily on the quality of the top 5 search results returned by the Search API. Paywalled information is generally not accessible.
- The LLM may still misinterpret highly complex financial jargon if the search snippet is truncated.

## 18. What I Would Improve With More Time
- Add a persistence layer (e.g., PostgreSQL or MongoDB) to save previous research reports.
- Implement parallel agent research (e.g., one agent searches financials, another searches news concurrently) to speed up execution.
- Add historical stock price charts using a market data API like AlphaVantage.

## 19. Disclaimer
*InvestIQ Agent is an educational portfolio project and AI research tool. It does not provide professional financial advice. Always consult a certified financial planner before making investment decisions.*
