import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { 
  XMarkIcon, 
  ShieldCheckIcon, 
  UsersIcon, 
  CreditCardIcon, 
  CubeIcon, 
  ArrowUpTrayIcon, 
  TrashIcon, 
  CheckIcon, 
} from '@heroicons/react/24/outline';

interface MockUser {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro';
  mockupsCount: number;
  joined: string;
}

interface MockTransaction {
  id: string;
  user: string;
  amount: string;
  date: string;
  status: 'Completed' | 'Pending';
  method: string;
}

interface MockModelItem {
  id: string;
  name: string;
  category: string;
  fileSize: string;
  status: 'Free' | 'Pro';
  active: boolean;
}

export const AdminDashboardModal: React.FC = () => {
  const adminDashboardOpen = useEditorStore((s) => s.adminDashboardOpen);
  const setAdminDashboardOpen = useEditorStore((s) => s.setAdminDashboardOpen);

  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'models'>('models');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample admin datasets
  const [usersList, setUsersList] = useState<MockUser[]>([
    { id: 'usr_01', name: 'Studio Editor', email: 'editorsuite.id@gmail.com', plan: 'pro', mockupsCount: 24, joined: '2026-09-01' },
    { id: 'usr_02', name: 'Rian Pratama', email: 'rian@jerseycustom.co', plan: 'pro', mockupsCount: 88, joined: '2026-08-15' },
    { id: 'usr_03', name: 'Andi Saputra', email: 'andi@streetwear.id', plan: 'free', mockupsCount: 6, joined: '2026-09-12' },
    { id: 'usr_04', name: 'Dimas Creator', email: 'dimas@agency.design', plan: 'pro', mockupsCount: 42, joined: '2026-07-28' },
  ]);

  const [paymentsList] = useState<MockTransaction[]>([
    { id: 'INV-2026-0941', user: 'editorsuite.id@gmail.com', amount: 'Rp 149.000', date: '2026-09-20', status: 'Completed', method: 'BCA Virtual Account' },
    { id: 'INV-2026-0938', user: 'rian@jerseycustom.co', amount: 'Rp 149.000', date: '2026-09-18', status: 'Completed', method: 'GoPay / QRIS' },
    { id: 'INV-2026-0925', user: 'dimas@agency.design', amount: 'Rp 1.490.000', date: '2026-09-15', status: 'Completed', method: 'Credit Card (Annual)' },
  ]);

  const [modelsList, setModelsList] = useState<MockModelItem[]>([
    { id: 'mod_01', name: 'O-Neck Classic Jersey', category: 'T-Shirt', fileSize: '4.2 MB', status: 'Free', active: true },
    { id: 'mod_02', name: 'V-Neck Athletic Jersey', category: 'Jersey', fileSize: '4.8 MB', status: 'Free', active: true },
    { id: 'mod_03', name: 'Polo Performance Jersey', category: 'Polo', fileSize: '5.6 MB', status: 'Pro', active: true },
    { id: 'mod_04', name: 'Long Sleeve Raglan Jersey', category: 'Long Sleeve', fileSize: '6.1 MB', status: 'Pro', active: true },
    { id: 'mod_05', name: 'Streetwear Heavyweight Hoodie', category: 'Hoodie', fileSize: '8.4 MB', status: 'Pro', active: true },
  ]);

  // Form state for uploading a new 3D model
  const [newModelName, setNewModelName] = useState('');
  const [newModelCategory, setNewModelCategory] = useState('Jersey');
  const [newModelStatus, setNewModelStatus] = useState<'Free' | 'Pro'>('Free');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState(false);

  if (!adminDashboardOpen) return null;

  const handleAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName.trim()) return;

    setModelsList([
      ...modelsList,
      {
        id: `mod_${Date.now()}`,
        name: newModelName,
        category: newModelCategory,
        fileSize: '5.2 MB',
        status: newModelStatus,
        active: true,
      },
    ]);

    setNewModelName('');
    setUploadSuccessMessage(true);
    setTimeout(() => setUploadSuccessMessage(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200 font-geist">
      <div className="w-full max-w-4xl bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#222222]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DB0B2B] flex items-center justify-center text-white">
              <ShieldCheckIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-sora">
                Editor Suite Admin Panel
              </h2>
              <p className="text-xs text-[#888888]">
                Sistem Manajemen User, Transaksi & GLTF Model Library
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAdminDashboardOpen(false)}
            className="p-1 rounded-lg text-[#777777] hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#222222] bg-[#121212]">
          <button
            type="button"
            onClick={() => setActiveTab('models')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'models'
                ? 'border-[#DB0B2B] text-white'
                : 'border-transparent text-[#777777] hover:text-[#cccccc]'
            }`}
          >
            <CubeIcon className="w-4 h-4 text-[#DB0B2B]" />
            <span>3D Model Manager ({modelsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'border-[#DB0B2B] text-white'
                : 'border-transparent text-[#777777] hover:text-[#cccccc]'
            }`}
          >
            <UsersIcon className="w-4 h-4 text-[#DB0B2B]" />
            <span>User Management ({usersList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'payments'
                ? 'border-[#DB0B2B] text-white'
                : 'border-transparent text-[#777777] hover:text-[#cccccc]'
            }`}
          >
            <CreditCardIcon className="w-4 h-4 text-[#DB0B2B]" />
            <span>Billing Transactions ({paymentsList.length})</span>
          </button>
        </div>

        {/* Body Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: 3D MODEL MANAGER */}
          {activeTab === 'models' && (
            <div className="space-y-6">
              {/* Upload GLB Form */}
              <div className="p-4 rounded-xl bg-[#181818] border border-[#282828] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-sora">
                    <ArrowUpTrayIcon className="w-4 h-4 text-[#DB0B2B]" />
                    <span>Upload & Daftarkan 3D Model Baru (.GLB / .GLTF)</span>
                  </h3>
                  {uploadSuccessMessage && (
                    <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                      <CheckIcon className="w-3.5 h-3.5" /> Model Berhasil Ditambahkan!
                    </span>
                  )}
                </div>

                <form onSubmit={handleAddModel} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-[#888888] block mb-1">
                      Model Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2026 World Cup Soccer Jersey"
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                      required
                      className="w-full bg-[#1e1e1e] border border-[#2f2f2f] focus:border-[#DB0B2B] rounded-lg px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#888888] block mb-1">
                      Category
                    </label>
                    <select
                      value={newModelCategory}
                      onChange={(e) => setNewModelCategory(e.target.value)}
                      className="w-full bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="Jersey">Jersey</option>
                      <option value="T-Shirt">T-Shirt</option>
                      <option value="Polo">Polo</option>
                      <option value="Hoodie">Hoodie</option>
                      <option value="Sportswear">Sportswear</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#888888] block mb-1">
                      Access Status
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={newModelStatus}
                        onChange={(e) => setNewModelStatus(e.target.value as 'Free' | 'Pro')}
                        className="flex-1 bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="Free">Free</option>
                        <option value="Pro">Pro Only</option>
                      </select>

                      <button
                        type="submit"
                        className="py-2 px-3 rounded-lg bg-[#DB0B2B] hover:bg-[#f01436] text-white text-xs font-bold transition-all shadow-md shadow-[#DB0B2B]/20 shrink-0 cursor-pointer"
                      >
                        Add Model
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Models Table */}
              <div className="border border-[#262626] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181818] text-[#888888] uppercase tracking-wider text-[10px] border-b border-[#262626]">
                    <tr>
                      <th className="p-3">Model Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">File Size</th>
                      <th className="p-3">Access Tier</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222222] bg-[#141414]">
                    {modelsList.map((m) => (
                      <tr key={m.id} className="hover:bg-[#1a1a1a] transition-colors">
                        <td className="p-3 font-medium text-white flex items-center gap-2">
                          <CubeIcon className="w-3.5 h-3.5 text-[#DB0B2B]" />
                          <span>{m.name}</span>
                        </td>
                        <td className="p-3 text-[#aaaaaa]">{m.category}</td>
                        <td className="p-3 font-mono text-[#888888]">{m.fileSize}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.status === 'Pro'
                                ? 'bg-[#DB0B2B]/20 text-[#DB0B2B] border border-[#DB0B2B]/40'
                                : 'bg-[#222222] text-green-400'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setModelsList(modelsList.filter((item) => item.id !== m.id))
                            }
                            className="p-1 hover:text-[#DB0B2B] text-[#666666] transition-colors cursor-pointer"
                            title="Remove Model"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="border border-[#262626] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181818] text-[#888888] uppercase tracking-wider text-[10px] border-b border-[#262626]">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Subscription</th>
                      <th className="p-3">Mockups Created</th>
                      <th className="p-3">Join Date</th>
                      <th className="p-3 text-right">Tier Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222222] bg-[#141414]">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-[#1a1a1a] transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-[11px] text-[#888888] font-mono">{u.email}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.plan === 'pro'
                                ? 'bg-[#DB0B2B]/20 text-[#DB0B2B] border border-[#DB0B2B]/40'
                                : 'bg-[#252525] text-[#aaaaaa]'
                            }`}
                          >
                            {u.plan}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[#cccccc]">{u.mockupsCount} designs</td>
                        <td className="p-3 text-[#777777]">{u.joined}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setUsersList(
                                usersList.map((item) =>
                                  item.id === u.id
                                    ? { ...item, plan: item.plan === 'free' ? 'pro' : 'free' }
                                    : item
                                )
                              )
                            }
                            className="text-[11px] text-[#DB0B2B] hover:underline"
                          >
                            Set to {u.plan === 'free' ? 'Pro' : 'Free'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: BILLING TRANSACTIONS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="border border-[#262626] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181818] text-[#888888] uppercase tracking-wider text-[10px] border-b border-[#262626]">
                    <tr>
                      <th className="p-3">Invoice ID</th>
                      <th className="p-3">User Email</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222222] bg-[#141414]">
                    {paymentsList.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#1a1a1a] transition-colors">
                        <td className="p-3 font-mono text-white font-semibold">{tx.id}</td>
                        <td className="p-3 text-[#cccccc]">{tx.user}</td>
                        <td className="p-3 font-mono font-bold text-white">{tx.amount}</td>
                        <td className="p-3 text-[#888888]">{tx.method}</td>
                        <td className="p-3 text-[#777777]">{tx.date}</td>
                        <td className="p-3 text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
