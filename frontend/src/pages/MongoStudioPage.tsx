import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Database, 
  Layers, 
  Plus, 
  RefreshCw, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FolderPlus, 
  X,
  Code2,
  Table as TableIcon
} from 'lucide-react';

export const MongoStudioPage: React.FC = () => {
  const [collections, setCollections] = useState<any[]>([]);
  const [activeCollection, setActiveCollection] = useState<string>('students');
  const [documents, setDocuments] = useState<any[]>([]);
  const [totalDocs, setTotalDocs] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // New Collection Modal State
  const [showCreateCollModal, setShowCreateCollModal] = useState<boolean>(false);
  const [newCollName, setNewCollName] = useState<string>('');
  const [newCollDoc, setNewCollDoc] = useState<string>('{\n  "title": "Sample Record",\n  "status": "Active"\n}');
  const [creatingColl, setCreatingColl] = useState<boolean>(false);

  // New/Edit Document Modal State
  const [showDocModal, setShowDocModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editDocId, setEditDocId] = useState<string>('');
  const [docContent, setDocContent] = useState<string>('{}');
  const [savingDoc, setSavingDoc] = useState<boolean>(false);

  // Seeding State
  const [seeding, setSeeding] = useState<boolean>(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (activeCollection) {
      fetchDocuments(activeCollection);
    }
  }, [activeCollection, search]);

  const fetchCollections = async () => {
    try {
      const res = await api.get('/mongo/collections');
      setCollections(res.data.collections || []);
      if (!activeCollection && res.data.collections.length > 0) {
        setActiveCollection(res.data.collections[0].collection_name);
      }
    } catch (err: any) {
      console.error('Failed to fetch MongoDB collections', err);
    }
  };

  const fetchDocuments = async (collName: string) => {
    setLoading(true);
    try {
      const params: any = { skip: 0, limit: 50 };
      if (search) params.search = search;
      const res = await api.get(`/mongo/${collName}`, { params });
      setDocuments(res.data.items || []);
      setTotalDocs(res.data.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollName) return;
    setCreatingColl(true);
    setStatusMsg(null);

    let parsedDoc = null;
    try {
      if (newCollDoc.trim()) {
        parsedDoc = JSON.parse(newCollDoc);
      }
    } catch {
      alert('Initial document must be valid JSON.');
      setCreatingColl(false);
      return;
    }

    try {
      await api.post('/mongo/collections', {
        collection_name: newCollName,
        initial_document: parsedDoc
      });
      setShowCreateCollModal(false);
      setNewCollName('');
      setStatusMsg(`Collection '${newCollName}' successfully created in MongoDB!`);
      await fetchCollections();
      setActiveCollection(newCollName.toLowerCase().replace(/\s+/g, '_'));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create collection.');
    } finally {
      setCreatingColl(false);
    }
  };

  const handleOpenCreateDocModal = () => {
    setIsEditing(false);
    setEditDocId('');
    setDocContent('{\n  \n}');
    setShowDocModal(true);
  };

  const handleOpenEditDocModal = (doc: any) => {
    setIsEditing(true);
    setEditDocId(doc.id || doc._id);
    const copy = { ...doc };
    delete copy._id;
    delete copy.id;
    delete copy.created_at;
    delete copy.updated_at;
    setDocContent(JSON.stringify(copy, null, 2));
    setShowDocModal(true);
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    let parsedData = {};
    try {
      parsedData = JSON.parse(docContent);
    } catch {
      alert('Document content must be valid JSON.');
      return;
    }

    setSavingDoc(true);
    setStatusMsg(null);
    try {
      if (isEditing) {
        await api.put(`/mongo/${activeCollection}/${editDocId}`, { data: parsedData });
        setStatusMsg(`Document updated successfully in '${activeCollection}'!`);
      } else {
        await api.post(`/mongo/${activeCollection}`, { data: parsedData });
        setStatusMsg(`New document inserted into '${activeCollection}'!`);
      }
      setShowDocModal(false);
      fetchDocuments(activeCollection);
      fetchCollections();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save document.');
    } finally {
      setSavingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm(`Are you sure you want to delete document ${docId} from '${activeCollection}'?`)) return;
    try {
      await api.delete(`/mongo/${activeCollection}/${docId}`);
      setStatusMsg(`Document ${docId} deleted from '${activeCollection}'.`);
      fetchDocuments(activeCollection);
      fetchCollections();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete document.');
    }
  };

  const handleTriggerSeed = async () => {
    if (!window.confirm('This will re-seed all default student assessment collections on MongoDB Atlas. Proceed?')) return;
    setSeeding(true);
    setStatusMsg(null);
    try {
      const res = await api.post('/mongo/seed');
      setStatusMsg(res.data.message);
      await fetchCollections();
      fetchDocuments(activeCollection);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Seeding failed.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              MongoDB Atlas Live Cluster
            </span>
            <span className="text-xs text-slate-500 font-mono">DB: student_performance_ai</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            MongoDB Database & Collection CRUD Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage collections, execute Create-Read-Update-Delete operations, and inspect raw documents in real-time.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTriggerSeed}
            disabled={seeding}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {seeding ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Seeding Database...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Re-Seed Collections</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowCreateCollModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center space-x-2 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create New Collection</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{statusMsg}</span>
        </div>
      )}

      {/* Main Grid: Collections Sidebar + Document Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Collections Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Collections ({collections.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">student_performance_ai</span>
          </div>

          <div className="space-y-1.5">
            {collections.map((c) => {
              const isSelected = c.collection_name === activeCollection;
              return (
                <button
                  key={c.collection_name}
                  onClick={() => setActiveCollection(c.collection_name)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span className="font-mono">{c.collection_name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                    {c.document_count} docs
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Document Explorer Pane */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Active Collection</span>
                <span className="font-mono font-bold text-blue-700 text-base">{activeCollection}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Showing {documents.length} of {totalDocs} records</p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                  title="Table View"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('json')}
                  className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    viewMode === 'json' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                  title="JSON View"
                >
                  <Code2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleOpenCreateDocModal}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert Document</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search records in '${activeCollection}'...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Documents Content */}
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              <span>Fetching MongoDB documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic">
              No documents found in collection '{activeCollection}'.
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto border rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b text-[11px] font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">_id</th>
                    <th className="py-2.5 px-3">Primary Identifier</th>
                    <th className="py-2.5 px-3">Summary Data</th>
                    <th className="py-2.5 px-3">Created At</th>
                    <th className="py-2.5 px-3 text-right">CRUD Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((doc) => {
                    const docId = doc.id || doc._id;
                    const primaryKey = doc.student_id || doc.name || doc.email || doc.subject_code || doc.title || docId;
                    return (
                      <tr key={docId} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">{docId.substring(0, 10)}...</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{primaryKey}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                          {doc.attendance_percentage !== undefined ? `Att: ${doc.attendance_percentage}%, Int: ${doc.internal_marks}` : 
                           doc.department ? `${doc.department} (Sem ${doc.semester})` :
                           doc.estimated_score ? `Score: ${doc.estimated_score} (${doc.performance_category})` :
                           JSON.stringify(doc).substring(0, 45)}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-400">
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenEditDocModal(doc)}
                              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit Document"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(docId)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const docId = doc.id || doc._id;
                return (
                  <div key={docId} className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs border border-slate-800 relative group">
                    <div className="absolute top-3 right-3 flex items-center space-x-2 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => handleOpenEditDocModal(doc)}
                        className="px-2 py-1 bg-slate-800 hover:bg-blue-600 text-white rounded-md text-[10px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(docId)}
                        className="px-2 py-1 bg-slate-800 hover:bg-rose-600 text-white rounded-md text-[10px]"
                      >
                        Delete
                      </button>
                    </div>
                    <pre className="overflow-x-auto">{JSON.stringify(doc, null, 2)}</pre>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Create New Collection Modal */}
      {showCreateCollModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <FolderPlus className="w-4 h-4 text-blue-600" />
                <span>Create New MongoDB Collection</span>
              </h3>
              <button onClick={() => setShowCreateCollModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Collection Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mentor_feedback, lab_evaluations"
                  value={newCollName}
                  onChange={(e) => setNewCollName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Document (JSON)</label>
                <textarea
                  rows={4}
                  value={newCollDoc}
                  onChange={(e) => setNewCollDoc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono bg-slate-50"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCollModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingColl}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  {creatingColl ? 'Creating...' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Insert / Edit Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {isEditing ? `Edit Document (${editDocId})` : `Insert Document into '${activeCollection}'`}
              </h3>
              <button onClick={() => setShowDocModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Payload (JSON)</label>
                <textarea
                  rows={8}
                  required
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono bg-slate-900 text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDoc}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  {savingDoc ? 'Saving...' : isEditing ? 'Save Changes' : 'Insert Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
