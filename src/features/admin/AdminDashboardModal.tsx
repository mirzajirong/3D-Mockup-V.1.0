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
import { APP_CONFIG } from '../../config/constants';

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

  const [activeTab, setActiveTab] = useState<'models' | 'users' | 'payments'>('models');

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
    { id: 'mod_01', name: '01. O-Neck Classic Jersey', category: 'T-Shirt', fileSize: '4.2 MB', status: 'Free', active: true },
    { id: 'mod_02', name: '02. V-Neck Athletic Jersey', category: 'Jersey', fileSize: '4.8 MB', status: 'Free', active: true },
    { id: 'mod_03', name: '03. Polo Performance Jersey', category: 'Polo', fileSize: '5.6 MB', status: 'Pro', active: true },
    { id: 'mod_04', name: '04. Long Sleeve Raglan Jersey', category: 'Long Sleeve', fileSize: '6.1 MB', status: 'Pro', active: true },
    { id: 'mod_05', name: '05. Streetwear Heavyweight Hoodie', category: 'Hoodie', fileSize: '8.4 MB', status: 'Pro', active: true },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0A0A0A] border border-white/15 rounded-[6px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#000000]">
          <div className="flex items-center gap-3">
            <img
              src={APP_CONFIG.assets.logo}
              alt="Editor Suite"
              className="w-7 h-7 rounded-[3px] object-contain shrink-0"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#FFFFFF] tracking-wider font-sora">
                  ADMIN CONSOLE
                </span>
                <span className="text-[10px] text-[#DB0B2B] font-mono font-bold">
                  MANAGEMENT
                </span>
              </div>
              <span className="text-[10px] text-[#888888] font-medium tracking-tight">
                {APP_CONFIG.tagline}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAdminDashboardOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-[4px] border border-white/10 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818] transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 pb-2 bg-[#0A0A0A] border-b border-white/10">
          <div className="flex items-center gap-1 p-1 bg-[#141414] rounded-[4px] border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('models')}
              className={`flex-1 py-1.5 px-3 rounded-[3px] text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sora ${
                activeTab === 'models'
                  ? 'bg-[#1E1E1E] text-[#FFFFFF] border border-white/15'
                  : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818] border border-transparent'
              }`}
            >
              <CubeIcon className={`w-3.5 h-3.5 ${activeTab === 'models' ? 'text-[#DB0B2B]' : 'text-current'}`} />
              <span>3D Models ({modelsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-1.5 px-3 rounded-[3px] text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sora ${
                activeTab === 'users'
                  ? 'bg-[#1E1E1E] text-[#FFFFFF] border border-white/15'
                  : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818] border border-transparent'
              }`}
            >
              <UsersIcon className={`w-3.5 h-3.5 ${activeTab === 'users' ? 'text-[#DB0B2B]' : 'text-current'}`} />
              <span>Users ({usersList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`flex-1 py-1.5 px-3 rounded-[3px] text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sora ${
                activeTab === 'payments'
                  ? 'bg-[#1E1E1E] text-[#FFFFFF] border border-white/15'
                  : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#181818] border border-transparent'
              }`}
            >
              <CreditCardIcon className={`w-3.5 h-3.5 ${activeTab === 'payments' ? 'text-[#DB0B2B]' : 'text-current'}`} />
              <span>Billing ({paymentsList.length})</span>
            </button>
          </div>
        </div>

        {/* Body Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: 3D MODEL MANAGER */}
          {activeTab === 'models' && (
            <div className="space-y-5">
              {/* Upload GLB Form */}
              <div className="p-4 rounded-[4px] bg-[#141414] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1.5 font-sora">
                    <ArrowUpTrayIcon className="w-4 h-4 text-[#DB0B2B]" />
                    <span>Upload & Daftarkan 3D Garment Baru (.GLB / .GLTF)</span>
                  </h3>
                  {uploadSuccessMessage && (
                    <span className="text-xs text-[#10B981] font-medium flex items-center gap-1">
                      <CheckIcon className="w-3.5 h-3.5" /> Model Berhasil Ditambahkan
                    </span>
                  )}
                </div>

                <form onSubmit={handleAddModel} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-[#888888] block mb-1">
                      Model Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 06. Windbreaker Sport Jacket"
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                      required
                      className="w-full bg-[#181818] border border-white/15 focus:border-[#DB0B2B] rounded-[4px] px-3 py-1.5 text-xs text-[#FFFFFF] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#888888] block mb-1">
                      Category
                    </label>
                    <select
                      value={newModelCategory}
                      onChange={(e) => setNewModelCategory(e.target.value)}
                      className="w-full bg-[#181818] border border-white/15 rounded-[4px] px-3 py-1.5 text-xs text-[#FFFFFF] outline-none cursor-pointer"
                    >
                      <option value="Jersey">Jersey</option>
                      <option value="T-Shirt">T-Shirt</option>
                      <option value="Polo">Polo</option>
                      <option value="Hoodie">Hoodie</option>
                      <option value="Outerwear">Outerwear</option>
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
                        className="flex-1 bg-[#181818] border border-white/15 rounded-[4px] px-2.5 py-1.5 text-xs text-[#FFFFFF] outline-none cursor-pointer"
                      >
                        <option value="Free">Free</option>
                        <option value="Pro">Pro Only</option>
                      </select>

                      <button
                        type="submit"
                        className="py-1.5 px-3 rounded-[4px] bg-[#DB0B2B] hover:bg-[#F01436] active:bg-[#B00820] text-[#FFFFFF] text-xs font-bold transition-all shrink-0 cursor-pointer font-sora"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Models Table */}
              <div className="border border-white/10 rounded-[4px] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#000000] text-[#888888] uppercase tracking-wider text-[10px] border-b border-white/10">
                    <tr>
                      <th className="p-3">Model Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">File Size</th>
                      <th className="p-3">Access Tier</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#141414]">
                    {modelsList.map((m) => (
                      <tr key={m.id} className="hover:bg-[#181818] transition-colors">
                        <td className="p-3 font-medium text-[#FFFFFF] flex items-center gap-2">
                          <CubeIcon className="w-3.5 h-3.5 text-[#DB0B2B]" />
                          <span className="font-sora">{m.name}</span>
                        </td>
                        <td className="p-3 text-[#CCCCCC]">{m.category}</td>
                        <td className="p-3 font-mono text-[#888888]">{m.fileSize}</td>
                        <td className="p-3">
                          <span
                            className={`px-1.5 py-0.5 rounded-[2px] text-[9.5px] font-bold font-sora ${
                              m.status === 'Pro'
                                ? 'bg-[#DB0B2B]/15 text-[#DB0B2B] border border-[#DB0B2B]/40'
                                : 'bg-[#181818] text-[#CCCCCC]'
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
                            className="p-1 hover:text-[#DB0B2B] text-[#888888] transition-colors cursor-pointer"
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
              <div className="border border-white/10 rounded-[4px] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#000000] text-[#888888] uppercase tracking-wider text-[10px] border-b border-white/10">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Subscription</th>
                      <th className="p-3">Mockups Created</th>
                      <th className="p-3">Join Date</th>
                      <th className="p-3 text-right">Tier Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#141414]">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-[#181818] transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-[#FFFFFF] font-sora">{u.name}</div>
                          <div className="text-[11px] text-[#888888] font-mono">{u.email}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-1.5 py-0.5 rounded-[2px] text-[9.5px] font-bold font-sora uppercase ${
                              u.plan === 'pro'
                                ? 'bg-[#DB0B2B]/15 text-[#DB0B2B] border border-[#DB0B2B]/40'
                                : 'bg-[#181818] text-[#CCCCCC]'
                            }`}
                          >
                            {u.plan}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[#CCCCCC]">{u.mockupsCount} designs</td>
                        <td className="p-3 text-[#888888]">{u.joined}</td>
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
                            className="text-[11px] text-[#DB0B2B] hover:underline cursor-pointer"
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
              <div className="border border-white/10 rounded-[4px] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#000000] text-[#888888] uppercase tracking-wider text-[10px] border-b border-white/10">
                    <tr>
                      <th className="p-3">Invoice ID</th>
                      <th className="p-3">User Email</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#141414]">
                    {paymentsList.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#181818] transition-colors">
                        <td className="p-3 font-mono text-[#FFFFFF] font-semibold">{tx.id}</td>
                        <td className="p-3 text-[#CCCCCC]">{tx.user}</td>
                        <td className="p-3 font-mono font-bold text-[#FFFFFF]">{tx.amount}</td>
                        <td className="p-3 text-[#888888]">{tx.method}</td>
                        <td className="p-3 text-[#888888]">{tx.date}</td>
                        <td className="p-3 text-right">
                          <span className="px-1.5 py-0.5 rounded-[2px] text-[9.5px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
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

export default AdminDashboardModal;
