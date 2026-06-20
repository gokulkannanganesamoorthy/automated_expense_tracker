"use client";

import { Server, Database, Cloud, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function SystemHealthPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-500 mt-1">Monitor platform infrastructure and service status.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium border border-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          All Systems Operational
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard name="API Gateway" status="healthy" latency="45ms" uptime="99.99%" icon={Server} />
        <StatusCard name="Firestore DB" status="healthy" latency="12ms" uptime="100%" icon={Database} />
        <StatusCard name="Cloud Functions" status="degraded" latency="850ms" uptime="99.95%" icon={Cloud} />
        <StatusCard name="Auth Service" status="healthy" latency="30ms" uptime="99.99%" icon={Zap} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <h2 className="font-semibold text-gray-900">Recent Incidents</h2>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="p-4 flex gap-4">
            <div className="mt-0.5">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Elevated latency in SMS parsing function</h3>
              <p className="text-gray-500 text-sm mt-1">Investigating reports of delayed transaction syncing from the Android client. The queue is processing but slower than normal.</p>
              <p className="text-xs text-gray-400 mt-2">Today at 10:45 AM • In Progress</p>
            </div>
          </div>
          <div className="p-4 flex gap-4">
            <div className="mt-0.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Database connection pooling issue resolved</h3>
              <p className="text-gray-500 text-sm mt-1">Fixed an issue where stale connections were not being properly recycled, leading to timeouts during peak hours.</p>
              <p className="text-xs text-gray-400 mt-2">Yesterday at 3:15 PM • Resolved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ name, status, latency, uptime, icon: Icon }: any) {
  const isHealthy = status === 'healthy';
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">
          <Icon className="h-6 w-6 text-gray-600" />
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          isHealthy ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          {status}
        </div>
      </div>
      <h3 className="font-medium text-gray-900 mb-4">{name}</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Latency</span>
          <span className="font-medium text-gray-900">{latency}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Uptime (30d)</span>
          <span className="font-medium text-gray-900">{uptime}</span>
        </div>
      </div>
    </div>
  );
}
