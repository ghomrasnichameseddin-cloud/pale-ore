import React, { useState } from 'react';
import { usePOS } from '../POSContext';
import { 
  Settings, Download, Upload, RotateCcw, AlertTriangle, 
  Check, ShieldAlert, Award, Cloud, CloudOff, RefreshCw,
  Lock, Mail, User, Key, LogIn, UserPlus, LogOut, Chrome
} from 'lucide-react';

export const SystemView: React.FC = () => {
  const { 
    state, exportData, importData, resetAllData, resetLevelAndXp, 
    clearAllQuests, resetBaselineAttributes, updateAttributeBase, 
    getAttributes, user, authLoading, cloudSyncStatus,
    signUpWithEmail, signInWithEmail, signInWithGoogle,
    linkAccountWithEmail, linkAccountWithGoogle, signOutUser
  } = usePOS();

  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [showLevelResetConfirm, setShowLevelResetConfirm] = useState(false);
  const [showQuestsResetConfirm, setShowQuestsResetConfirm] = useState(false);
  const [showAttrResetConfirm, setShowAttrResetConfirm] = useState(false);

  // Cloud auth forms state
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authAction, setAuthAction] = useState<'login' | 'register' | 'link'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Handle export click
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportData());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pale_ore_pos_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle auth submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setFormSubmitting(true);

    try {
      if (authAction === 'login') {
        await signInWithEmail(email, password);
        setAuthSuccess('Successfully authenticated! Synchronizing your cloud data...');
        setTimeout(() => {
          setShowAuthForm(false);
          setEmail('');
          setPassword('');
          setDisplayName('');
          setAuthSuccess('');
        }, 2000);
      } else if (authAction === 'register') {
        await signUpWithEmail(email, password, displayName);
        setAuthSuccess('Account registered successfully! Your data is secure on the cloud.');
        setTimeout(() => {
          setShowAuthForm(false);
          setEmail('');
          setPassword('');
          setDisplayName('');
          setAuthSuccess('');
        }, 2000);
      } else if (authAction === 'link') {
        await linkAccountWithEmail(email, password, displayName);
        setAuthSuccess('Account successfully upgraded! Your offline progress is permanently stored.');
        setTimeout(() => {
          setShowAuthForm(false);
          setEmail('');
          setPassword('');
          setDisplayName('');
          setAuthSuccess('');
        }, 2000);
      }
    } catch (err: any) {
      let friendlyError = err?.message || 'Authentication operation failed.';
      if (err?.code === 'auth/email-already-in-use') {
        friendlyError = 'This email is already in use. Please try logging in instead.';
      } else if (err?.code === 'auth/invalid-credential') {
        friendlyError = 'Invalid email or password combination.';
      } else if (err?.code === 'auth/weak-password') {
        friendlyError = 'Password must be at least 6 characters.';
      } else if (err?.code === 'auth/credential-already-in-use') {
        friendlyError = 'This email is already linked to another user account.';
      }
      setAuthError(friendlyError);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleGoogleAuth = async (action: 'login' | 'link') => {
    setAuthError('');
    setAuthSuccess('');
    setFormSubmitting(true);
    try {
      if (action === 'login') {
        await signInWithGoogle();
        setAuthSuccess('Successfully authenticated with Google! Synchronizing your cloud data...');
      } else {
        await linkAccountWithGoogle();
        setAuthSuccess('Account successfully linked to Google! Your offline progress is permanently stored.');
      }
      setTimeout(() => {
        setShowAuthForm(false);
        setAuthSuccess('');
      }, 2000);
    } catch (err: any) {
      let friendlyError = err?.message || 'Google Authentication operation failed.';
      if (err?.code === 'auth/popup-blocked') {
        friendlyError = 'Pop-up blocked. Please open this application in a New Tab (top right corner button of the frame) to authenticate via Google popup.';
      } else if (err?.code === 'auth/popup-closed-by-user') {
        friendlyError = 'Sign-in pop-up closed before completion.';
      } else if (err?.code === 'auth/operation-not-allowed') {
        friendlyError = 'Google Sign-In is not enabled. If you have admin access, enable Google Provider in your Firebase Console (Authentication > Sign-in method). Otherwise, try Registering / Logging in with Email.';
      }
      setAuthError(friendlyError);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle JSON Import
  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJson.trim()) return;

    const success = importData(importJson);
    if (success) {
      setImportStatus('success');
      setImportJson('');
      setTimeout(() => setImportStatus('idle'), 3000);
    } else {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 4000);
    }
  };

  // Factory reset
  const handleReset = () => {
    resetAllData();
    setShowResetWarning(false);
  };

  const currentAttributes = getAttributes();

  return (
    <div className="space-y-6" id="system-view-root">
      
      {/* SECTION HEADER */}
      <div className="border-b border-white/5 pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
          <Settings className="h-5 w-5 text-cyan-400" />
          POS SYSTEM OPERATIONS
        </h2>
        <p className="text-xs text-zinc-400 font-mono mt-1">
          CORE_CONTROLS • Direct override controls of the progression database
        </p>
      </div>

      {/* CLOUD SYNCHRONIZATION CONTROL PORTAL */}
      <div className="glass-panel rounded-lg p-6 border border-cyan-500/25 bg-zinc-950/45 shadow-[0_0_20px_rgba(6,182,212,0.03)] space-y-4 relative overflow-hidden animate-fadeIn" id="cloud-sync-portal">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(6,182,212,0.01)_1px,transparent_1px)] bg-[size:100%_4px]" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cloud className="h-4 w-4 text-cyan-400" />
              SECURE CLOUD SYNCHRONIZATION
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">PREVENT_DATA_LOSS • Keeps your operational progress alive across sessions and devices</p>
          </div>

          {/* Sync Status Badge */}
          {authLoading ? (
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-white/5 px-2.5 py-1 rounded">
              <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
              CONNECTING_SECURE_NODE...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {cloudSyncStatus === 'offline' && (
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-rose-400 bg-rose-950/50 border border-rose-500/25 px-2.5 py-1 rounded font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  SYS_LOCAL_ONLY
                </span>
              )}
              {cloudSyncStatus === 'synced' && (
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-500/25 px-2.5 py-1 rounded font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  SYS_ONLINE_SYNCED
                </span>
              )}
              {cloudSyncStatus === 'syncing' && (
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 bg-amber-950/50 border border-amber-500/25 px-2.5 py-1 rounded font-bold">
                  <RefreshCw className="h-3 w-3 animate-spin text-amber-400" />
                  UPLOADING_DUMPLOGS...
                </span>
              )}
              {cloudSyncStatus === 'loading' && (
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-white/10 px-2.5 py-1 rounded">
                  <RefreshCw className="h-3 w-3 animate-spin text-zinc-500" />
                  LOADING_ARCHIVE...
                </span>
              )}
              {cloudSyncStatus === 'error' && (
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-rose-400 bg-rose-950/50 border border-rose-500/25 px-2.5 py-1 rounded font-bold">
                  <CloudOff className="h-3.5 w-3.5" />
                  SYNC_DISRUPTED
                </span>
              )}
            </div>
          )}
        </div>

        {/* Sync Info Body */}
        {!authLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-zinc-950 border border-white/5 rounded-lg space-y-1 md:col-span-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">ACTIVE_CREDENTIAL_STATUS</span>
                <div className="flex items-center gap-2 mt-1">
                  {!user ? (
                    <div className="space-y-1">
                      <span className="text-xs font-sans font-bold text-rose-400 flex items-center gap-1">
                        <ShieldAlert className="h-3.5 w-3.5 animate-pulse" /> Unconnected Session (Local Storage Only)
                      </span>
                      <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                        Your browser is currently blocking Firebase cloud access (typically caused by cookie blocking or security settings in preview iframes). Your progress is currently stored <strong>only on this device</strong>.
                        <span className="text-amber-400 block mt-1 font-bold">⚠️ CRITICAL: Clearing your browser history, cache, or cookies will delete your local progress.</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1">
                        To resolve: Open the application in a <strong>New Tab</strong> (using the link in the top-right of your preview frame) and register an account below to sync securely to the cloud.
                      </p>
                    </div>
                  ) : user.isAnonymous ? (
                    <div className="space-y-1">
                      <span className="text-xs font-sans font-bold text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 animate-pulse" /> Temporary Guest Session
                      </span>
                      <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                        Your progress is currently saved in the cloud under an anonymous index. <strong>WARNING:</strong> If you clear your browser cache, log out, or use another browser/device, you will lose access to this progress! Use the buttons on the right to claim a permanent account.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-xs font-sans font-bold text-cyan-400 flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Fully Secured Account
                      </span>
                      <p className="text-[10px] text-zinc-400 font-sans">
                        Logged in as: <strong className="text-white font-mono">{user.email}</strong> {user.displayName && ` (${user.displayName})`}. Your stats, attributes, and quest matrices are perfectly archived on our cloud server and synchronized instantly.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2">
                {!user ? (
                  <>
                    <button
                      onClick={() => {
                        setAuthAction('register');
                        setShowAuthForm(true);
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="w-full bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono py-2 rounded transition-all uppercase flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      CREATE_NEW_ACCOUNT
                    </button>
                    <button
                      onClick={() => {
                        setAuthAction('login');
                        setShowAuthForm(true);
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="w-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-xs font-mono py-2 rounded transition-all uppercase flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      SIGN_IN_EXISTING
                    </button>
                    <button
                      onClick={() => handleGoogleAuth('login')}
                      className="w-full bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 hover:border-red-500/50 text-red-300 text-xs font-mono py-2 rounded transition-all uppercase flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Chrome className="h-3.5 w-3.5 text-red-400" />
                      SIGN_IN_WITH_GOOGLE
                    </button>
                  </>
                ) : user.isAnonymous ? (
                  <>
                    <button
                      onClick={() => {
                        setAuthAction('link');
                        setShowAuthForm(true);
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="w-full bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono py-2 rounded transition-all uppercase flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      UPGRADE_TO_EMAIL_AUTH
                    </button>
                    <button
                      onClick={() => {
                        setAuthAction('login');
                        setShowAuthForm(true);
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="w-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-xs font-mono py-2 rounded transition-all uppercase flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      SIGN_IN_EXISTING
                    </button>
                    <button
                      onClick={() => handleGoogleAuth('link')}
                      className="w-full bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 hover:border-red-500/50 text-red-300 text-xs font-mono py-2 rounded transition-all uppercase flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Chrome className="h-3.5 w-3.5 text-red-400" />
                      LINK_WITH_GOOGLE
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    {showSignOutConfirm ? (
                      <div className="bg-rose-950/20 border border-rose-500/30 p-2 rounded-lg text-center space-y-2">
                        <span className="text-[9px] font-mono text-rose-400 block">LOSE LOCAL PROGRESS CACHE?</span>
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowSignOutConfirm(false)}
                            className="text-[9px] font-mono text-zinc-400 hover:text-white cursor-pointer"
                          >
                            CANCEL
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await signOutUser();
                              setShowSignOutConfirm(false);
                            }}
                            className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-[9px] font-mono px-2 py-0.5 rounded cursor-pointer"
                          >
                            CONFIRM_LOGOUT
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowSignOutConfirm(true)}
                        className="w-full bg-rose-950/10 hover:bg-rose-950/30 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 text-xs font-mono py-2 rounded transition-all uppercase flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        TERMINATE_SESSION
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* COLLAPSIBLE AUTH FORMS */}
            {showAuthForm && (
              <div className="p-5 bg-zinc-900/60 border border-white/5 rounded-lg space-y-4 animate-fadeIn relative">
                <button
                  onClick={() => setShowAuthForm(false)}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xs font-mono cursor-pointer"
                >
                  [CLOSE_X]
                </button>

                <div className="flex gap-4 border-b border-white/5 pb-2.5">
                  <button
                    onClick={() => { setAuthAction('login'); setAuthError(''); setAuthSuccess(''); }}
                    className={`text-xs font-mono pb-1 border-b-2 transition cursor-pointer ${
                      authAction === 'login' ? 'text-cyan-400 border-cyan-400 font-bold' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                    }`}
                  >
                    1. LOGIN_PORTAL
                  </button>
                  {user?.isAnonymous ? (
                    <button
                      onClick={() => { setAuthAction('link'); setAuthError(''); setAuthSuccess(''); }}
                      className={`text-xs font-mono pb-1 border-b-2 transition cursor-pointer ${
                        authAction === 'link' ? 'text-cyan-400 border-cyan-400 font-bold' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                      }`}
                    >
                      2. UPGRADE_GUEST_SESSION
                    </button>
                  ) : (
                    <button
                      onClick={() => { setAuthAction('register'); setAuthError(''); setAuthSuccess(''); }}
                      className={`text-xs font-mono pb-1 border-b-2 transition cursor-pointer ${
                        authAction === 'register' ? 'text-cyan-400 border-cyan-400 font-bold' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                      }`}
                    >
                      2. CREATE_NEW_ACCOUNT
                    </button>
                  )}
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3 max-w-md">
                  {authAction === 'link' && (
                    <p className="text-[10px] text-cyan-400/80 font-mono italic leading-relaxed">
                      This will convert your current anonymous workspace and transfer all existing achievements, levels, goals, and quest grids to this secure email credential.
                    </p>
                  )}

                  {(authAction === 'register' || authAction === 'link') && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                        <User className="h-3 w-3" /> Display Name / Callsign
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Operator-7"
                        className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@pos-net.com"
                      className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Secure Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-950 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      required
                      minLength={6}
                    />
                  </div>

                  {authError && (
                    <div className="text-[11px] font-mono text-rose-400 bg-rose-950/20 border border-rose-500/20 p-2.5 rounded">
                      <ShieldAlert className="h-3.5 w-3.5 inline mr-1" /> {authError}
                    </div>
                  )}

                  {authSuccess && (
                    <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded">
                      <Check className="h-3.5 w-3.5 inline mr-1" /> {authSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono px-4 py-2 rounded transition-colors uppercase flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {formSubmitting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        PROCESSING_SECURE_CHANNEL...
                      </>
                    ) : (
                      <>
                        <Key className="h-3.5 w-3.5" />
                        {authAction === 'login' ? 'AUTHENTICATE_CREDENTIALS' : authAction === 'link' ? 'UPGRADE_GUEST_ACCOUNT' : 'PROVISION_NEW_ACCOUNT'}
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT PANEL: EXPORT & IMPORT BACKUPS */}
        <div className="glass-panel rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Download className="h-4 w-4 text-cyan-400" />
              BACKUP & DATA OWNERSHIP
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Your progression logs are kept locally in your container browser state.</p>
          </div>

          <div className="space-y-4">
            {/* Export block */}
            <div className="p-4 bg-zinc-950/60 border border-white/5 rounded-lg flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-sans font-bold text-white block">Download Raw Backup</span>
                <span className="text-[10px] font-mono text-zinc-500 block">Saves a complete JSON string of your goals, quests, and levels.</span>
              </div>
              <button 
                onClick={handleExport}
                className="bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono px-3 py-1.5 rounded transition-colors flex items-center gap-1 shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                EXPORT
              </button>
            </div>

            {/* Import block */}
            <form onSubmit={handleImport} className="space-y-3">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">IMPORT_STATE_DATA_DUMP</span>
              <textarea 
                rows={4}
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Paste backup JSON code dump here..."
                className="w-full bg-zinc-950 border border-white/10 rounded p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                required
              />

              <div className="flex justify-between items-center">
                {importStatus === 'success' && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <Check className="h-4 w-4 animate-bounce" /> DATA IMPORTED SUCCESSFULLY
                  </span>
                )}
                {importStatus === 'error' && (
                  <span className="text-xs font-mono text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="h-4 w-4" /> PARSING ERROR: INVALID SCHEMA
                  </span>
                )}
                {importStatus === 'idle' && <span />}

                <button 
                  type="submit"
                  className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-xs font-mono px-4 py-1.5 rounded transition-colors flex items-center gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  IMPORT
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: OVERRIDE BASELINE ATTRIBUTES & RESET */}
        <div className="glass-panel rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-cyan-400" />
              OVERRIDE BASELINE ATTRIBUTES
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Directly calibrate baseline values. The system overlays completed quests automatically.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
            {state.attributes.map((attr) => {
              const fullyCalculated = currentAttributes.find(a => a.id === attr.id);
              return (
                <div key={attr.id} className="p-3 bg-zinc-950 border border-white/5 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-200 font-bold uppercase">{attr.name}</span>
                    <span className="text-cyan-400 font-bold">TOTAL LVL: {fullyCalculated?.level}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase shrink-0">BASE BASELINE:</label>
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      value={attr.level}
                      onChange={(e) => updateAttributeBase(attr.id, Number(e.target.value))}
                      className="w-16 bg-zinc-900 border border-white/10 rounded px-1.5 py-0.5 text-xs text-center text-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* QUICK OVERRIDE CONTROLS */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">SYSTEM_MAINTENANCE_OVERRIDE</span>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Reset Level & XP */}
              <div className="bg-zinc-950 border border-white/5 p-3.5 rounded-lg space-y-3">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">RESET PLAYER PROGRESS</span>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">Wipe completion history to reset Level to 1 and accumulated XP to 0. Active quests persist.</p>
                
                {showLevelResetConfirm ? (
                  <div className="space-y-2 pt-1 border-t border-rose-500/10">
                    <p className="text-[9px] font-mono text-rose-400">ARE YOU ABSOLUTELY SURE?</p>
                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button" 
                        onClick={() => setShowLevelResetConfirm(false)}
                        className="text-[9px] font-mono text-zinc-500"
                      >
                        CANCEL
                      </button>
                      <button 
                        type="button"
                        onClick={() => { resetLevelAndXp(); setShowLevelResetConfirm(false); }}
                        className="bg-rose-950/80 hover:bg-rose-950 border border-rose-500/30 text-rose-300 text-[9px] font-mono px-2 py-0.5 rounded transition-colors"
                      >
                        CONFIRM_RESET
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setShowLevelResetConfirm(true)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-cyan-400 hover:text-cyan-300 text-[10px] font-mono py-1 rounded transition-all"
                  >
                    RESET LEVEL & XP
                  </button>
                )}
              </div>

              {/* Empty Daily Tasks / Quests */}
              <div className="bg-zinc-950 border border-white/5 p-3.5 rounded-lg space-y-3">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">EMPTY DAILY DIRECTIVES</span>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">Immediately empty all active and completed daily quests. Unlinks them from goals & projects.</p>
                
                {showQuestsResetConfirm ? (
                  <div className="space-y-2 pt-1 border-t border-rose-500/10">
                    <p className="text-[9px] font-mono text-rose-400">ARE YOU ABSOLUTELY SURE?</p>
                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button" 
                        onClick={() => setShowQuestsResetConfirm(false)}
                        className="text-[9px] font-mono text-zinc-500"
                      >
                        CANCEL
                      </button>
                      <button 
                        type="button"
                        onClick={() => { clearAllQuests(); setShowQuestsResetConfirm(false); }}
                        className="bg-rose-950/80 hover:bg-rose-950 border border-rose-500/30 text-rose-300 text-[9px] font-mono px-2 py-0.5 rounded transition-colors"
                      >
                        CONFIRM_PURGE
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setShowQuestsResetConfirm(true)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-cyan-400 hover:text-cyan-300 text-[10px] font-mono py-1 rounded transition-all"
                  >
                    EMPTY DAILY TASKS
                  </button>
                )}
              </div>

              {/* Reset Baseline Attributes */}
              <div className="bg-zinc-950 border border-white/5 p-3.5 rounded-lg space-y-3">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">RESET BASELINE ATTRIBUTES</span>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">Reset baseline levels of Strength, Endurance, Focus, etc. to 1. Earned levels from quest history persist.</p>
                
                {showAttrResetConfirm ? (
                  <div className="space-y-2 pt-1 border-t border-rose-500/10">
                    <p className="text-[9px] font-mono text-rose-400">ARE YOU ABSOLUTELY SURE?</p>
                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button" 
                        onClick={() => setShowAttrResetConfirm(false)}
                        className="text-[9px] font-mono text-zinc-500"
                      >
                        CANCEL
                      </button>
                      <button 
                        type="button"
                        onClick={() => { resetBaselineAttributes(); setShowAttrResetConfirm(false); }}
                        className="bg-rose-950/80 hover:bg-rose-950 border border-rose-500/30 text-rose-300 text-[9px] font-mono px-2 py-0.5 rounded transition-colors"
                      >
                        CONFIRM_RESET
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setShowAttrResetConfirm(true)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-cyan-400 hover:text-cyan-300 text-[10px] font-mono py-1 rounded transition-all"
                  >
                    RESET BASE ATTRIBUTES
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* DANGER AREA: RE-ALIGN / RESET */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider">FACTORY_PURGE_ZONE</span>
            
            {showResetWarning ? (
              <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-lg space-y-3">
                <p className="text-xs text-rose-300 font-sans leading-relaxed">
                  <AlertTriangle className="h-4 w-4 inline mr-1 text-rose-400 shrink-0" />
                  CRITICAL PROMPT: This operation immediately clears all local quest statistics, levels, custom goals, and re-seeds default parameters. This action is final and executes immediately.
                </p>
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => setShowResetWarning(false)}
                    className="text-[10px] font-mono text-zinc-400"
                  >
                    ABORT
                  </button>
                  <button 
                    onClick={handleReset}
                    className="bg-rose-950 border border-rose-500/40 text-rose-300 text-[10px] font-mono px-3 py-1 rounded"
                  >
                    EXECUTE_WIPE
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowResetWarning(true)}
                className="w-full bg-rose-950/10 hover:bg-rose-950/30 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 text-xs font-mono py-2 rounded transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                RESTORE FACTORY DEFAULT PARAMETERS
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
