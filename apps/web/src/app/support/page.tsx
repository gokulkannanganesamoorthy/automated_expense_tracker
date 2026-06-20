"use client";

import { MessageSquare, Search, FileText, UserCircle } from "lucide-react";

export default function SupportToolsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Tools</h1>
        <p className="text-gray-500 mt-1">Assist users with transaction disputes and account issues.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lookup Transaction</h2>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Enter Transaction ID or Reference Number..." 
                  className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Search
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Recent Support Tickets</h2>
              <span className="text-sm text-indigo-600 font-medium cursor-pointer">View All</span>
            </div>
            <div className="divide-y divide-gray-100">
              <TicketRow 
                id="TKT-8492" 
                user="Alice Smith" 
                subject="Double charge on my HDFC card" 
                status="open" 
                time="2 hrs ago" 
              />
              <TicketRow 
                id="TKT-8491" 
                user="Bob Johnson" 
                subject="How do I export data?" 
                status="resolved" 
                time="1 day ago" 
              />
              <TicketRow 
                id="TKT-8490" 
                user="Charlie Davis" 
                subject="App crashing on launch (iOS)" 
                status="investigating" 
                time="2 days ago" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors text-left">
                <MessageSquare className="h-4 w-4 text-indigo-600" />
                Send Global Announcement
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors text-left">
                <UserCircle className="h-4 w-4 text-emerald-600" />
                Reset User Password
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors text-left">
                <FileText className="h-4 w-4 text-amber-600" />
                Generate Audit Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketRow({ id, user, subject, status, time }: any) {
  const statusColors: Record<string, string> = {
    open: 'bg-red-100 text-red-700',
    investigating: 'bg-amber-100 text-amber-700',
    resolved: 'bg-emerald-100 text-emerald-700'
  };

  return (
    <div className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
      <div className="flex gap-4 items-center">
        <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
          <UserCircle className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-500">{id}</span>
            <span className="text-sm font-medium text-gray-900">{subject}</span>
          </div>
          <div className="text-xs text-gray-500">
            From <span className="font-medium text-gray-700">{user}</span> • {time}
          </div>
        </div>
      </div>
      <div className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[status]}`}>
        {status}
      </div>
    </div>
  );
}
