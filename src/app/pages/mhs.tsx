'use client';

import { useEffect, useState } from 'react';
import { Search, Award, BookOpen, User, Plus } from 'lucide-react';

interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  kelas: string;
  points: string;
}

export default function Home() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [filteredMahasiswa, setFilteredMahasiswa] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isGridView, setIsGridView] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/proxy');
        const json = await res.json();
        setMahasiswa(json.data);
        setFilteredMahasiswa(json.data);
      } catch (error) {
        console.error('Gagal fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    let result = [...mahasiswa];
    
    // Filter berdasarkan pencarian
    if (searchTerm) {
      result = result.filter(mhs => 
        mhs.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mhs.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mhs.kelas.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter berdasarkan tab
    if (activeTab === 'highPoints') {
      result = result.filter(mhs => parseInt(mhs.points) > 80);
    } else if (activeTab === 'lowPoints') {
      result = result.filter(mhs => parseInt(mhs.points) <= 80);
    }
    
    setFilteredMahasiswa(result);
  }, [searchTerm, mahasiswa, activeTab]);

  const getPointsColor = (points: number) => {
    if (points > 90) return 'from-green-400 to-green-600';
    if (points > 80) return 'from-blue-400 to-blue-600';
    if (points > 70) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getStatusBadge = (points: number) => {
    if (points > 90) return 'bg-green-100 text-green-800 border-green-200';
    if (points > 80) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (points > 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
          <p className="text-blue-600 text-xl mt-4 font-medium">Loading data mahasiswa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Dashboard Mahasiswa</h1>
          <p className="text-blue-200">Sistem informasi data akademik kampus</p>
          
          {/* Search and Filters */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari mahasiswa..."
                className="bg-white/20 text-white pl-10 pr-4 py-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                Semua
              </button>
              <button 
                onClick={() => setActiveTab('highPoints')}
                className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'highPoints' ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                Points  80
              </button>
              <button 
                onClick={() => setActiveTab('lowPoints')}
                className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'lowPoints' ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                Points ≤ 80
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-blue-100">Total Mahasiswa</h3>
              <div className="bg-white/20 p-2 rounded-lg">
                <User size={24} className="text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold text-white mt-2">{mahasiswa.length}</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-green-100">Performa Baik</h3>
              <div className="bg-white/20 p-2 rounded-lg">
                <Award size={24} className="text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold text-white mt-2">
              {mahasiswa.filter(m => parseInt(m.points) > 80).length}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-purple-100">Rata-rata Points</h3>
              <div className="bg-white/20 p-2 rounded-lg">
                <BookOpen size={24} className="text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold text-white mt-2">
              {Math.round(mahasiswa.reduce((acc, curr) => acc + parseInt(curr.points), 0) / mahasiswa.length)}
            </p>
          </div>
        </div>

        {/* Grid/List View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Daftar Mahasiswa ({filteredMahasiswa.length})
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsGridView(true)}
              className={`p-2 rounded-lg ${isGridView ? 'bg-blue-500 text-white' : 'bg-white/10 text-white'}`}
              title="Grid View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button 
              onClick={() => setIsGridView(false)}
              className={`p-2 rounded-lg ${!isGridView ? 'bg-blue-500 text-white' : 'bg-white/10 text-white'}`}
              title="List View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="12" x2="3" y2="12" />
                <line x1="21" y1="18" x2="3" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cards */}
        {filteredMahasiswa.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <p className="text-white text-lg">Tidak ada data mahasiswa yang ditemukan</p>
          </div>
        ) : isGridView ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMahasiswa.map((mhs) => {
              const pointsValue = parseInt(mhs.points);
              return (
                <div
                  key={mhs.id}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105 group"
                >
                  <div className={`h-3 bg-gradient-to-r ${getPointsColor(pointsValue)}`}></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full h-12 w-12 flex items-center justify-center text-white font-bold text-lg">
                        {mhs.nama.charAt(0)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(pointsValue)}`}>
                        {pointsValue > 80 ? 'Baik' : 'Perlu Bimbingan'}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">{mhs.nama}</h2>
                    <div className="flex items-center gap-2 text-gray-300 mb-1">
                      <User size={14} />
                      <span>{mhs.nim}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 mb-4">
                      <BookOpen size={14} />
                      <span>{mhs.kelas}</span>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-300">Points</span>
                        <span className="text-sm text-white font-semibold">{mhs.points}/100</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full bg-gradient-to-r ${getPointsColor(pointsValue)}`}
                          style={{ width: `${Math.min(pointsValue, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMahasiswa.map((mhs) => {
              const pointsValue = parseInt(mhs.points);
              return (
                <div
                  key={mhs.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className={`w-full md:w-2 h-2 md:h-auto bg-gradient-to-r md:bg-gradient-to-b ${getPointsColor(pointsValue)}`}></div>
                    <div className="p-4 flex-1 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full h-12 w-12 flex items-center justify-center text-white font-bold text-lg">
                        {mhs.nama.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-white">{mhs.nama}</h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-gray-300 text-sm">
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            <span>{mhs.nim}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen size={14} />
                            <span>{mhs.kelas}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(pointsValue)}`}>
                          {pointsValue > 80 ? 'Baik' : 'Perlu Bimbingan'}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r ${getPointsColor(pointsValue)}`}
                              style={{ width: `${Math.min(pointsValue, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-white font-medium">{mhs.points}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Add Button */}
        <button className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
          <Plus size={24} className="text-white" />
        </button>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>© 2025 Dashboard Sistem Informasi Mahasiswa | By Alwan Wildan Zahran </p>
        </div>
      </div>
    </div>
  );
}