import React, { useState, useEffect } from 'react';
import { Database, Zap, Settings, Play, DatabaseZap } from 'lucide-react';

const vscode = acquireVsCodeApi();

export default function App() {
  const [activeTab, setActiveTab] = useState<'connect' | 'generate'>('connect');
  const [connectionUri, setConnectionUri] = useState('mysql://user:pass@localhost:3306/mydb');
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [useAi, setUseAi] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [tableConfigs, setTableConfigs] = useState<Record<string, { selected: boolean, count: number }>>({});

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      switch (message.type) {
        case 'schema_loaded':
          setSchema(message.data);
          const initialConfigs: any = {};
          message.data.tables.forEach((t: any) => {
            initialConfigs[t.name] = { selected: true, count: 100 };
          });
          setTableConfigs(initialConfigs);
          setLoading(false);
          setActiveTab('generate');
          break;
        case 'generation_complete':
          setLoading(false);
          // could show toast or results
          break;
        case 'error':
          setLoading(false);
          console.error(message.error);
          break;
      }
    };
    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, []);

  const handleConnect = () => {
    setLoading(true);
    vscode.postMessage({ type: 'connect', uri: connectionUri });
  };

  const handleGenerate = () => {
    if (!schema) return;
    setLoading(true);
    
    const configsToGenerate = Object.entries(tableConfigs).map(([tableName, cfg]) => ({
      tableName,
      recordCount: cfg.count,
      selected: cfg.selected
    }));

    vscode.postMessage({ 
      type: 'generate', 
      schema, 
      configs: configsToGenerate,
      useAi,
      prompt,
      apiKey
    });
  };

  const handleTableToggle = (tableName: string) => {
    setTableConfigs(prev => ({
      ...prev,
      [tableName]: { ...prev[tableName], selected: !prev[tableName].selected }
    }));
  };

  const handleCountChange = (tableName: string, count: number) => {
    setTableConfigs(prev => ({
      ...prev,
      [tableName]: { ...prev[tableName], count }
    }));
  };

  return (
    <div className="min-h-screen bg-transparent p-6 text-foreground flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-border pb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <DatabaseZap className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data Generator</h1>
            <p className="text-muted-foreground mt-1 text-lg">Intelligent Synthetic Data for VS Code</p>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'connect' && (
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" /> Connect Database
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Connection String (URI)</label>
                <input 
                  type="text" 
                  value={connectionUri}
                  onChange={(e) => setConnectionUri(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  placeholder="mysql://user:pass@localhost:3306/dbname"
                />
              </div>
              <button 
                onClick={handleConnect}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-semibold rounded-lg px-4 py-3 hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect & Analyze Schema'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'generate' && schema && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Table Selection Panel */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" /> Schema Tables
                </h2>
                <div className="space-y-3">
                  {schema.tables.map((table: any) => (
                    <div key={table.name} className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={tableConfigs[table.name]?.selected ?? false}
                          onChange={() => handleTableToggle(table.name)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary"
                        />
                        <span className="font-medium font-mono text-sm">{table.name}</span>
                        <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                          {table.columns.length} cols
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">Rows:</label>
                        <input 
                          type="number" 
                          value={tableConfigs[table.name]?.count ?? 100}
                          onChange={(e) => handleCountChange(table.name, parseInt(e.target.value) || 0)}
                          className="w-24 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Config Panel */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" /> AI Settings
                </h2>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3 border border-primary/20 bg-primary/5 rounded-lg cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={useAi}
                      onChange={(e) => setUseAi(e.target.checked)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">Use Gemini AI (Hybrid)</span>
                      <span className="text-xs text-muted-foreground">Generates contextual seeds before multiplying</span>
                    </div>
                  </label>

                  {useAi && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">Gemini API Key</label>
                        <input 
                          type="password" 
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="AIzaSy..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">Custom Context (Optional)</label>
                        <textarea 
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
                          placeholder="e.g. Generate data for a tech startup in Peru..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground font-semibold rounded-lg px-4 py-3 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <span className="animate-pulse">Generating...</span>
                    ) : (
                      <>
                        <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Generate Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

// Global declaration for acquireVsCodeApi
declare global {
  function acquireVsCodeApi(): any;
}
