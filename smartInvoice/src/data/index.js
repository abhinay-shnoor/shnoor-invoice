import {
  FileText, Receipt, ScanLine, Brain, TrendingUp, Shield,
  Users, Clock, DollarSign, Award, BarChart3,
  Building2, CalendarCheck, Wallet, Star,
  Zap, Globe, Lock, Activity,
  MessageSquare, BookOpen, Layers
} from 'lucide-react'

export const products = [
  {
    id: 'invoice',
    label: 'Primary',
    icon: Receipt,
    title: 'Smart Invoice & Expense Management',
    tagline: 'End-to-end financial operations in one place',
    description:
      'Automate invoice generation, GST compliance, OCR bill scanning, and AI-driven expense analytics — built for teams that move fast.',
    color: 'blue',
    gradient: 'from-blue-500/20 to-violet-500/10',
    border: 'border-blue-500/30',
    accent: 'text-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    features: [
      { icon: FileText, text: 'Professional invoice generation' },
      { icon: Receipt, text: 'GST automation & compliance' },
      { icon: ScanLine, text: 'OCR bill scanning' },
      { icon: Brain, text: 'AI expense insights' },
      { icon: TrendingUp, text: 'Real-time expense tracking' },
      { icon: Shield, text: 'PDF export & audit trail' },
    ],
    href: '#cta',
    cta: 'Explore Invoice Suite',
    prominent: true,
  },
  {
    id: 'hrms',
    label: 'HR Platform',
    icon: Users,
    title: 'HRMS Platform',
    tagline: 'People operations, simplified',
    description:
      'Manage your entire workforce — attendance, payroll, leaves, and performance — from a single unified dashboard.',
    color: 'emerald',
    gradient: 'from-emerald-500/15 to-teal-500/10',
    border: 'border-emerald-500/25',
    accent: 'text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    features: [
      { icon: Users, text: 'Employee lifecycle management' },
      { icon: Clock, text: 'Attendance & shift tracking' },
      { icon: DollarSign, text: 'Payroll processing' },
      { icon: CalendarCheck, text: 'Leave management' },
      { icon: Award, text: 'Performance reviews' },
    ],
    href: 'https://hrms-frontend-8gic.onrender.com/',
    cta: 'Explore HRMS',
    prominent: false,
  },
  {
    id: 'workspace',
    label: 'Workspace',
    icon: Building2,
    title: 'Workspace Management',
    tagline: 'Intelligent space & team coordination',
    description:
      'Book workspaces, coordinate teams, manage tasks and resources — everything your modern office needs in one platform.',
    color: 'violet',
    gradient: 'from-violet-500/15 to-purple-500/10',
    border: 'border-violet-500/25',
    accent: 'text-violet-400',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    features: [
      { icon: MessageSquare, text: 'Team collaboration hub' },
      { icon: BookOpen, text: 'Workspace booking system' },
      { icon: Layers, text: 'Task & project management' },
      { icon: Activity, text: 'Internal communication' },
      { icon: BarChart3, text: 'Resource utilization tracking' },
    ],
    href: 'https://shnoor.vercel.app',
    cta: 'Explore Workspace',
    prominent: false,
  },
]

export const features = [
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Machine learning models surface spending patterns, anomalies, and savings opportunities automatically.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: ScanLine,
    title: 'OCR Automation',
    description: 'Upload any bill or receipt — our OCR engine extracts vendor, amount, and date with 98%+ accuracy.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Receipt,
    title: 'GST Calculation',
    description: 'Auto-compute CGST, SGST, IGST. Generate GST-compliant invoices with one click.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Shield,
    title: 'Secure Role Access',
    description: 'Granular RBAC ensures the right people access the right data — with full audit logs.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Live dashboards with revenue trends, expense breakdowns, and KPI tracking across all teams.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
  },
  {
    icon: Globe,
    title: 'Cloud-Based Access',
    description: 'Access your platform from anywhere. 99.9% uptime SLA backed by enterprise-grade infrastructure.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
]

export const workflowSteps = [
  { step: '01', title: 'Add Products', description: 'Configure your product catalog and services in minutes', icon: Layers },
  { step: '02', title: 'Create Invoice', description: 'Generate professional invoices with auto-filled client data', icon: FileText },
  { step: '03', title: 'GST Calculation', description: 'Taxes computed automatically based on transaction type', icon: Receipt },
  { step: '04', title: 'Generate PDF', description: 'Branded, ready-to-send PDF invoices with one click', icon: Zap },
  { step: '05', title: 'Upload Bills', description: 'Drag and drop expense receipts in any format', icon: ScanLine },
  { step: '06', title: 'OCR Processing', description: 'Data extracted instantly — no manual entry needed', icon: Brain },
  { step: '07', title: 'Expense Analytics', description: 'Categorized, visualized, ready for review', icon: BarChart3 },
  { step: '08', title: 'AI Insights', description: 'Actionable recommendations from your financial data', icon: Activity },
]

export const stats = [
  { value: 10000, suffix: '+', label: 'Invoices Processed', prefix: '' },
  { value: 500, suffix: '+', label: 'Businesses Onboarded', prefix: '' },
  { value: 98, suffix: '%', label: 'OCR Accuracy Rate', prefix: '' },
  { value: 50, suffix: 'L+', label: 'Expenses Tracked', prefix: '₹' },
]

export const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'CFO, NovaTech Solutions',
    avatar: 'PS',
    color: 'bg-blue-500',
    quote:
      'Shnoor Invoice cut our invoice processing time by 70%. The GST automation alone saves us 20+ hours a month. It\'s the backbone of our financial operations now.',
    rating: 5,
  },
  {
    name: 'Rahul Mehta',
    role: 'Operations Head, Kiran Retail',
    avatar: 'RM',
    color: 'bg-emerald-500',
    quote:
      'The OCR scanning is remarkably accurate. We handle hundreds of vendor bills weekly and the manual data entry is completely gone. The AI insights caught duplicate charges we\'d been missing for months.',
    rating: 5,
  },
  {
    name: 'Anjali Nair',
    role: 'Co-Founder, Stacklabs',
    avatar: 'AN',
    color: 'bg-violet-500',
    quote:
      'Having invoice management, HRMS, and workspace booking in one ecosystem is a game-changer for a growing startup. Clean UI, fast support, and it just works.',
    rating: 5,
  },
]

export const whyUsPoints = [
  { icon: Zap, title: 'Reduce Manual Work', description: 'Automate repetitive data entry, calculations, and report generation across all departments.' },
  { icon: Receipt, title: 'Improve GST Accuracy', description: '100% compliant GST invoices with built-in validation — zero penalties, zero stress.' },
  { icon: Brain, title: 'Smart Automation', description: 'OCR, AI categorization, and workflow triggers work silently in the background so your team doesn\'t have to.' },
  { icon: BarChart3, title: 'AI-Powered Analytics', description: 'Surface trends and insights that take your accountant hours to compile — available instantly.' },
  { icon: Lock, title: 'Enterprise-Grade Security', description: 'SOC-2 aligned, role-based access, encrypted data at rest and in transit.' },
  { icon: Activity, title: 'Faster Operations', description: 'From invoice creation to payment tracking — complete in seconds, not days.' },
]