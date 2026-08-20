import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { formatCurrency } from '../lib/utils';
import { FileText, Plus, Trash2, Download, Printer, User, Building, MapPin, Mail, Calendar, Hash, Image as ImageIcon, Landmark, Stamp } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Navigate } from 'react-router-dom';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export function InvoiceGenerator() {
  const { activeWorkspace } = useData();
  const { userProfile } = useAuth();
  
  if (activeWorkspace !== 'business') {
    return <Navigate to="/dashboard" replace />;
  }

  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Jasa Konsultasi', quantity: 1, price: 500000 }
  ]);

  // New states for customization
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState('');
  const [includeDigitalStamp, setIncludeDigitalStamp] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const businessName = userProfile?.businessName || userProfile?.name || 'Bisnis Anda';
  
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item.quantity * item.price), 0), [items]);
  const tax = useMemo(() => subtotal * (taxPercentage / 100), [subtotal, taxPercentage]);
  const total = subtotal + tax;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    let startY = 25;

    if (logoImage) {
      // Add Logo (estimated size 30x30, keeping aspect ratio simple here)
      // In a real app, might want to calculate aspect ratio.
      try {
        doc.addImage(logoImage, 'JPEG', 14, 15, 30, 30);
        doc.setFontSize(24);
        doc.setTextColor(8, 145, 178); // Cyan-600
        doc.text("INVOICE", 120, 25);
        startY = 50;
      } catch (err) {
        console.error("Failed to add logo to PDF");
        doc.setFontSize(24);
        doc.setTextColor(8, 145, 178); // Cyan-600
        doc.text("INVOICE", 14, 25);
      }
    } else {
      doc.setFontSize(24);
      doc.setTextColor(8, 145, 178); // Cyan-600
      doc.text("INVOICE", 14, 25);
    }
    
    // Business Info
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text(businessName, 14, startY + 10);
    
    // Invoice Details
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Nomor: ${invoiceNumber}`, 14, startY + 17);
    doc.text(`Tanggal: ${new Date(invoiceDate).toLocaleDateString('id-ID')}`, 14, startY + 23);
    if (dueDate) {
      doc.text(`Jatuh Tempo: ${new Date(dueDate).toLocaleDateString('id-ID')}`, 14, startY + 29);
    }
    
    // Client Info
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("Ditagihkan Kepada:", 120, startY + 10);
    doc.setFontSize(10);
    doc.text(clientName || "Nama Klien", 120, startY + 17);
    if (clientAddress) {
      const splitAddress = doc.splitTextToSize(clientAddress, 70);
      doc.text(splitAddress, 120, startY + 23);
    }
    if (clientEmail) doc.text(clientEmail, 120, startY + 35);
    
    // Table
    const tableData = items.map((item, index) => [
      index + 1,
      item.description,
      item.quantity.toString(),
      formatCurrency(item.price),
      formatCurrency(item.quantity * item.price)
    ]);
    
    autoTable(doc, {
      startY: startY + 45,
      head: [['No', 'Keterangan', 'Qty', 'Harga (Rp)', 'Total (Rp)']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [8, 145, 178], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 15 },
        2: { cellWidth: 20, halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      }
    });
    
    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text("Subtotal:", 130, finalY);
    doc.text(formatCurrency(subtotal), 180, finalY, { align: 'right' });
    
    if (tax > 0) {
      doc.text(`Pajak (${taxPercentage}%):`, 130, finalY + 6);
      doc.text(formatCurrency(tax), 180, finalY + 6, { align: 'right' });
    }

    const totalY = tax > 0 ? finalY + 14 : finalY + 8;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(8, 145, 178);
    doc.text("Total Tagihan:", 130, totalY);
    doc.text(formatCurrency(total), 180, totalY, { align: 'right' });
    
    // Payment Details
    let currentFooterY = totalY + 20;
    if (bankDetails) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text("Informasi Pembayaran:", 14, currentFooterY);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const splitBank = doc.splitTextToSize(bankDetails, 100);
      doc.text(splitBank, 14, currentFooterY + 6);
    }

    // Digital Stamp
    if (includeDigitalStamp) {
      // Draw a digital stamp representation
      doc.setDrawColor(8, 145, 178); // Cyan
      doc.setTextColor(8, 145, 178);
      doc.setLineWidth(0.5);
      
      const stampX = 140;
      const stampY = currentFooterY + 5;
      
      doc.rect(stampX, stampY, 50, 20, 'S'); // Draw border
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("DISAHKAN SECARA", stampX + 25, stampY + 8, { align: 'center' });
      doc.text("DIGITAL", stampX + 25, stampY + 14, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(businessName, stampX + 25, stampY + 25, { align: 'center' });
    }

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("Terima kasih atas kepercayaan Anda.", 14, currentFooterY + 45);
    
    // Generate and save
    doc.save(`Invoice_${invoiceNumber}.pdf`);
  };

  return (
    <div className="pb-24 lg:pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-cyan-600" /> Buat Invoice
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Buat dan unduh invoice profesional untuk klien Anda.</p>
        </div>
        <Button onClick={generatePDF} className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-900/20 px-6 py-6 rounded-2xl w-full sm:w-auto">
          <Download className="w-5 h-5 mr-2" />
          Unduh PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="rounded-[2rem] border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="h-5 w-5 text-cyan-600" /> Profil Bisnis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative group">
                    {logoImage ? (
                      <>
                        <img src={logoImage} alt="Logo" className="w-full h-full object-contain p-2" />
                        <div 
                          className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all"
                          onClick={() => setLogoImage(null)}
                        >
                          <Trash2 className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
                      >
                        <ImageIcon className="w-8 h-8 mb-1" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Logo</span>
                      </button>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleLogoUpload} 
                  />
                  <p className="text-[10px] text-slate-400 text-center max-w-[100px] leading-tight">Maks 2MB (Opsional)</p>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Detail Rekening Pembayaran</label>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <textarea
                        value={bankDetails}
                        onChange={(e) => setBankDetails(e.target.value)}
                        placeholder="Contoh: BCA 1234567890 a.n. Bisnis Anda"
                        className="pl-10 w-full min-h-[80px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 resize-y"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <Stamp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cap Digital Otomatis</h4>
                        <p className="text-xs text-slate-500">Tampilkan stempel pengesahan di PDF</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={includeDigitalStamp}
                        onChange={() => setIncludeDigitalStamp(!includeDigitalStamp)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-600" /> Detail Klien
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Klien / Perusahaan</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Contoh: PT ABC Jaya"
                    className="pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 rounded-xl focus-visible:ring-cyan-600"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Alamat</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <textarea
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Contoh: Jl. Sudirman No. 123, Jakarta"
                    className="pl-10 w-full min-h-[80px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 resize-y"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Klien</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Contoh: client@abcjaya.com"
                    className="pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 rounded-xl focus-visible:ring-cyan-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Hash className="h-5 w-5 text-cyan-600" /> Detail Invoice
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nomor Invoice</label>
                <Input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 rounded-xl focus-visible:ring-cyan-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tanggal</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 rounded-xl focus-visible:ring-cyan-600"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Jatuh Tempo</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 rounded-xl focus-visible:ring-cyan-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-600" /> Daftar Item
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800 relative">
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Keterangan Item</label>
                    <Input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Nama produk / jasa"
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-cyan-600"
                    />
                  </div>
                  <div className="w-full sm:w-24 space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Kuantitas</label>
                    <Input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-cyan-600 text-center"
                    />
                  </div>
                  <div className="w-full sm:w-40 space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Harga Satuan (Rp)</label>
                    <Input
                      type="number"
                      value={item.price || ''}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-cyan-600"
                    />
                  </div>
                  
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute -top-2 -right-2 sm:relative sm:top-auto sm:right-auto sm:mt-5 p-2 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-full transition-colors shadow-sm sm:shadow-none"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <Button onClick={addItem} variant="outline" className="w-full py-6 border-dashed border-2 border-slate-200 dark:border-slate-700 hover:border-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-slate-600 dark:text-slate-400 hover:text-cyan-600 transition-all rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Item
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Column */}
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden sticky top-6">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="h-5 w-5 text-cyan-600" /> Ringkasan
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Rp {formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm gap-4">
                  <span className="text-slate-500 whitespace-nowrap">Pajak (%)</span>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={taxPercentage || ''}
                      onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-9 rounded-lg focus-visible:ring-cyan-600 text-right"
                    />
                  </div>
                </div>
                
                {tax > 0 && (
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Nominal Pajak</span>
                    <span className="font-semibold">Rp {formatCurrency(tax)}</span>
                  </div>
                )}
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900 dark:text-white">Total Tagihan</span>
                  <span className="text-xl font-black text-cyan-600">Rp {formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-cyan-50 dark:bg-cyan-950/30 rounded-3xl p-6 border border-cyan-100 dark:border-cyan-900/50 text-center">
             <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
               <FileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
             </div>
             <h3 className="font-bold text-cyan-900 dark:text-cyan-300 mb-2">Invoice Profesional</h3>
             <p className="text-xs text-cyan-700/80 dark:text-cyan-400/70 leading-relaxed">Invoice akan diunduh dalam format PDF. Pastikan semua data sudah terisi dengan benar sebelum menekan tombol unduh.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

