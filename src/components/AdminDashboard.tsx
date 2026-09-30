import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Folder, FolderOpen, ClipboardCheck, CheckSquare, Bell,
  Plus, Search, RefreshCw, ChevronDown, ChevronRight, ChevronLeft,
  LayoutDashboard, FolderGit2, Brain, Cpu, Briefcase, Settings,
  Shield, ShieldCheck, AlertTriangle, X, Check, Filter, ExternalLink,
  Info, Tag, Lock, Users, Calendar, ArrowUpDown, Menu,
  Clock, Hash, FileText, CheckCircle2, ShieldAlert, LogOut
} from 'lucide-react';
import { useStore } from '../store';
import { Case, Task, InvestigationStatus } from '../types';
import { GlobalAccountDirectory } from './GlobalAccountDirectory';

export default function AdminDashboard() {
  const { cases, tasks, addCase, currentUser } = useStore();
  const navigate = useNavigate();

  // Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Time & Refresh State
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Table Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('lastUpdate');
  const [sortAsc, setSortAsc] = useState(false);

  // Create Case Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customer, setCustomer] = useState('INTERPOL EC3');
  const [caseName, setCaseName] = useState('');
  const [caseTemplate, setCaseTemplate] = useState('Standard Incident Response');
  const [classification, setClassification] = useState('TLP:RED (Strictly Confidential)');
  const [shortDescription, setShortDescription] = useState('');
  const [socTicketId, setSocTicketId] = useState('SOC-2026-8841');
  const [formError, setFormError] = useState('');
  const [createSuccessMsg, setCreateSuccessMsg] = useState(false);

  // Local Table Data (Tasks / Attributed items)
  // By default, starts clean with 0 items to faithfully match standard initial state "Showing 0 to 0 of 0 entries"
  // with option to toggle demo tasks
  const [tableTasks, setTableTasks] = useState<any[]>([]);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle Refresh Click
  const handleRefresh = () => {
    setIsRefreshing(true);
    const now = new Date();
    setLastUpdated(now.toTimeString().split(' ')[0]);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Open cases count
  const openCasesCount = cases.filter(c => c.status === InvestigationStatus.OPEN || c.status === 'UNDER_INVESTIGATION').length || 1;
  const totalCasesCount = cases.length || 1;

  // Handle Case Creation
  const handleCreateCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseName.trim() || !customer.trim() || !shortDescription.trim()) {
      setFormError('Please fill in all required fields marked with an asterisk (*).');
      return;
    }

    const newCase: Case = {
      id: `CASE-${String(cases.length + 1).padStart(3, '0')}`,
      caseName: caseName.trim(),
      customerId: customer,
      classification,
      status: InvestigationStatus.OPEN,
      progress: 5,
      fileCount: 0,
      actionBadge: 'HIGH PRIORITY',
      createdAt: Date.now(),
    };

    addCase(newCase);
    setCreateSuccessMsg(true);
    setFormError('');

    // Trigger Notification Email
    fetch('/api/email/notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: currentUser?.email,
        userName: currentUser?.name || 'Admin User',
        badgeId: currentUser?.badgeId || 'ADMIN',
        actionType: 'NEW_CASE_CREATED',
        actionDetails: `A new case was created:\nName: ${newCase.caseName}\nCustomer: ${newCase.customerId}\nClassification: ${newCase.classification}\nDescription: ${shortDescription}`,
        targetId: newCase.id
      })
    }).catch(err => console.warn('Notification email dispatch failed:', err));

    // Reset Form
    setTimeout(() => {
      setCaseName('');
      setShortDescription('');
      setSocTicketId(`SOC-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setCreateSuccessMsg(false);
      setIsCreateModalOpen(false);
    }, 1000);
  };

  // Filter and sort tasks
  const filteredTasks = tableTasks.filter(item => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.case?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalEntries = filteredTasks.length;
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalEntries);
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));

  // Toggle sample demo task for testing
  const handleToggleDemoData = () => {
    if (tableTasks.length === 0) {
      setTableTasks([
        {
          id: 'TSK-101',
          title: 'Memory Enclave Dump Triage',
          description: 'Analyze raw RAM offset 0x4FF80 for injected DLL signatures and hook deviations.',
          status: 'IN_PROGRESS',
          case: 'Operation Chimera [CASE-001]',
          lastUpdate: '2026-08-20 09:14:22',
          tags: 'RAM, Volatility, APT-44'
        },
        {
          id: 'TSK-102',
          title: 'Perimeter Firewall Egress Packet Inspection',
          description: 'Correlate Tor exit node IP 185.220.101.5 with TLS beaconing frequencies.',
          status: 'OPEN',
          case: 'Quantum Exfiltration [CASE-002]',
          lastUpdate: '2026-08-20 10:02:11',
          tags: 'PCAP, NetFlow, C2'
        }
      ]);
    } else {
      setTableTasks([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] font-sans flex flex-col selection:bg-[#2563EB] selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. HEADER NAVIGATION BAR                                                  */}
      {/* ========================================================================= */}
      <header className="h-16 bg-[#0F172A] border-b border-[#334155] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
        {/* Left: FIP Logo Emblem & Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors md:hidden"
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            {/* FIP Emblem */}
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] border border-blue-400/40 flex items-center justify-center shadow-lg shadow-blue-900/30 text-white font-black tracking-wider text-sm">
              <Shield size={20} className="text-white" />
            </div>
            
            <div className="flex flex-col">
              <span className="font-bold text-white tracking-tight text-base sm:text-lg flex items-center gap-2">
                Forensic Investigation Platform
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E293B] text-[#94A3B8] border border-[#334155] hidden sm:inline-block">
                  FIP ENCLAVE
                </span>
              </span>
              <span className="text-[11px] text-[#94A3B8] font-mono -mt-0.5 hidden sm:block">
                Zero-Trust Cryptographic Evidence Core
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions & User Info */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => navigate('/vault')}
            className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="Open WORM Vault & Senior Investigator Desk"
          >
            <ShieldCheck size={16} className="text-amber-400" />
            <span className="whitespace-nowrap font-semibold">★ Forensic Vault</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={18} className="stroke-[2.5]" />
            <span className="whitespace-nowrap font-semibold">+ Create new case</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT                                    */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ======================================================================= */}
        {/* SIDEBAR NAVIGATION                                                      */}
        {/* ======================================================================= */}
        <aside 
          className={`bg-[#0F172A] border-r border-[#334155] flex flex-col justify-between transition-all duration-300 z-20 ${
            isSidebarCollapsed ? 'w-16' : 'w-60'
          }`}
        >
          {/* Main Links */}
          <div className="py-4 px-2 space-y-1">
            
            {/* 1. Home / Dashboard */}
            <button
              onClick={() => setActiveNav('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeNav === 'dashboard'
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
              }`}
              title="Home / Dashboard"
            >
              <LayoutDashboard size={18} className="shrink-0" />
              {!isSidebarCollapsed && <span>Home / Dashboard</span>}
            </button>

            {/* Forensic Vault & Senior Desk Direct Navigation */}
            <button
              onClick={() => navigate('/vault')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 border border-amber-500/30 transition-all cursor-pointer"
              title="Open WORM Vault & Senior Workstation"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="shrink-0 text-amber-400" />
                {!isSidebarCollapsed && <span className="font-bold">★ Forensic Vault</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/50">
                  WORM
                </span>
              )}
            </button>

            {/* 2. Cases */}
            <button
              onClick={() => setActiveNav('cases')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeNav === 'cases'
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
              }`}
              title="Cases"
            >
              <div className="flex items-center gap-3">
                <Folder size={18} className="shrink-0" />
                {!isSidebarCollapsed && <span>Cases</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#1E293B] text-[#94A3B8] border border-[#334155]">
                  {cases.length}
                </span>
              )}
            </button>

            {/* 3. Intelligence */}
            <button
              onClick={() => setActiveNav('intelligence')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeNav === 'intelligence'
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
              }`}
              title="Intelligence"
            >
              <Brain size={18} className="shrink-0" />
              {!isSidebarCollapsed && <span>Intelligence</span>}
            </button>

            {/* 4. OEM Tasks */}
            <button
              onClick={() => setActiveNav('oem-tasks')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeNav === 'oem-tasks'
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
              }`}
              title="OEM Tasks"
            >
              <Cpu size={18} className="shrink-0" />
              {!isSidebarCollapsed && <span>OEM Tasks</span>}
            </button>

            {/* 5. Manage cases */}
            <button
              onClick={() => setActiveNav('manage-cases')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeNav === 'manage-cases'
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
              }`}
              title="Manage cases"
            >
              <Briefcase size={18} className="shrink-0" />
              {!isSidebarCollapsed && <span>Manage cases</span>}
            </button>

            {/* Manage accounts */}
            <button
              onClick={() => setActiveNav('manage-accounts')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeNav === 'manage-accounts'
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
              }`}
              title="Manage accounts"
            >
              <Users size={18} className="shrink-0" />
              {!isSidebarCollapsed && <span>Manage accounts</span>}
            </button>

            {/* 6. Advanced Dropdown */}
            <div className="pt-1">
              <button
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isAdvancedOpen || activeNav.startsWith('advanced')
                    ? 'text-white bg-[#1E293B]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                }`}
                title="Advanced"
              >
                <div className="flex items-center gap-3">
                  <Settings size={18} className="shrink-0" />
                  {!isSidebarCollapsed && <span>Advanced</span>}
                </div>
                {!isSidebarCollapsed && (
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {/* Sub-items */}
              {isAdvancedOpen && !isSidebarCollapsed && (
                <div className="pl-9 pr-2 py-1 space-y-1 text-xs">
                  <button
                    onClick={() => setActiveNav('advanced-audit')}
                    className={`w-full text-left py-1.5 px-2.5 rounded-md transition-colors ${
                      activeNav === 'advanced-audit' ? 'text-white bg-[#2563EB]/40 font-semibold' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                    }`}
                  >
                    Audit Ledger & FRE 902
                  </button>
                  <button
                    onClick={() => setActiveNav('advanced-keys')}
                    className={`w-full text-left py-1.5 px-2.5 rounded-md transition-colors ${
                      activeNav === 'advanced-keys' ? 'text-white bg-[#2563EB]/40 font-semibold' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                    }`}
                  >
                    Cryptographic Keys
                  </button>
                  <button
                    onClick={() => setActiveNav('advanced-enclave')}
                    className={`w-full text-left py-1.5 px-2.5 rounded-md transition-colors ${
                      activeNav === 'advanced-enclave' ? 'text-white bg-[#2563EB]/40 font-semibold' : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                    }`}
                  >
                    Enclave Diagnostics
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Bottom Controls */}
          <div className="p-3 border-t border-[#334155] flex flex-col gap-2">
            <button
              onClick={() => navigate('/')}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-900/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 hover:text-red-300 text-xs font-mono transition-colors ${
                isSidebarCollapsed ? 'px-0' : 'px-2'
              }`}
              title="Exit to Portal"
            >
              <LogOut size={16} />
              {!isSidebarCollapsed && <span>EXIT DASHBOARD</span>}
            </button>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white text-xs font-mono transition-colors hidden md:flex"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {!isSidebarCollapsed && <span>Collapse Sidebar</span>}
            </button>
          </div>
        </aside>

        {/* ======================================================================= */}
        {/* MAIN DASHBOARD CONTENT AREA                                             */}
        {/* ======================================================================= */}
        <main className="flex-1 overflow-y-auto bg-[#0F172A] p-4 sm:p-6 lg:p-8 space-y-6">

          {/* =================================================================== */}
          {/* 3. DASHBOARD METRICS ROW (TOP 5 CARDS)                              */}
          {/* =================================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* Card 1: Cases (open / all) */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 shadow-sm hover:border-[#475569] transition-all flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#94A3B8] leading-tight">
                  Cases (open / all)
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FolderOpen size={17} />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {openCasesCount} / {totalCasesCount}
                </span>
              </div>
            </div>

            {/* Card 2: Attributed open cases */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 shadow-sm hover:border-[#475569] transition-all flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#94A3B8] leading-tight">
                  Attributed open cases
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-700/20 border border-amber-600/40 flex items-center justify-center text-amber-500">
                  <Folder size={17} />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  1
                </span>
              </div>
            </div>

            {/* Card 3: Attributed open tasks */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 shadow-sm hover:border-[#475569] transition-all flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#94A3B8] leading-tight">
                  Attributed open tasks
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ClipboardCheck size={17} />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {tableTasks.length}
                </span>
              </div>
            </div>

            {/* Card 4: Assigned alerts */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 shadow-sm hover:border-[#475569] transition-all flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#94A3B8] leading-tight">
                  Assigned alerts
                </span>
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Bell size={17} />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  0
                </span>
              </div>
            </div>

            {/* Card 5: Assigned tasks */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 shadow-sm hover:border-[#475569] transition-all flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#94A3B8] leading-tight">
                  Assigned tasks
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <CheckSquare size={17} />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  0
                </span>
              </div>
            </div>

          </div>

          {/* =================================================================== */}
          {/* 4. DYNAMIC TABLE CONTENT (TASKS OR ACCOUNTS)                        */}
          {/* =================================================================== */}
          {activeNav === 'manage-accounts' ? (
            <GlobalAccountDirectory />
          ) : (
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl shadow-md overflow-hidden">
              
              {/* Header: Title, Last updated, Refresh */}
            <div className="p-4 sm:p-5 border-b border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1E293B]">
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">
                  Attributed open tasks
                </h2>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#94A3B8] font-mono">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-[#94A3B8]" />
                  Last updated: <strong className="text-white font-mono">{lastUpdated || '10:43:03'}</strong>
                </span>

                <button
                  onClick={handleRefresh}
                  className="px-3 py-1.5 rounded-lg bg-[#0F172A] border border-[#334155] hover:border-[#475569] text-white hover:text-blue-400 font-sans text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-blue-400' : ''} />
                  <span>Refresh</span>
                </button>

                {/* Optional toggle demo rows helper for testing */}
                <button
                  onClick={handleToggleDemoData}
                  className="text-[11px] text-[#94A3B8] hover:text-blue-300 underline font-sans ml-1"
                  title="Toggle between Empty state and Sample Tasks state"
                >
                  {tableTasks.length === 0 ? 'Load sample rows' : 'Clear rows'}
                </button>
              </div>
            </div>

            {/* Table Controls: Length Dropdown & Search Input */}
            <div className="p-4 border-b border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#94A3B8] bg-[#1A2333]">
              {/* Show Entries Selector */}
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#0F172A] border border-[#334155] rounded-md px-2 py-1 text-white text-xs focus:outline-none focus:border-[#2563EB]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries</span>
              </div>

              {/* Search Box */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">Search:</span>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder=""
                    className="bg-[#0F172A] border border-[#334155] rounded-md px-3 py-1.5 text-white text-xs w-48 sm:w-60 focus:outline-none focus:border-[#2563EB] placeholder-[#64748B]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#334155] bg-[#0F172A]/70 text-[#94A3B8] font-semibold select-none">
                    <th 
                      onClick={() => {
                        setSortField('title');
                        setSortAsc(!sortAsc);
                      }}
                      className="p-3.5 pl-4 cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Title</span>
                        <ArrowUpDown size={12} className="text-[#64748B]" />
                      </div>
                    </th>
                    <th 
                      onClick={() => {
                        setSortField('description');
                        setSortAsc(!sortAsc);
                      }}
                      className="p-3.5 cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Description</span>
                        <ArrowUpDown size={12} className="text-[#64748B]" />
                      </div>
                    </th>
                    <th 
                      onClick={() => {
                        setSortField('status');
                        setSortAsc(!sortAsc);
                      }}
                      className="p-3.5 cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                        <ArrowUpDown size={12} className="text-[#64748B]" />
                      </div>
                    </th>
                    <th 
                      onClick={() => {
                        setSortField('case');
                        setSortAsc(!sortAsc);
                      }}
                      className="p-3.5 cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Case</span>
                        <ArrowUpDown size={12} className="text-[#64748B]" />
                      </div>
                    </th>
                    <th 
                      onClick={() => {
                        setSortField('lastUpdate');
                        setSortAsc(!sortAsc);
                      }}
                      className="p-3.5 cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Last update</span>
                        <ArrowUpDown size={12} className="text-[#64748B]" />
                      </div>
                    </th>
                    <th className="p-3.5 pr-4">
                      <span>Tags</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#334155]/60 text-[#F8FAFC]">
                  {filteredTasks.length === 0 ? (
                    /* Exact Empty State */
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#94A3B8] font-normal text-xs bg-[#1E293B]">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-[#0F172A]/40 transition-colors">
                        <td className="p-3.5 pl-4 font-semibold text-white">
                          {item.title}
                        </td>
                        <td className="p-3.5 text-[#94A3B8] max-w-xs truncate">
                          {item.description}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-900/40 text-blue-300 border border-blue-500/30">
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-blue-400 font-medium">
                          {item.case}
                        </td>
                        <td className="p-3.5 text-[#94A3B8] font-mono">
                          {item.lastUpdate}
                        </td>
                        <td className="p-3.5 pr-4">
                          <span className="text-[11px] text-[#94A3B8] bg-[#0F172A] px-2 py-0.5 rounded border border-[#334155]">
                            {item.tags}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls & Entries Info */}
            <div className="p-4 border-t border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#94A3B8] bg-[#1E293B]">
              <div>
                <span>
                  Showing {startIndex} to {endIndex} of {totalEntries} entries
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md border border-[#334155] bg-[#0F172A] text-[#94A3B8] disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-[#1E293B] hover:enabled:text-white transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1 px-1">
                  <span className="w-7 h-7 flex items-center justify-center rounded-md bg-[#2563EB] text-white font-medium text-xs">
                    {currentPage}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages || totalEntries === 0}
                  className="px-3 py-1.5 rounded-md border border-[#334155] bg-[#0F172A] text-[#94A3B8] disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-[#1E293B] hover:enabled:text-white transition-colors"
                >
                  Next
                </button>
              </div>
            </div>

          </div>

          )}

          {/* Optional Cases Quick Directory if user navigates to Cases tab */}
          {activeNav === 'cases' && (
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-base">Active Enclave Cases</h3>
                <span className="text-xs text-[#94A3B8]">{cases.length} Registered</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cases.map((c) => (
                  <div key={c.id} className="p-4 rounded-lg bg-[#0F172A] border border-[#334155] space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono font-bold text-blue-400">{c.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-mono">
                        {c.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-white text-sm">{c.caseName}</h4>
                    <p className="text-xs text-[#94A3B8]">{c.customerId} • {c.classification}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* 5. "CREATE A NEW CASE" MODAL OVERLAY                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl bg-[#1E293B] border border-[#334155] rounded-xl shadow-2xl overflow-hidden z-10 text-[#F8FAFC]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-[#334155] flex items-center justify-between bg-[#1E293B]">
                <h3 className="text-lg font-semibold text-white tracking-tight">
                  Create a new case
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#334155] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Notice Banner */}
              <div className="mx-6 mt-4 p-3.5 rounded-lg bg-[#0F172A] border border-[#334155] flex items-start gap-3 text-xs text-[#94A3B8]">
                <Info size={16} className="text-[#2563EB] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Fields with an asterisk are required. Access to the case can be granted to other users once the case is created.
                </p>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateCaseSubmit} className="p-6 space-y-4 text-xs">
                
                {/* Form Error or Success Feedback */}
                {formError && (
                  <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0 text-red-400" />
                    <span>{formError}</span>
                  </div>
                )}

                {createSuccessMsg && (
                  <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                    <span>Case successfully created and registered in the FIP ledger!</span>
                  </div>
                )}

                {/* 1. Select customer * */}
                <div className="space-y-1.5">
                  <label className="block font-medium text-white">
                    Select customer <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-[#334155] text-white focus:outline-none focus:border-[#2563EB] transition-colors"
                  >
                    <option value="INTERPOL EC3">INTERPOL EC3 (Cyber Fusion Enclave)</option>
                    <option value="Global Intelligence Agency">Global Intelligence Agency</option>
                    <option value="FinCEN Enforcement">FinCEN Digital Forensics</option>
                    <option value="Cyber Defense Command">Cyber Defense Command (CERT-EU)</option>
                    <option value="Quantum Securities Enclave">Quantum Securities Enclave</option>
                  </select>
                </div>

                {/* 2. Case name * */}
                <div className="space-y-1.5">
                  <label className="block font-medium text-white">
                    Case name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={caseName}
                    onChange={(e) => setCaseName(e.target.value)}
                    placeholder="Enter case name..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-[#334155] text-white placeholder-[#64748B] focus:outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>

                {/* 3. Select case template */}
                <div className="space-y-1.5">
                  <label className="block font-medium text-white">
                    Select case template
                  </label>
                  <select
                    value={caseTemplate}
                    onChange={(e) => setCaseTemplate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-[#334155] text-white focus:outline-none focus:border-[#2563EB] transition-colors"
                  >
                    <option value="Standard Incident Response">Standard Incident Response</option>
                    <option value="Ransomware & Extortion Triage">Ransomware & Extortion Triage</option>
                    <option value="Insider Threat & Exfiltration">Insider Threat & Exfiltration</option>
                    <option value="Cryptographic Memory Forensics">Cryptographic Memory Forensics</option>
                    <option value="Cloud WORM Audit & Chain of Custody">Cloud WORM Audit & Chain of Custody</option>
                  </select>
                </div>

                {/* 4. Select classification */}
                <div className="space-y-1.5">
                  <label className="block font-medium text-white">
                    Select classification
                  </label>
                  <select
                    value={classification}
                    onChange={(e) => setClassification(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-[#334155] text-white focus:outline-none focus:border-[#2563EB] transition-colors"
                  >
                    <option value="TLP:RED (Strictly Confidential)">TLP:RED (Strictly Confidential)</option>
                    <option value="TLP:AMBER (Restricted Distribution)">TLP:AMBER (Restricted Distribution)</option>
                    <option value="TLP:GREEN (Community Sharing)">TLP:GREEN (Community Sharing)</option>
                    <option value="TOP SECRET // NOFORN">TOP SECRET // NOFORN</option>
                    <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                  </select>
                </div>

                {/* 5. Short description * */}
                <div className="space-y-1.5">
                  <label className="block font-medium text-white">
                    Short description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Provide a brief summary of the incident scope and initial forensic findings..."
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0F172A] border border-[#334155] text-white placeholder-[#64748B] focus:outline-none focus:border-[#2563EB] transition-colors resize-none"
                  />
                </div>

                {/* 6. SOC Ticket ID */}
                <div className="space-y-1.5">
                  <label className="block font-medium text-white">
                    SOC Ticket ID
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 px-2 py-0.5 rounded bg-[#1E293B] text-blue-400 border border-[#334155] font-mono text-[10px] font-bold">
                      TICKET
                    </span>
                    <input
                      type="text"
                      value={socTicketId}
                      onChange={(e) => setSocTicketId(e.target.value)}
                      placeholder="e.g. SOC-2026-8841"
                      className="w-full pl-20 pr-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-[#334155] text-white placeholder-[#64748B] focus:outline-none focus:border-[#2563EB] transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-[#334155] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-[#334155] bg-[#0F172A] hover:bg-[#334155] text-[#94A3B8] hover:text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus size={16} className="stroke-[2.5]" />
                    <span>Create</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
