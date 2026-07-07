# InvestIQ Agent

## 1. Project Overview
InvestIQ Agent is an evidence-first AI investment research agent. A user enters a company name, and the system researches the company using current web sources, extracts investment-relevant evidence, analyzes business quality, financial health, growth, competition, and risks, and returns an `INVEST`, `PASS`, or `INSUFFICIENT EVIDENCE` decision.

The main goal of the project is not only to generate an investment opinion, but to show the evidence and reasoning used to reach that decision.

## 2. Problem Statement
A simple LLM prompt can generate a confident investment answer even when the available information is weak or unsupported. During development, I also found that attaching a valid source URL to a claim does not necessarily prove that the source actually supports that claim.

The project therefore needed a workflow where research is collected first, evidence is checked before analysis, and the final decision can be refused when there is not enough information.

## 3. Solution
InvestIQ Agent uses an evidence-first LangGraph workflow instead of asking an LLM to make a decision in one prompt.

The system first plans research queries and collects web results through Tavily. The collected sources are grouped into small batches. For each extracted claim, the LLM must return a source ID and an exact supporting text excerpt. JavaScript then checks that the supporting text actually exists in the collected content of that source.

Only evidence that passes this verification step is allowed to continue into factor scoring, risk analysis, confidence calculation, and the final investment decision.

## 4. Key Features
- **Multi-step LangGraph workflow**: Research and decision-making are divided into 8 clear nodes.
- **Current web research**: The agent creates company-specific search queries and retrieves recent web information.
- **Evidence verification**: Extracted claims require supporting text that is checked against the collected source content.
- **Rule-based confidence score**: Confidence depends on evidence quantity, source diversity, and category coverage.
- **Transparent investment scoring**: Business quality, financial health, growth, competition, and risk contribute to the final score.
- **Three possible outcomes**: The agent can return `INVEST`, `PASS`, or `INSUFFICIENT EVIDENCE`.
- **Source transparency**: The final report displays the research sources used by the agent.
- **Responsive dashboard**: The React frontend presents the decision, scorecards, risks, bull case, bear case, and sources.

## 5. Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js
- **AI/Agents**: LangGraph.js, @langchain/core
- **LLM Provider**: Google Gemini API (via @langchain/google-genai)
- **Search API**: Tavily Search API

## 6. System Architecture
The project follows a client-server architecture:

- The React client sends a company name to the Express backend.
- The backend starts a compiled LangGraph workflow.
- Eight nodes share and update a common graph state.
- Tavily provides web research results.
- Gemini is used for research planning, evidence extraction, factor analysis, risk analysis, and final thesis generation.
- JavaScript handles evidence verification, confidence calculation, and the final weighted investment score.
- The completed graph state is converted into a structured API response and displayed on the frontend.

## 7. How the AI Agent Works
The agent does not ask the LLM to research and decide everything in one prompt. The work is divided into smaller steps so that each stage can be inspected and debugged separately.

The workflow first validates the company name and creates focused research queries. Search results are collected and passed to the evidence extraction stage. Only verified evidence is used for factor scoring and risk analysis. A deterministic confidence score checks whether the research coverage is sufficient before the final decision is allowed.

## 8. LangGraph Workflow
1. **validateCompany**: Validates and cleans the company input.
2. **planResearch**: Uses the LLM to create 4-5 focused research queries.
3. **collectResearch**: Runs the queries through Tavily and collects web results.
4. **extractEvidence**: Groups sources into batches, extracts claims with source IDs and supporting text, and verifies the supporting text against the collected source content.
5. **analyzeFactors**: Scores Business Quality, Financial Health, Growth Potential, and Competitive Position from 0 to 10.
6. **analyzeRisks**: Identifies major risks and calculates a separate risk score.
7. **calculateConfidence**: Calculates a rule-based evidence confidence score from research coverage.
8. **generateDecision**: Calculates the weighted score, returns the decision, and generates the thesis, bull case, bear case, and decision triggers.

