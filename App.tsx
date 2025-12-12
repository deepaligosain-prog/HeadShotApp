import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadArea } from './components/UploadArea';
import { ComparisonSlider } from './components/ComparisonSlider';
import { Button } from './components/Button';
import { ChatInterface } from './components/ChatInterface';
import { generateHeadshot, refineHeadshot } from './services/geminiService';
import { BackgroundType, LightingStyle, ClothingStyle, HeadshotSettings } from './types';
import { Wand2, AlertCircle, Settings2, User, Image as ImageIcon, Sun, Sparkles, MessageSquare, History, Trash2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface SavedImage {
  id: string;
  file: File;
  previewUrl: string;
}

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [recentUploads, setRecentUploads] = useState<SavedImage[]>([]);

  const [settings, setSettings] = useState<HeadshotSettings>({
    background: BackgroundType.OFFICE,
    lighting: LightingStyle.SOFT,
    clothing: ClothingStyle.ORIGINAL,
    enhanceFace: true,
  });

  // Manage preview URL lifecycle
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setGeneratedImage(null); // Reset result on new upload
    setError(null);
    setChatMessages([]); // Reset chat

    // Add to recent uploads if unique
    setRecentUploads(prev => {
      // Check for duplicate by name and size to avoid clutter
      const isDuplicate = prev.some(item => item.file.name === file.name && item.file.size === file.size);
      if (isDuplicate) return prev;

      const newImage: SavedImage = {
        id: Date.now().toString(),
        file: file,
        previewUrl: URL.createObjectURL(file)
      };
      
      // Keep last 6 images
      return [newImage, ...prev].slice(0, 6);
    });
  };

  const handleSelectRecent = (saved: SavedImage) => {
    setSelectedFile(saved.file);
    setGeneratedImage(null);
    setError(null);
    setChatMessages([]);
  };

  const handleDeleteRecent = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setRecentUploads(prev => prev.filter(item => item.id !== id));
  };

  const handleClear = () => {
    setSelectedFile(null);
    setGeneratedImage(null);
    setError(null);
    setChatMessages([]);
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setIsGenerating(true);
    setError(null);
    setChatMessages([]);

    try {
      const result = await generateHeadshot(selectedFile, settings);
      setGeneratedImage(result);
      setChatMessages([{
        id: 'init',
        role: 'assistant',
        text: 'I have generated your professional headshot based on your settings. Let me know if you would like to make any adjustments!'
      }]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate headshot. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (text: string) => {
    if (!generatedImage) return;

    // Add user message
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text };
    setChatMessages(prev => [...prev, userMsg]);
    setIsRefining(true);
    setError(null);

    try {
      // Call refine service with current generated image and user instruction
      const result = await refineHeadshot(generatedImage, text);
      
      setGeneratedImage(result);
      
      const botMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        text: 'I\'ve updated the headshot based on your feedback.' 
      };
      setChatMessages(prev => [...prev, botMsg]);

    } catch (err: any) {
      console.error(err);
      setError("Failed to refine image. Please try again.");
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Sorry, I encountered an error while processing your request.'
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro */}
        {!selectedFile && !generatedImage && (
          <div className="text-center py-12 max-w-2xl mx-auto">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Turn Selfies into <span className="text-indigo-600">Pro Headshots</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Upload a casual photo and let our AI transform it into a polished professional profile picture in seconds.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Controls & Upload */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upload Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <User className="w-5 h-5 text-indigo-500" />
                 Source Image
               </h3>
               <UploadArea 
                  onFileSelect={handleFileSelect} 
                  selectedFile={selectedFile} 
                  onClear={handleClear}
               />

               {/* Recent Uploads Library */}
               {recentUploads.length > 0 && (
                 <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                      <History className="w-4 h-4" /> Recent Uploads
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {recentUploads.map((saved) => (
                        <div 
                          key={saved.id}
                          onClick={() => handleSelectRecent(saved)}
                          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all group ${
                            selectedFile?.name === saved.file.name && selectedFile?.size === saved.file.size
                              ? 'border-indigo-600 ring-1 ring-indigo-600' 
                              : 'border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <img src={saved.previewUrl} alt="Recent" className="w-full h-full object-cover" />
                          <button 
                            onClick={(e) => handleDeleteRecent(e, saved.id)}
                            className="absolute top-0.5 right-0.5 bg-black/50 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                 </div>
               )}
            </div>

            {/* Settings Section (Only visible if file selected) */}
            {selectedFile && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-indigo-500" />
                    Configuration
                  </h3>
                </div>

                {/* Background Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Background
                  </label>
                  <select 
                    className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={settings.background}
                    onChange={(e) => setSettings({...settings, background: e.target.value as BackgroundType})}
                  >
                    {Object.values(BackgroundType).map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                {/* Lighting Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Sun className="w-4 h-4" /> Lighting
                  </label>
                  <select 
                    className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={settings.lighting}
                    onChange={(e) => setSettings({...settings, lighting: e.target.value as LightingStyle})}
                  >
                    {Object.values(LightingStyle).map((style) => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>

                {/* Clothing Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Clothing Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(ClothingStyle).map((style) => (
                      <button
                        key={style}
                        onClick={() => setSettings({...settings, clothing: style})}
                        className={`text-xs p-2 rounded-lg border text-left transition-all ${
                          settings.clothing === style 
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                         {style.split(' ')[0]}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center justify-between py-2">
                  <label className="text-sm font-medium text-slate-700">Enhance Face Details</label>
                  <button 
                    onClick={() => setSettings({...settings, enhanceFace: !settings.enhanceFace})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.enhanceFace ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enhanceFace ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button 
                    className="w-full py-3 text-lg shadow-md hover:shadow-lg transition-all" 
                    onClick={handleGenerate}
                    isLoading={isGenerating}
                    icon={<Wand2 className="w-5 h-5" />}
                  >
                    {isGenerating ? 'Generating...' : generatedImage ? 'Regenerate' : 'Generate Headshot'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Result / Placeholder / Chat */}
          <div className="lg:col-span-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <h3 className="font-bold text-slate-900 flex items-center gap-2">
                   <Sparkles className="w-4 h-4 text-purple-500" />
                   Result Preview
                 </h3>
                 {generatedImage && (
                   <span className="text-xs font-mono text-slate-400">1024x1024px • PNG</span>
                 )}
              </div>
              
              <div className="flex-1 p-1 bg-slate-100/50 relative flex flex-col">
                {generatedImage && previewUrl ? (
                  <ComparisonSlider beforeImage={previewUrl} afterImage={generatedImage} />
                ) : (
                  <div className="h-full min-h-[450px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                    {isGenerating ? (
                      <div className="flex flex-col items-center animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                           <Loader />
                        </div>
                        <p className="text-slate-600 font-medium">Processing your photo...</p>
                        <p className="text-slate-400 text-sm mt-1">Applying professional lighting & style</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                          <ImageIcon className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="text-lg font-medium text-slate-500">No headshot generated yet</p>
                        <p className="text-sm text-slate-400 mt-2 max-w-sm text-center">
                          Upload a photo and configure your settings on the left to create your professional profile picture.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Chat Interface - Only visible when we have a result */}
            {generatedImage && (
               <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                    AI Refinement Chat
                  </h3>
                  <ChatInterface 
                    messages={chatMessages} 
                    onSendMessage={handleRefine} 
                    isLoading={isRefining}
                  />
                  <div className="mt-2 text-xs text-slate-400 text-center">
                    Ask for specific changes like "Fix the lighting on my left side" or "Make me look slightly more serious".
                  </div>
               </div>
            )}
          </div>

        </div>
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} ProHeadshot Gen. Powered by Google Gemini Nano Banana.</p>
        </div>
      </footer>
    </div>
  );
};

// Simple internal loader for the generating state
const Loader = () => (
  <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default App;