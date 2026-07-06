import { useState } from 'react'
import { Search, Loader2, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, Scale, ShieldAlert, BarChart3, Globe } from 'lucide-react'
import { researchCompany } from './services/api'

function App() {
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleResearch = async (e) => {
    e.preventDefault();
    if (!company.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await researchCompany(company);
      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderDecisionHero = () => {
    if (!result) return null;
    
    let bgColor = 'bg-slate-800';
    let icon = <AlertTriangle className="w-12 h-12 text-slate-400" />;
    
    if (result.decision === 'INVEST') {
      bgColor = 'bg-emerald-900/40 border-emerald-500/30';
      icon = <CheckCircle className="w-12 h-12 text-emerald-500" />;
    } else if (result.decision === 'PASS') {
      bgColor = 'bg-red-900/40 border-red-500/30';
      icon = <XCircle className="w-12 h-12 text-red-500" />;
    } else if (result.decision === 'INSUFFICIENT EVIDENCE') {
      bgColor = 'bg-amber-900/40 border-amber-500/30';
      icon = <AlertTriangle className="w-12 h-12 text-amber-500" />;
    }

    return (
      <div className={`rounded-2xl border p-8 mb-8 text-center transition-all ${bgColor}`}>
        <div className="flex justify-center mb-4">{icon}</div>
        <h2 className="text-3xl font-bold mb-2">{result.companyName}</h2>
        <div className="inline-block px-4 py-1 rounded-full bg-black/30 text-xl font-semibold tracking-wider mb-4">
          {result.decision}
        </div>
        
        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-1">Evidence Confidence</div>
            <div className="text-2xl font-bold">{result.confidence}%</div>
          </div>
          {result.overallScore > 0 && (
            <div className="text-center">
              <div className="text-sm text-slate-400 mb-1">Investment Score</div>
              <div className="text-2xl font-bold">{result.overallScore}/10</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-slate-800 bg-surface/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">InvestIQ<span className="text-primary">Agent</span></span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Research before you invest.
          </h1>
          <p className="text-lg text-slate-400 mb-8">
            An evidence-first AI agent that researches companies, analyzes investment signals, and explains its decision.
          </p>

          <form onSubmit={handleResearch} className="relative max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Enter a company (e.g. NVIDIA, Tesla, Microsoft)..."
                className="w-full bg-surface border border-slate-700 rounded-full py-4 pl-12 pr-32 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-lg transition-all"
                disabled={loading}
              />
              <button 
                type="submit"
                disabled={loading || !company.trim()}
                className="absolute right-2 btn btn-primary rounded-full px-6 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="max-w-xl mx-auto card flex flex-col items-center py-12 animate-pulse">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-semibold mb-2">Agent is researching...</h3>
            <p className="text-slate-400 text-center">
              Gathering evidence, analyzing financials, checking risks, and calculating confidence scores. This may take 20-40 seconds.
            </p>
          </div>
        )}

        {/* Results Section */}
        {!loading && result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderDecisionHero()}

            {result.decision !== 'INSUFFICIENT EVIDENCE' && (
              <>
                <div className="card mb-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" /> Investment Thesis
                  </h3>
                  <p className="text-lg text-slate-300 leading-relaxed">{result.investmentThesis}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Scorecard */}
                  <div className="card">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" /> Factor Scorecard
                    </h3>
                    <div className="space-y-6">
                      {Object.entries(result.factorScores || {}).map(([key, data]) => {
                        if (key === 'overallScore') return null;
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        return (
                          <div key={key}>
                            <div className="flex justify-between mb-2">
                              <span className="font-medium text-slate-300">{label}</span>
                              <span className="font-bold">{data.score}/10</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: \`\${data.score * 10}%\` }}
                              ></div>
                            </div>
                            <p className="text-sm text-slate-400">{data.reasoning}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="card border-emerald-900/50 bg-emerald-900/10">
                      <h3 className="text-xl font-bold mb-4 text-emerald-400 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" /> Top Positive Signals
                      </h3>
                      <ul className="space-y-3">
                        {result.positiveSignals?.map((signal, i) => (
                          <li key={i} className="flex gap-3 text-slate-300">
                            <span className="text-emerald-500 mt-1">•</span>
                            <span>{signal}</span>
                          </li>
                        ))}
                        {(!result.positiveSignals || result.positiveSignals.length === 0) && (
                          <li className="text-slate-500 italic">No major positive signals found.</li>
                        )}
                      </ul>
                    </div>

                    <div className="card border-red-900/50 bg-red-900/10">
                      <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" /> Major Risks
                      </h3>
                      <ul className="space-y-3">
                        {result.risks?.map((risk, i) => (
                          <li key={i} className="flex gap-3 text-slate-300">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                        {(!result.risks || result.risks.length === 0) && (
                          <li className="text-slate-500 italic">No critical risks identified.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="card">
                    <h3 className="text-lg font-bold mb-2 text-emerald-400">Bull Case</h3>
                    <p className="text-slate-300">{result.bullCase}</p>
                  </div>
                  <div className="card">
                    <h3 className="text-lg font-bold mb-2 text-red-400">Bear Case</h3>
                    <p className="text-slate-300">{result.bearCase}</p>
                  </div>
                </div>
              </>
            )}

            {/* Sources */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-slate-400" /> Research Sources
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {result.sources?.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-colors border border-slate-700/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-sm text-slate-300 truncate" title={source.title}>{source.title}</span>
                  </a>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}

export default App
