'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, doc, query, orderBy, setDoc, updateDoc, addDoc, serverTimestamp, getDocs, limit, where } from 'firebase/firestore';
import { 
  Users, 
  Shield, 
  Activity, 
  Smartphone, 
  CheckCircle2, 
  Search, 
  ChevronRight,
  Filter,
  BarChart3,
  AlertCircle,
  Loader2,
  Lock,
  Camera,
  Plus,
  MapPin,
  Settings,
  X,
  Link as LinkIcon,
  Copy,
  ExternalLink,
  ShieldAlert,
  Fingerprint,
  UserCheck,
  Key,
  BadgeAlert,
  History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [cameraSearchTerm, setCameraSearchTerm] = useState('');
  const [officerSearchTerm, setOfficerSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('citizens');
  
  // Camera State
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [generatedWebhook, setGeneratedWebhook] = useState<string | null>(null);
  
  // Officer State
  const [isOfficerDialogOpen, setIsOfficerDialogOpen] = useState(false);
  const [isEnrollingOfficer, setIsEnrollingOfficer] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<any>(null);
  const [isOfficerDetailOpen, setIsOfficerDetailOpen] = useState(false);

  // Form State for New Camera
  const [newCamera, setNewCamera] = useState({
    camera_id: '',
    name: '',
    location: {
      city: 'Kigali',
      district: '',
      road: '',
      latitude: -1.944,
      longitude: 30.061
    },
    owner: {
      organization: 'Traffic Authority'
    },
    services: {
      live_stream: true,
      abnormal_activity_alert: true,
      information_storage: false,
      information_retrieval: false,
      traffic_enforcement: true
    },
    rules: {
      allowed_events: ['Line Crossing', 'Loitering', 'Region Entrance']
    }
  });

  // Form State for New Officer
  const [newOfficer, setNewOfficer] = useState({
    identity: {
      first_name: '',
      last_name: ''
    },
    service_number: '',
    contact: {
      phone: '',
      email: ''
    },
    employment: {
      rank: '',
      station: '',
      department: 'Traffic Enforcement'
    },
    role: 'traffic_police'
  });

  // Data fetching
  const profileRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [user, db]);
  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  const usersQuery = useMemo(() => (db ? query(collection(db, 'users'), orderBy('createdAt', 'desc')) : null), [db]);
  const { data: allUsers, loading: usersLoading } = useCollection(usersQuery);

  const camerasQuery = useMemo(() => (db ? collection(db, 'cameras') : null), [db]);
  const { data: allCameras, loading: camerasLoading } = useCollection(camerasQuery);

  const officersQuery = useMemo(() => (db ? query(collection(db, 'police_officers'), orderBy('created_at', 'desc')) : null), [db]);
  const { data: allOfficers, loading: officersLoading } = useCollection(officersQuery);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/auth');
    }
  }, [user, userLoading, router]);

  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter(u => 
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.deviceId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm]);

  const filteredCameras = useMemo(() => {
    if (!allCameras) return [];
    return allCameras.filter(c => 
      c.camera_id?.toLowerCase().includes(cameraSearchTerm.toLowerCase()) || 
      c.name?.toLowerCase().includes(cameraSearchTerm.toLowerCase()) ||
      c.location?.road?.toLowerCase().includes(cameraSearchTerm.toLowerCase())
    );
  }, [allCameras, cameraSearchTerm]);

  const filteredOfficers = useMemo(() => {
    if (!allOfficers) return [];
    return allOfficers.filter(o => 
      o.identity?.full_name?.toLowerCase().includes(officerSearchTerm.toLowerCase()) || 
      o.service_number?.toLowerCase().includes(officerSearchTerm.toLowerCase()) ||
      o.employment?.station?.toLowerCase().includes(officerSearchTerm.toLowerCase())
    );
  }, [allOfficers, officerSearchTerm]);

  const stats = useMemo(() => {
    return {
      total: allUsers?.length || 0,
      activeSubs: allUsers?.filter(u => u.subscriptionActive).length || 0,
      devices: allUsers?.filter(u => u.deviceId).length || 0,
      cameras: allCameras?.length || 0,
      officers: allOfficers?.length || 0
    };
  }, [allUsers, allCameras, allOfficers]);

  // Camera Handlers
  const handleRegisterCamera = async () => {
    if (!db || !newCamera.camera_id || !newCamera.name) return;
    setIsRegistering(true);
    setGeneratedWebhook(null);
    try {
      const cameraRef = doc(db, 'cameras', newCamera.camera_id);
      await setDoc(cameraRef, newCamera);
      const response = await fetch('http://159.65.234.249:1880/api/cameras/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCamera),
      });
      const result = await response.text();
      if (!response.ok) throw new Error(result);
      const resultJson = JSON.parse(result);
      if (resultJson.success && resultJson.webhook_url) {
        await updateDoc(cameraRef, { webhook_url: resultJson.webhook_url });
        setGeneratedWebhook(resultJson.webhook_url);
        toast({ title: "Registration Success", description: "Camera registered and synced with Node-RED." });
      } else {
        toast({ variant: "destructive", title: "Integration Issue", description: "Camera saved but Node-RED sync was incomplete." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: error.message });
    } finally {
      setIsRegistering(false);
    }
  };

  // Officer Handlers
  const createAuditLog = async (officerId: string, action: string, metadata: any = {}) => {
    if (!db || !user) return;
    await addDoc(collection(db, 'police_audit_logs'), {
      police_id: officerId,
      action,
      performed_by: user.uid,
      timestamp: serverTimestamp(),
      metadata
    });
  };

  const handleEnrollOfficer = async () => {
    if (!db || !user || !newOfficer.service_number) return;
    setIsEnrollingOfficer(true);
    try {
      const policeId = `RW-POL-${newOfficer.service_number}`;
      const officerData = {
        ...newOfficer,
        police_id: policeId,
        identity: {
          ...newOfficer.identity,
          full_name: `${newOfficer.identity.first_name} ${newOfficer.identity.last_name}`
        },
        status: 'pending_enrollment',
        enrollment: {
          fingerprint: { enrolled: false },
          face: { enrolled: false },
          pin: { configured: false },
          completed: false,
          enrolled_at: null,
          enrolled_by: null
        },
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };
      await setDoc(doc(db, 'police_officers', policeId), officerData);
      await createAuditLog(policeId, 'POLICE_CREATED');
      toast({ title: "Officer Enrolled", description: `${officerData.identity.full_name} is now in the registry.` });
      setIsOfficerDialogOpen(false);
      setNewOfficer({
        identity: { first_name: '', last_name: '' },
        service_number: '',
        contact: { phone: '', email: '' },
        employment: { rank: '', station: '', department: 'Traffic Enforcement' },
        role: 'traffic_police'
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Enrollment Failed", description: error.message });
    } finally {
      setIsEnrollingOfficer(false);
    }
  };

  const simulateEnrollmentStep = async (officerId: string, step: 'fingerprint' | 'face' | 'pin') => {
    if (!db || !user) return;
    const officerRef = doc(db, 'police_officers', officerId);
    const officerDoc = await getDocs(query(collection(db, 'police_officers'), where('police_id', '==', officerId), limit(1)));
    if (officerDoc.empty) return;
    
    const officerData = officerDoc.docs[0].data();
    const newEnrollment = { ...officerData.enrollment };
    
    if (step === 'fingerprint') newEnrollment.fingerprint.enrolled = true;
    if (step === 'face') newEnrollment.face.enrolled = true;
    if (step === 'pin') newEnrollment.pin.configured = true;
    
    const isComplete = newEnrollment.fingerprint.enrolled && 
                     newEnrollment.face.enrolled && 
                     newEnrollment.pin.configured;
    
    newEnrollment.completed = isComplete;
    
    const updateData: any = {
      enrollment: newEnrollment,
      updated_at: serverTimestamp()
    };
    
    if (isComplete && officerData.status === 'pending_enrollment') {
      updateData.status = 'enrollment_ready';
    }
    
    await updateDoc(officerRef, updateData);
    await createAuditLog(officerId, `${step.toUpperCase()}_ENROLLMENT_COMPLETED`);
    toast({ title: "Step Complete", description: `${step} enrollment successful.` });
  };

  const handleUpdateOfficerStatus = async (officerId: string, newStatus: string) => {
    if (!db) return;
    await updateDoc(doc(db, 'police_officers', officerId), { 
      status: newStatus,
      updated_at: serverTimestamp()
    });
    await createAuditLog(officerId, `POLICE_STATUS_CHANGED`, { status: newStatus });
    toast({ title: "Status Updated", description: `Officer status is now ${newStatus.replace('_', ' ')}.` });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Text copied to clipboard." });
  };

  if (userLoading || profileLoading || usersLoading || camerasLoading || officersLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Initializing Admin Grid...</p>
      </div>
    );
  }

  if (!profile?.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-black mb-2">Access Restricted</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">This area is reserved for system administrators.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="rounded-xl font-bold h-12 px-8">Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[2rem] bg-primary flex items-center justify-center shadow-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-destructive text-[8px] font-black uppercase tracking-widest">Platform Admin</Badge>
                <Badge variant="outline" className="border-primary/30 text-primary text-[8px] font-black uppercase tracking-widest bg-primary/5">Uptime 99.9%</Badge>
              </div>
              <h1 className="text-4xl font-headline font-black tracking-tight leading-none">Global Control Grid</h1>
              <p className="text-muted-foreground text-xs mt-1 uppercase tracking-[0.2em] font-bold opacity-60">System Oversight & User Management</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Citizens', value: stats.total, icon: Users, color: 'text-primary' },
            { label: 'Active Guards', value: stats.activeSubs, icon: CheckCircle2, color: 'text-rwanda-green' },
            { label: 'Registry Cameras', value: stats.cameras, icon: Camera, color: 'text-sky-500' },
            { label: 'Police Officers', value: stats.officers, icon: ShieldAlert, color: 'text-destructive' }
          ].map((stat, i) => (
            <Card key={i} className="bg-card/40 border-border rounded-[2.5rem] shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <stat.icon className="w-24 h-24" />
              </div>
              <CardContent className="p-10">
                <div className="flex items-center gap-3 mb-4">
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                </div>
                <div className="text-5xl font-black">{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-secondary/30 p-1.5 rounded-2xl border border-border h-auto w-full md:w-auto flex flex-wrap">
            <TabsTrigger value="citizens" className="rounded-xl py-3 px-8 font-black uppercase tracking-widest text-xs data-[state=active]:bg-primary data-[state=active]:text-white">Citizens</TabsTrigger>
            <TabsTrigger value="cameras" className="rounded-xl py-3 px-8 font-black uppercase tracking-widest text-xs data-[state=active]:bg-primary data-[state=active]:text-white">Cameras</TabsTrigger>
            <TabsTrigger value="officers" className="rounded-xl py-3 px-8 font-black uppercase tracking-widest text-xs data-[state=active]:bg-primary data-[state=active]:text-white">Police Officers</TabsTrigger>
          </TabsList>

          <TabsContent value="citizens">
            <Card className="bg-card/60 border-border rounded-[3rem] shadow-2xl overflow-hidden">
              <CardHeader className="p-10 pb-6 border-b border-border/50 bg-secondary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <CardTitle className="text-3xl font-black">Citizen Directory</CardTitle>
                  <CardDescription>Monitor individual security statuses.</CardDescription>
                </div>
                <div className="flex w-full md:w-auto gap-2">
                  <div className="relative flex-grow md:w-80">
                    <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-12 rounded-xl pl-12" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px] w-full">
                  <Table>
                    <TableHeader className="bg-secondary/20 sticky top-0 z-10">
                      <TableRow className="border-none">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest h-14 pl-10">Citizen</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest h-14 text-center">Status</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest h-14 text-center">Hardware</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest h-14 text-right pr-10">Ops</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.uid} className="hover:bg-secondary/10 border-border/50">
                          <TableCell className="pl-10 py-6">
                            <div className="flex flex-col">
                              <span className="font-bold">{u.fullName}</span>
                              <span className="text-xs text-muted-foreground">{u.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={cn("font-black text-[8px] uppercase tracking-widest", u.subscriptionActive ? "border-rwanda-green text-rwanda-green" : "text-muted-foreground")}>
                              {u.subscriptionActive ? 'GRID ACTIVE' : 'INACTIVE'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-[10px] font-mono font-bold text-primary">{u.deviceId || 'N/A'}</span>
                          </TableCell>
                          <TableCell className="text-right pr-10">
                            <Button variant="ghost" size="icon" className="rounded-lg h-10 w-10"><ChevronRight className="w-5 h-5" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cameras">
            <Card className="bg-card/60 border-border rounded-[3rem] shadow-2xl overflow-hidden">
              <CardHeader className="p-10 pb-6 border-b border-border/50 bg-secondary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <CardTitle className="text-3xl font-black">Camera Registry</CardTitle>
                  <CardDescription>Global surveillance management.</CardDescription>
                </div>
                <div className="flex w-full md:w-auto gap-4">
                  <div className="relative flex-grow md:w-80">
                    <Input placeholder="Search ID, name..." value={cameraSearchTerm} onChange={(e) => setCameraSearchTerm(e.target.value)} className="h-12 rounded-xl pl-12" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  </div>
                  <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-12 rounded-xl font-black uppercase text-xs gap-2 px-6">
                        <Plus className="w-4 h-4" /> Register Camera
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl rounded-[2.5rem] p-10">
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-black">New Camera Registry</DialogTitle>
                        <DialogDescription>Initialize a new surveillance node.</DialogDescription>
                      </DialogHeader>
                      {generatedWebhook ? (
                        <div className="bg-rwanda-green/5 border border-rwanda-green/20 rounded-2xl p-8 space-y-6">
                          <div className="flex items-center gap-4 text-rwanda-green">
                            <CheckCircle2 className="w-6 h-6" />
                            <h4 className="font-black uppercase text-xs">Integration Ready</h4>
                          </div>
                          <div className="relative">
                            <Input readOnly value={generatedWebhook} className="pr-24 h-14 font-mono text-xs" />
                            <Button size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => copyToClipboard(generatedWebhook)}>Copy</Button>
                          </div>
                          <Button variant="outline" className="w-full" onClick={() => setIsCameraDialogOpen(false)}>Close</Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="Camera ID" value={newCamera.camera_id} onChange={(e) => setNewCamera({...newCamera, camera_id: e.target.value})} className="h-12" />
                            <Input placeholder="Name" value={newCamera.name} onChange={(e) => setNewCamera({...newCamera, name: e.target.value})} className="h-12" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="Latitude" type="number" step="any" value={newCamera.location.latitude} onChange={(e) => setNewCamera({...newCamera, location: {...newCamera.location, latitude: parseFloat(e.target.value) || 0}})} className="h-12" />
                            <Input placeholder="Longitude" type="number" step="any" value={newCamera.location.longitude} onChange={(e) => setNewCamera({...newCamera, location: {...newCamera.location, longitude: parseFloat(e.target.value) || 0}})} className="h-12" />
                          </div>
                          <Button className="w-full h-14 font-black uppercase" onClick={handleRegisterCamera} disabled={isRegistering || !newCamera.camera_id || !newCamera.name}>
                            {isRegistering ? <Loader2 className="animate-spin" /> : "Register & Sync Webhook"}
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px] w-full">
                  <Table>
                    <TableHeader className="bg-secondary/20 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="pl-10 h-14 text-[10px] font-black uppercase tracking-widest">Camera Profile</TableHead>
                        <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-center">Location</TableHead>
                        <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-center">Webhook</TableHead>
                        <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-right pr-10">Ops</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCameras.map((c) => (
                        <TableRow key={c.camera_id} className="hover:bg-secondary/10 border-border/50">
                          <TableCell className="pl-10 py-6">
                            <div className="flex items-center gap-4">
                              <Camera className="w-5 h-5 text-sky-500" />
                              <div className="flex flex-col">
                                <span className="font-bold">{c.name}</span>
                                <span className="text-[10px] font-mono font-bold text-primary">{c.camera_id}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-bold">{c.location?.road}</span>
                              <span className="text-[10px] opacity-60 uppercase">{c.location?.city}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {c.webhook_url ? (
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(c.webhook_url!)} className="text-[10px] font-bold text-rwanda-green">
                                <LinkIcon className="w-3 h-3 mr-1" /> Copy URL
                              </Button>
                            ) : (
                              <Badge variant="outline" className="opacity-30">NO LINK</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-10">
                            <Button variant="ghost" size="icon"><Settings className="w-4 h-4 opacity-40 hover:opacity-100" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="officers">
            <Card className="bg-card/60 border-border rounded-[3rem] shadow-2xl overflow-hidden">
              <CardHeader className="p-10 pb-6 border-b border-border/50 bg-secondary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <CardTitle className="text-3xl font-black">Police Registry</CardTitle>
                  <CardDescription>Strategic enforcement officer management.</CardDescription>
                </div>
                <div className="flex w-full md:w-auto gap-4">
                  <div className="relative flex-grow md:w-80">
                    <Input placeholder="Search badge, name, station..." value={officerSearchTerm} onChange={(e) => setOfficerSearchTerm(e.target.value)} className="h-12 rounded-xl pl-12" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  </div>
                  <Dialog open={isOfficerDialogOpen} onOpenChange={setIsOfficerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-12 rounded-xl font-black uppercase text-xs gap-2 px-6">
                        <Plus className="w-4 h-4" /> Enroll Officer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden">
                      <ScrollArea className="max-h-[85vh]">
                        <div className="p-10 space-y-8">
                          <DialogHeader>
                            <DialogTitle className="text-3xl font-black">New Officer Enrollment</DialogTitle>
                            <DialogDescription>Initialize a new enforcement node record.</DialogDescription>
                          </DialogHeader>

                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">First Name</Label>
                              <Input placeholder="John" value={newOfficer.identity.first_name} onChange={(e) => setNewOfficer({...newOfficer, identity: {...newOfficer.identity, first_name: e.target.value}})} className="h-12" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Name</Label>
                              <Input placeholder="Doe" value={newOfficer.identity.last_name} onChange={(e) => setNewOfficer({...newOfficer, identity: {...newOfficer.identity, last_name: e.target.value}})} className="h-12" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Service Number</Label>
                            <Input placeholder="P001245" value={newOfficer.service_number} onChange={(e) => setNewOfficer({...newOfficer, service_number: e.target.value})} className="h-12 font-mono font-bold" />
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rank</Label>
                              <Input placeholder="Inspector" value={newOfficer.employment.rank} onChange={(e) => setNewOfficer({...newOfficer, employment: {...newOfficer.employment, rank: e.target.value}})} className="h-12" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Station</Label>
                              <Input placeholder="Kigali Central" value={newOfficer.employment.station} onChange={(e) => setNewOfficer({...newOfficer, employment: {...newOfficer.employment, station: e.target.value}})} className="h-12" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone</Label>
                              <Input placeholder="+250 7XX XXX XXX" value={newOfficer.contact.phone} onChange={(e) => setNewOfficer({...newOfficer, contact: {...newOfficer.contact, phone: e.target.value}})} className="h-12" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</Label>
                              <Input placeholder="john.doe@police.gov.rw" value={newOfficer.contact.email} onChange={(e) => setNewOfficer({...newOfficer, contact: {...newOfficer.contact, email: e.target.value}})} className="h-12" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assigned Role</Label>
                            <Select value={newOfficer.role} onValueChange={(v) => setNewOfficer({...newOfficer, role: v})}>
                              <SelectTrigger className="h-12">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="traffic_police">Traffic Police Officer</SelectItem>
                                <SelectItem value="police_admin">Police Administrator</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button className="w-full h-14 font-black uppercase" onClick={handleEnrollOfficer} disabled={isEnrollingOfficer || !newOfficer.service_number}>
                            {isEnrollingOfficer ? <Loader2 className="animate-spin" /> : "Initiate Enrollment"}
                          </Button>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px] w-full">
                  <Table>
                    <TableHeader className="bg-secondary/20 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="pl-10 h-14 text-[10px] font-black uppercase tracking-widest">Officer</TableHead>
                        <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-center">Rank / Station</TableHead>
                        <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-center">Enrollment</TableHead>
                        <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                        <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-right pr-10">Ops</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOfficers.map((o) => (
                        <TableRow key={o.police_id} className="hover:bg-secondary/10 border-border/50">
                          <TableCell className="pl-10 py-6">
                            <div className="flex flex-col">
                              <span className="font-bold">{o.identity?.full_name}</span>
                              <span className="text-[10px] font-mono font-bold text-primary">{o.service_number}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-bold">{o.employment?.rank}</span>
                              <span className="text-[10px] opacity-60 uppercase">{o.employment?.station}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex gap-1">
                                <Fingerprint className={cn("w-3 h-3", o.enrollment?.fingerprint?.enrolled ? "text-rwanda-green" : "text-muted-foreground/30")} />
                                <UserCheck className={cn("w-3 h-3", o.enrollment?.face?.enrolled ? "text-rwanda-green" : "text-muted-foreground/30")} />
                                <Key className={cn("w-3 h-3", o.enrollment?.pin?.configured ? "text-rwanda-green" : "text-muted-foreground/30")} />
                              </div>
                              <span className="text-[8px] font-black uppercase opacity-60">
                                {[o.enrollment?.fingerprint?.enrolled, o.enrollment?.face?.enrolled, o.enrollment?.pin?.configured].filter(Boolean).length}/3 Complete
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={cn(
                              "text-[8px] font-black uppercase tracking-widest",
                              o.status === 'active' ? "border-rwanda-green text-rwanda-green" :
                              o.status === 'enrollment_ready' ? "border-sky-500 text-sky-500" :
                              o.status === 'suspended' ? "border-destructive text-destructive" :
                              "text-muted-foreground"
                            )}>
                              {o.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-10">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedOfficer(o); setIsOfficerDetailOpen(true); }}>
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Officer Detail/Management Dialog */}
      <Dialog open={isOfficerDetailOpen} onOpenChange={setIsOfficerDetailOpen}>
        <DialogContent className="max-w-4xl rounded-[3rem] p-0 overflow-hidden">
          {selectedOfficer && (
            <ScrollArea className="max-h-[90vh]">
              <div className="p-10 space-y-10">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-secondary flex items-center justify-center border-4 border-background shadow-xl">
                      <ShieldAlert className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black tracking-tight">{selectedOfficer.identity?.full_name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-primary text-[10px] font-black uppercase">{selectedOfficer.service_number}</Badge>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">{selectedOfficer.role.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  </div>
                  <Badge className={cn(
                    "h-10 px-6 rounded-xl flex items-center justify-center font-black uppercase tracking-widest text-[10px]",
                    selectedOfficer.status === 'active' ? "bg-rwanda-green text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {selectedOfficer.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <Card className="bg-secondary/10 border-border rounded-[2rem]">
                    <CardHeader>
                      <CardTitle className="text-xl font-black flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-primary" /> Employment Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[8px] font-black uppercase opacity-60">Rank</p>
                          <p className="text-sm font-bold">{selectedOfficer.employment?.rank}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase opacity-60">Station</p>
                          <p className="text-sm font-bold">{selectedOfficer.employment?.station}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase opacity-60">Department</p>
                          <p className="text-sm font-bold">{selectedOfficer.employment?.department}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase opacity-60">Police ID</p>
                          <p className="text-xs font-mono font-bold">{selectedOfficer.police_id}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-secondary/10 border-border rounded-[2rem]">
                    <CardHeader>
                      <CardTitle className="text-xl font-black flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" /> Authentication Enrollment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        {[
                          { id: 'fingerprint', label: 'Fingerprint', enrolled: selectedOfficer.enrollment?.fingerprint?.enrolled, icon: Fingerprint },
                          { id: 'face', label: 'Facial Recognition', enrolled: selectedOfficer.enrollment?.face?.enrolled, icon: UserCheck },
                          { id: 'pin', label: 'PIN Access', enrolled: selectedOfficer.enrollment?.pin?.configured, icon: Key }
                        ].map((step) => (
                          <div key={step.id} className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border">
                            <div className="flex items-center gap-3">
                              <step.icon className={cn("w-5 h-5", step.enrolled ? "text-rwanda-green" : "text-muted-foreground/30")} />
                              <span className="text-sm font-bold">{step.label}</span>
                            </div>
                            {step.enrolled ? (
                              <Badge className="bg-rwanda-green text-[8px] font-black">ENROLLED</Badge>
                            ) : (
                              <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase" onClick={() => simulateEnrollmentStep(selectedOfficer.police_id, step.id as any)}>
                                Enroll Now
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-border flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase opacity-60">Overall Progress</span>
                        <span className="text-lg font-black">{[selectedOfficer.enrollment?.fingerprint?.enrolled, selectedOfficer.enrollment?.face?.enrolled, selectedOfficer.enrollment?.pin?.configured].filter(Boolean).length} / 3</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <BadgeAlert className="w-5 h-5 text-destructive" />
                    <h3 className="text-xl font-black">Strategic Operations</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {selectedOfficer.status === 'enrollment_ready' && (
                      <Button className="h-14 rounded-2xl bg-rwanda-green hover:bg-rwanda-green/90 font-black uppercase text-xs" onClick={() => handleUpdateOfficerStatus(selectedOfficer.police_id, 'active')}>
                        Activate Officer
                      </Button>
                    )}
                    {selectedOfficer.status === 'active' && (
                      <Button variant="outline" className="h-14 rounded-2xl border-destructive text-destructive font-black uppercase text-xs" onClick={() => handleUpdateOfficerStatus(selectedOfficer.police_id, 'suspended')}>
                        Suspend Node
                      </Button>
                    )}
                    {selectedOfficer.status === 'suspended' && (
                      <Button className="h-14 rounded-2xl bg-rwanda-green font-black uppercase text-xs" onClick={() => handleUpdateOfficerStatus(selectedOfficer.police_id, 'active')}>
                        Re-Activate
                      </Button>
                    )}
                    <Button variant="ghost" className="h-14 rounded-2xl font-black uppercase text-xs opacity-60">Reset Enrollment</Button>
                  </div>
                </div>

                <Card className="rounded-[2rem] border-border bg-secondary/5">
                   <CardHeader className="flex flex-row items-center justify-between">
                     <CardTitle className="text-xl font-black flex items-center gap-2">
                       <History className="w-5 h-5 text-primary" /> Audit History
                     </CardTitle>
                     <Button variant="link" className="text-xs font-black uppercase">View Full Log</Button>
                   </CardHeader>
                   <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-xs font-medium opacity-60">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span>POLICE_CREATED — System — Today 10:45 AM</span>
                        </div>
                        {/* More audit logs would be fetched here */}
                      </div>
                   </CardContent>
                </Card>

              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
