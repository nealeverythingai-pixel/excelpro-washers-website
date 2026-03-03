'use client';

import { useState, useEffect } from 'react';
import { HardHat, CheckCircle2, XCircle, Clock, Eye, ChevronDown, ChevronUp, UserCheck, UserX, Shield, FileText, Download } from 'lucide-react';
import { ContractorApplication } from '@/lib/types';
import {
  getContractorApplications,
  getContractors,
  approveApplication,
  rejectApplication,
  toggleContractorActive,
} from './actions';

interface Contractor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  skills?: string[];
  active: boolean;
  completedJobs?: number;
  totalEarnings?: number;
}

export default function ContractorsPage() {
  const [tab, setTab] = useState<'applications' | 'active'>('applications');
  const [applications, setApplications] = useState<ContractorApplication[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apps, ctrs] = await Promise.all([
        getContractorApplications(),
        getContractors(),
      ]);
      setApplications(apps);
      setContractors(ctrs);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this contractor? A login PIN will be generated for them.')) return;
    setActionLoading(id);
    const result = await approveApplication(id);
    if (result.success) {
      await fetchData();
      alert('Contractor approved! Their login PIN has been generated. Check the Active Contractors tab.');
    } else {
      alert(result.error || 'Failed to approve');
    }
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!rejectId) return;
    if (!rejectReason.trim()) { alert('Please provide a reason for rejection'); return; }
    setActionLoading(rejectId);
    const result = await rejectApplication(rejectId, rejectReason);
    if (result.success) {
      setRejectId(null);
      setRejectReason('');
      await fetchData();
    } else {
      alert(result.error || 'Failed to reject');
    }
    setActionLoading(null);
  };

  const handleToggleActive = async (id: string) => {
    setActionLoading(id);
    await toggleContractorActive(id);
    await fetchData();
    setActionLoading(null);
  };

  const statusBadge = (status: ContractorApplication['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const icons = {
      pending: <Clock className="h-3 w-3" />,
      approved: <CheckCircle2 className="h-3 w-3" />,
      rejected: <XCircle className="h-3 w-3" />,
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
        {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const downloadInsurance = (app: ContractorApplication) => {
    const ext = app.insuranceFileName.split('.').pop()?.toLowerCase() || 'pdf';
    const mimeMap: Record<string, string> = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };
    const mime = mimeMap[ext] || 'application/octet-stream';
    const link = document.createElement('a');
    link.href = `data:${mime};base64,${app.insuranceFileData}`;
    link.download = app.insuranceFileName;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HardHat className="h-7 w-7 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contractors</h1>
            <p className="text-sm text-gray-500">Manage applications and active service providers</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab('applications')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'applications' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Applications {pendingCount > 0 && (
            <span className="ml-1.5 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">{pendingCount}</span>
          )}
        </button>
        <button
          onClick={() => setTab('active')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'active' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Active Contractors ({contractors.length})
        </button>
      </div>

      {/* Applications Tab */}
      {tab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p>No contractor applications yet</p>
            </div>
          ) : (
            applications.map(app => (
              <div key={app.id} className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                {/* Summary row */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-sm">
                      {app.firstName[0]}{app.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{app.firstName} {app.lastName}</p>
                      <p className="text-sm text-gray-500">{app.email} · {app.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusBadge(app.status)}
                    <span className="text-xs text-gray-400">{new Date(app.submittedAt).toLocaleDateString()}</span>
                    {expandedApp === app.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded details */}
                {expandedApp === app.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Address</h4>
                        <p className="text-gray-600">{app.address}, {app.city} {app.postalCode}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Emergency Contact</h4>
                        <p className="text-gray-600">{app.emergencyContact} — {app.emergencyPhone}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {app.skills.map(s => (
                            <span key={s} className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Experience & Equipment</h4>
                        <p className="text-gray-600">{app.experience || 'Not specified'} · {app.hasOwnEquipment ? 'Has own equipment' : 'Needs equipment'}</p>
                        {app.vehicleType && <p className="text-gray-600">Vehicle: {app.vehicleType}</p>}
                      </div>
                    </div>

                    {/* Insurance */}
                    <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <h4 className="font-semibold text-blue-800 text-sm">Insurance</h4>
                        </div>
                        <button
                          onClick={() => downloadInsurance(app)}
                          className="flex items-center gap-1 text-xs text-blue-700 hover:underline"
                        >
                          <Download className="h-3 w-3" /> Download Proof
                        </button>
                      </div>
                      <div className="mt-1 text-sm text-blue-700 grid grid-cols-2 gap-2">
                        <p>Provider: <strong>{app.insuranceProvider}</strong></p>
                        <p>Policy: <strong>{app.policyNumber}</strong></p>
                        <p>Expires: <strong>{app.insuranceExpiry}</strong></p>
                        <p>File: {app.insuranceFileName}</p>
                      </div>
                    </div>

                    {/* Agreement */}
                    <div className="text-sm text-gray-600">
                      <p>✅ T&C accepted on {new Date(app.agreedToTermsAt).toLocaleString()}</p>
                      <p>✍️ Signed as: <strong className="font-serif italic">{app.signature}</strong></p>
                    </div>

                    {/* Rejection reason if rejected */}
                    {app.status === 'rejected' && app.rejectionReason && (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        <strong>Rejection Reason:</strong> {app.rejectionReason}
                      </div>
                    )}

                    {/* Actions */}
                    {app.status === 'pending' && (
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={() => handleApprove(app.id)}
                          disabled={actionLoading === app.id}
                          className="flex items-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          <UserCheck className="h-4 w-4" />
                          {actionLoading === app.id ? 'Approving...' : 'Approve'}
                        </button>
                        {rejectId === app.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              placeholder="Reason for rejection..."
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-red-500 focus:ring-red-500"
                            />
                            <button onClick={handleReject} disabled={actionLoading === app.id}
                              className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50">
                              Confirm
                            </button>
                            <button onClick={() => { setRejectId(null); setRejectReason(''); }}
                              className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRejectId(app.id)}
                            className="flex items-center gap-1.5 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                          >
                            <UserX className="h-4 w-4" /> Reject
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Active Contractors Tab */}
      {tab === 'active' && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {contractors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <HardHat className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p>No contractors yet. Approve applications to add contractors.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contractor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Skills</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Jobs</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Earnings</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contractors.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(c.skills || []).slice(0, 3).map(s => (
                          <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{s}</span>
                        ))}
                        {(c.skills || []).length > 3 && (
                          <span className="text-xs text-gray-400">+{c.skills!.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{c.completedJobs || 0}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">${(c.totalEarnings || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {c.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleActive(c.id)}
                        disabled={actionLoading === c.id}
                        className={`text-xs font-medium px-3 py-1 rounded-md ${
                          c.active
                            ? 'text-red-700 border border-red-300 hover:bg-red-50'
                            : 'text-green-700 border border-green-300 hover:bg-green-50'
                        } disabled:opacity-50`}
                      >
                        {c.active ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
