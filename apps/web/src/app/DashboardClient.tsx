"use client";

import { Users, CreditCard, Activity, ArrowUpRight, ArrowDownRight, CheckCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: 'Mon', active: 4000, new: 2400 },
  { name: 'Tue', active: 3000, new: 1398 },
  { name: 'Wed', active: 2000, new: 9800 },
  { name: 'Thu', active: 2780, new: 3908 },
  { name: 'Fri', active: 1890, new: 4800 },
  { name: 'Sat', active: 2390, new: 3800 },
  { name: 'Sun', active: 3490, new: 4300 },
];

interface DashboardClientProps {
  activeUsers: string;
  totalTransactions: string;
  avgConfidence: string;
}

export default function DashboardClient({ activeUsers, totalTransactions, avgConfidence }: DashboardClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Platform overview and key metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Daily Active Users" 
          value={activeUsers} 
          trend="+12%" 
          isPositive={true} 
          icon={Users} 
        />
        <MetricCard 
          title="Parsed Transactions" 
          value={totalTransactions} 
          trend="+8%" 
          isPositive={true} 
          icon={Activity} 
        />
        <MetricCard 
          title="Avg Confidence Score" 
          value={avgConfidence} 
          trend="+1.2%" 
          isPositive={true} 
          icon={CheckCircle} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="active" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">System Health</h2>
          
          <div className="space-y-6 flex-1">
            <HealthIndicator name="API Services" status="operational" />
            <HealthIndicator name="Firebase Sync" status="operational" />
            <HealthIndicator name="SMS Parser Queue" status="operational" />
            <HealthIndicator name="Cloud Functions" status="degraded" />
          </div>
          
          <button className="w-full mt-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200">
            View Detailed Logs
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, isPositive, icon: Icon }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Icon className="h-6 w-6 text-indigo-600" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          {trend}
        </div>
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function HealthIndicator({ name, status }: { name: string, status: 'operational' | 'degraded' | 'down' }) {
  const colors = {
    operational: 'bg-emerald-500',
    degraded: 'bg-amber-500',
    down: 'bg-red-500'
  };
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{name}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 capitalize">{status}</span>
        <div className={`w-2 h-2 rounded-full ${colors[status]} ring-4 ${colors[status].replace('500', '100')}`}></div>
      </div>
    </div>
  );
}