## 9. Evidence Verification and Confidence
A valid source URL alone does not prove that a claim is supported by that source. To reduce unsupported evidence, the extraction node uses an additional verification step.

The collected sources are divided into batches of five. For every extracted claim, the LLM must return:

- a `sourceId`
- an exact `supportingText` excerpt
- a category
- a signal
- a relevance score

JavaScript then checks whether the supporting text actually appears in the collected content for that source. Evidence that fails this check is rejected before factor scoring.

After verification, confidence is calculated deterministically using:

- the number of evidence items
- the number of distinct source domains
- coverage across evidence categories

If confidence is below 60%, the system returns `INSUFFICIENT EVIDENCE` instead of forcing an investment decision.

## 10. Investment Scoring Logic
If evidence confidence is sufficient, the final score is calculated using:

- Business Quality: 25%
- Financial Health: 25%
- Growth Potential: 20%
- Competitive Position: 15%
- Inverted Risk Score: 15%

A high risk score reduces the overall investment score. The system returns `INVEST` only when:

- the overall score is at least 7.0, and
- the risk score is below 8

Otherwise, the result is `PASS`.

## 11. Project Structure
```
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
```

## 12. How to Run Locally

### Prerequisites

Before running the project, make sure you have:

* Node.js installed
* A Google Gemini API key
* A Tavily Search API key

### 1. Clone the Repository

```bash
git clone https://github.com/Chandraprakash017/AI-Investment-Research-Agent.git
cd AI-Investment-Research-Agent
```

### 2. Create the Environment File

Create a `.env` file in the project root using `.env.example` as a reference:

```env
PORT=5001
LLM_API_KEY=your_gemini_api_key_here
SEARCH_API_KEY=your_tavily_api_key_here
CLIENT_URL=http://localhost:5173
```

Never commit the `.env` file because it contains private API keys.

### 3. Start the Backend

```bash
cd server
npm install
npm start
```

The backend runs on `http://localhost:5001`.

### 4. Start the Frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in the browser.

## 13. Environment Variables

| Variable         | Purpose                                       |
| ---------------- | --------------------------------------------- |
| `PORT`           | Port used by the Express backend              |
| `LLM_API_KEY`    | Google Gemini API key used by the AI workflow |
| `SEARCH_API_KEY` | Tavily API key used for web research          |
| `CLIENT_URL`     | Frontend URL allowed by the backend           |

The frontend also supports:

| Variable       | Purpose                                            |
| -------------- | -------------------------------------------------- |
| `VITE_API_URL` | Backend API base URL used by the React application |

For local development, the frontend falls back to `http://localhost:5001/api`.

## 14. API Endpoint

### `POST /api/research`

Request body:

```json
{
  "companyName": "Microsoft"
}
```

The response contains:

* final investment decision
* evidence confidence
* overall investment score
* factor scores and reasoning
* investment thesis
* positive signals
* major risks
* bull case and bear case
* decision triggers
* verified evidence
* research sources

## 15. Example Run

### Tesla — PASS

A tested run on Tesla returned:

* **Decision**: `PASS`
* **Evidence Confidence**: `100%`
* **Investment Score**: `5.4/10`

The agent found strong growth in Tesla's energy and services businesses, along with competitive advantages from scale, technology, and its charging network. However, the final score was reduced by financial volatility, tariff and supply-chain pressure, autonomous-driving liability risks, reputational concerns, and increasing EV competition.

The generated investment thesis was:

> We are passing on Tesla due to a precarious balance between its technological leadership and significant execution risks. While the energy segment shows promise, the combination of brand erosion, regulatory uncertainty surrounding autonomous driving, and margin volatility makes the current risk-reward profile unattractive.

Some positive signals identified by the agent included:

* Energy Generation & Storage revenue growth of 67.1% year-over-year in 2024.
* Services & Other revenue growth of 26.6% in 2024.
* $10.09 billion in energy business revenue in 2024.
* Competitive advantages from economies of scale, technology, brand strength, and the charging network.

Major risks included:

* tariff and international supply-chain cost pressure
* autonomous-vehicle liability and regulatory uncertainty
* reputational impact
* financial profitability volatility
* increasing competition in the EV market

The run displayed 11 research sources and reached 100% evidence confidence based on evidence quantity, source diversity, and category coverage.

Because the agent researches current web information, results can change between runs as available evidence changes.

## 16. Key Decisions and Trade-offs

### Why LangGraph Instead of One Large Prompt?

The research process is divided into eight nodes rather than asking one LLM call to research, analyze, and decide everything. This makes the workflow easier to debug and allows each stage to have a clear responsibility.

The trade-off is that a complete run requires multiple LLM calls and therefore takes more time than a single-prompt solution.

### Why Verify Supporting Text?

During testing, I found that an extracted claim could contain a valid source URL without the source actually supporting the claim.

To reduce this problem, each extracted claim must include a source ID and supporting text. JavaScript checks that the supporting text exists in the collected source content before the evidence is accepted.

This is stricter than trusting the LLM output directly, although it still depends on the quality and completeness of the text returned by the search API.

### Why Process Sources in Batches?

Processing all collected research in one large prompt made source attribution harder and increased prompt size. Processing every source with a separate LLM call would require too many requests.

The extraction node therefore groups sources into batches of five. This provides a balance between source attribution, prompt size, execution time, and API usage.

### Why Use Rule-Based Confidence?

The LLM does not decide how confident the system should be. Confidence is calculated from evidence quantity, distinct source domains, and category coverage.

This makes the confidence score predictable and prevents the model from simply claiming high confidence.

### Why Use a Deterministic Final Score?

The final `INVEST` or `PASS` threshold is calculated in JavaScript using fixed weights. The LLM analyzes the factors and risks, but it does not directly control the final scoring formula.

This makes the final decision logic easier to inspect and explain.

### Why No Database?

The assignment focuses on company research and AI-agent behavior, so I prioritized the research pipeline, evidence verification, and decision workflow.

The current version does not save previous reports. Adding persistence would improve the product, but it was outside the core seven-day scope.

## 17. Limitations

* Research quality depends on the web results and text returned by the search API.
* The agent typically creates 4–5 research queries and collects multiple results per query, but some sources may contain incomplete or truncated content.
* Paywalled pages may not provide enough usable text for evidence extraction.
* Supporting-text verification checks whether the evidence appears in the collected source content; it does not independently prove that every source is authoritative.
* Financial information can change quickly, so a later run may produce different evidence and a different decision.
* The current confidence score measures research coverage and source diversity, not certainty that an investment will perform well.
* Multiple LLM calls increase response time and can hit provider rate limits on free API tiers.
* The project does not currently include stock valuation models, live market prices, portfolio allocation, or historical report storage.

## 18. What I Would Improve With More Time

* Add retry and backoff handling for temporary LLM rate-limit errors.
* Add source-quality weighting so official filings and company investor-relations documents receive more importance than weaker secondary sources.
* Add a persistence layer such as PostgreSQL or MongoDB to save and compare previous research reports.
* Add caching so repeated company searches do not immediately repeat the complete research workflow.
* Run specialized research branches for financials, competition, and risks in parallel to reduce execution time.
* Add historical stock-price and valuation data through a market-data API.
* Add timestamps and evidence freshness indicators to the final report.
* Add automated tests for evidence verification, confidence scoring, and investment decision thresholds.

## 19. Deployment

The application is designed to be deployed with:

* **Backend**: Render
* **Frontend**: Vercel

The production frontend uses `VITE_API_URL` to connect to the deployed backend.

Live links will be added here after deployment.

## 20. Disclaimer

*InvestIQ Agent is an educational portfolio project and AI research tool. It does not provide professional financial advice. The generated output depends on available web evidence and should not be treated as a recommendation to buy or sell securities.*
