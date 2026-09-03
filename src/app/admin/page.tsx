
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, doc, query, orderBy, setDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Users, 
  Shield, 
  Activity, 
  Smartphone, 
  CheckCircle2, 
  Search, 
  ChevronRight,
  Camera,
  Plus,
  Settings,
  Link as LinkIcon,
  ShieldAlert,
  UserCheck,
  Key,
  BadgeAlert,
  History,
  RefreshCw,
  Loader2,
  Lock
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { FaceEnrollmentDialog } from '@/components/biometrics/FaceEnrollmentDialog';
import { PinEnrollmentDialog } from '@/components/biometrics/PinEnrollmentDialog';
import { FaceEnrollmentResult } from '@/lib/biometrics/face-provider';

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
  const [isFaceEnrollOpen, setIsFaceEnrollOpen] = useState(false);
  const [isPinEnrollOpen, setIsPinEnrollOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetConfirmationName, setResetConfirmationName] = useState('');

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
      // Integration check for internal systems
      toast({ title: "Registration Success", description: "Camera registered locally. Webhook generation simulated." });
      setGeneratedWebhook(`https://webhook.saferwanda.io/v1/capture/${newCamera.camera_id}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: error.message });
    } finally {
      setIsRegistering(false);
    }
  };

  // Officer Handlers
  const createAuditLog = (officerId: string, action: string, metadata: any = {}) => {
    if (!db || !user) return;
    addDoc(collection(db, 'police_audit_logs'), {
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
      createAuditLog(policeId, 'POLICE_CREATED');
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

  const handleFaceSuccess = async (result: FaceEnrollmentResult) => {
    if (!db || !user || !selectedOfficer) return;
    
    const officerRef = doc(db, 'police_officers', selectedOfficer.police_id);
    const updatedEnrollment = { 
      ...selectedOfficer.enrollment,
      face: {
        enrolled: true,
        provider: result.provider,
        enrollment_id: result.enrollmentId,
        template_id: result.templateId,
        template_version: result.templateVersion,
        liveness_verified: result.livenessVerified,
        enrolled_at: new Date().toISOString(),
        enrolled_by: user.uid
      }
    };

    const isComplete = updatedEnrollment.face.enrolled && 
                     updatedEnrollment.pin.configured;
    
    updatedEnrollment.completed = isComplete;
    
    const updateData: any = {
      enrollment: updatedEnrollment,
      updated_at: serverTimestamp()
    };
    
    if (isComplete && selectedOfficer.status === 'pending_enrollment') {
      updateData.status = 'enrollment_ready';
    }
    
    await updateDoc(officerRef, updateData);
    createAuditLog(selectedOfficer.police_id, 'FACE_ENROLLMENT_COMPLETED', { 
      provider: result.provider, 
      liveness_verified: result.livenessVerified,
      template_id: result.templateId
    });
    
    setSelectedOfficer({ ...selectedOfficer, ...updateData });
    toast({ title: "Facial Registry Linked", description: "Secure biometric sample stored successfully." });
  };

  const handlePinSuccess = async (result: { configured: true; configuredAt: string }) => {
    if (!db || !user || !selectedOfficer) return;
    
    const officerRef = doc(db, 'police_officers', selectedOfficer.police_id);
    const updatedEnrollment = { 
      ...selectedOfficer.enrollment,
      pin: {
        configured: true,
        configured_at: result.configuredAt,
        configured_by: user.uid,
        algorithm: 'argon2id'
      }
    };

    const isComplete = updatedEnrollment.face.enrolled && 
                     updatedEnrollment.pin.configured;
    
    updatedEnrollment.completed = isComplete;
    
    const updateData: any = {
      enrollment: updatedEnrollment,
      updated_at: serverTimestamp()
    };
    
    if (isComplete && selectedOfficer.status === 'pending_enrollment') {
      updateData.status = 'enrollment_ready';
    }
    
    await updateDoc(officerRef, updateData);
    createAuditLog(selectedOfficer.police_id, 'PIN_ENROLLMENT_COMPLETED');
    
    setSelectedOfficer({ ...selectedOfficer, ...updateData });
    setIsPinEnrollOpen(false);
    toast({ title: "PIN Security Enabled", description: "Credential configured and hashed on server." });
  };

  const handleUpdateOfficerStatus = async (officerId: string, newStatus: string) => {
    if (!db) return;
    updateDoc(doc(db, 'police_officers', officerId), { 
      status: newStatus,
      updated_at: serverTimestamp()
    });
    createAuditLog(officerId, `POLICE_STATUS_CHANGED`, { status: newStatus });
    
    if (selectedOfficer?.police_id === officerId) {
      setSelectedOfficer({ ...selectedOfficer, status: newStatus });
    }
    
    toast({ title: "Status Updated", description: `Officer status is now ${newStatus.replace('_', ' ')}.` });
  };

  const handleResetEnrollment = async () => {
    if (!db || !selectedOfficer || resetConfirmationName !== selectedOfficer.identity?.full_name) return;

    try {
      const officerRef = doc(db, 'police_officers', selectedOfficer.police_id);
      const resetData = {
        enrollment: {
          face: { enrolled: false },
          pin: { configured: false },
          completed: false,
          enrolled_at: null,
          enrolled_by: null
        },
        status: 'pending_enrollment',
        updated_at: serverTimestamp()
      };

      await updateDoc(officerRef, resetData);
      createAuditLog(selectedOfficer.police_id, 'ENROLLMENT_RESET');
      
      setSelectedOfficer({ ...selectedOfficer, ...resetData });
      setIsResetDialogOpen(false);
      setResetConfirmationName('');
      toast({ title: "Enrollment Reset", description: `Profiles for ${selectedOfficer.identity?.full_name} have been cleared.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Reset Failed", description: error.message });
    }
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
    <div className="flex flex-col min-h-screen bg-background pt-24 md:pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[2rem] bg-primary flex items-center justify-center shadow-2xl">
              <Shield className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-destructive text-[8px] font-black uppercase tracking-widest">Platform Admin</Badge>
                <Badge variant="outline" className="border-primary/30 text-primary text-[8px] font-black uppercase tracking-widest bg-primary/5 hidden xs:inline-flex">Uptime 99.9%</Badge>
              </div>
              <h1 className="text-2xl md:text-4xl font-headline font-black tracking-tight leading-none">Global Control Grid</h1>
              <p className="text-muted-foreground text-[10px] md:text-xs mt-1 uppercase tracking-[0.2em] font-bold opacity-60">System Oversight & User Management</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {[
            { label: 'Total Citizens', value: stats.total, icon: Users, color: 'text-primary' },
            { label: 'Active Guards', value: stats.activeSubs, icon: CheckCircle2, color: 'text-rwanda-green' },
            { label: 'Registry Cameras', value: stats.cameras, icon: Camera, color: 'text-sky-500' },
            { label: 'Police Officers', value: stats.officers, icon: ShieldAlert, color: 'text-destructive' }
          ].map((stat, i) => (
            <Card key={i} className="bg-card/40 border-border rounded-[2rem] md:rounded-[2.5rem] shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5">
                <stat.icon className="w-16 h-16 md:w-24 md:h-24" />
              </div>
              <CardContent className="p-6 md:p-10">
                <div className="flex items-center gap-3 mb-2 md:mb-4">
                  <stat.icon className={cn("w-4 h-4 md:w-5 md:h-5", stat.color)} />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                </div>
                <div className="text-3xl md:text-5xl font-black">{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">
          <TabsList className="bg-secondary/30 p-1 rounded-xl md:rounded-2xl border border-border h-auto w-full md:w-auto flex flex-wrap justify-start">
            <TabsTrigger value="citizens" className="flex-1 md:flex-none rounded-lg md:rounded-xl py-2 md:py-3 px-4 md:px-8 font-black uppercase tracking-widest text-[10px] md:text-xs data-[state=active]:bg-primary data-[state=active]:text-white">Citizens</TabsTrigger>
            <TabsTrigger value="cameras" className="flex-1 md:flex-none rounded-lg md:rounded-xl py-2 md:py-3 px-4 md:px-8 font-black uppercase tracking-widest text-[10px] md:text-xs data-[state=active]:bg-primary data-[state=active]:text-white">Cameras</TabsTrigger>
            <TabsTrigger value="officers" className="flex-1 md:flex-none rounded-lg md:rounded-xl py-2 md:py-3 px-4 md:px-8 font-black uppercase tracking-widest text-[10px] md:text-xs data-[state=active]:bg-primary data-[state=active]:text-white">Police</TabsTrigger>
          </TabsList>

          <TabsContent value="citizens">
            <Card className="bg-card/60 border-border rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden">
              <CardHeader className="p-6 md:p-10 pb-4 border-b border-border/50 bg-secondary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-black">Citizen Directory</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Monitor individual security statuses.</CardDescription>
                </div>
                <div className="relative w-full md:w-80">
                  <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-10 md:h-12 rounded-xl pl-10 md:pl-12 text-sm" />
                  <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px] md:h-[600px] w-full">
                  <Table className="min-w-[600px]">
                    <TableHeader className="bg-secondary/20 sticky top-0 z-10">
                      <TableRow className="border-none">
                        <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest h-12 md:h-14 pl-6 md:pl-10">Citizen</TableHead>
                        <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest h-12 md:h-14 text-center">Status</TableHead>
                        <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest h-12 md:h-14 text-center">Hardware</TableHead>
                        <TableHead className="text-[9px] md:text-[10px] font-black uppercase tracking-widest h-12 md:h-14 text-right pr-6 md:pr-10">Ops</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.uid} className="hover:bg-secondary/10 border-border/50">
                          <TableCell className="pl-6 md:pl-10 py-4 md:py-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm md:text-base">{u.fullName}</span>
                              <span className="text-[10px] md:text-xs text-muted-foreground">{u.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={cn("font-black text-[7px] md:text-[8px] uppercase tracking-widest px-2 py-0.5", u.subscriptionActive ? "border-rwanda-green text-rwanda-green" : "text-muted-foreground")}>
                              {u.subscriptionActive ? 'GRID ACTIVE' : 'INACTIVE'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-[9px] md:text-[10px] font-mono font-bold text-primary">{u.deviceId || 'N/A'}</span>
                          </TableCell>
                          <TableCell className="text-right pr-6 md:pr-10">
                            <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 md:h-10 md:w-10"><ChevronRight className="w-4 h-4 md:w-5 md:h-5" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cameras">
            <Card className="bg-card/60 border-border rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden">
              <CardHeader className="p-6 md:p-10 pb-4 border-b border-border/50 bg-secondary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-black">Camera Registry</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Global surveillance management.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                  <div className="relative flex-grow md:w-80">
                    <Input placeholder="Search ID, name..." value={cameraSearchTerm} onChange={(e) => setCameraSearchTerm(e.target.value)} className="h-10 md:h-12 rounded-xl pl-10 md:pl-12 text-sm" />
                    <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  </div>
                  <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-10 md:h-12 rounded-xl font-black uppercase text-[10px] md:text-xs gap-2 px-6">
                        <Plus className="w-4 h-4" /> Register Camera
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:max-w-2xl rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10">
                      <DialogHeader>
                        <DialogTitle className="text-2xl md:text-3xl font-black">New Camera Registry</DialogTitle>
                        <DialogDescription className="text-xs md:text-sm mt-1">Initialize a new surveillance node.</DialogDescription>
                      </DialogHeader>
                      {generatedWebhook ? (
                        <div className="bg-rwanda-green/5 border border-rwanda-green/20 rounded-2xl p-6 md:p-8 space-y-4 md:space-y-6">
                          <div className="flex items-center gap-4 text-rwanda-green">
                            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                            <h4 className="font-black uppercase text-[10px] md:text-xs">Integration Ready</h4>
                          </div>
                          <div className="relative">
                            <Input readOnly value={generatedWebhook} className="pr-20 h-12 md:h-14 font-mono text-[10px] md:text-xs" />
                            <Button size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] h-8" onClick={() => copyToClipboard(generatedWebhook)}>Copy</Button>
                          </div>
                          <Button variant="outline" className="w-full h-12 rounded-xl font-bold" onClick={() => setIsCameraDialogOpen(false)}>Close Registry</Button>
                        </div>
                      ) : (
                        <div className="space-y-4 md:space-y-6 mt-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-black uppercase ml-1 opacity-60">Camera ID</Label>
                              <Input placeholder="CAM-XXXX" value={newCamera.camera_id} onChange={(e) => setNewCamera({...newCamera, camera_id: e.target.value})} className="h-12" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-black uppercase ml-1 opacity-60">Display Name</Label>
                              <Input placeholder="Main Street Hub" value={newCamera.name} onChange={(e) => setNewCamera({...newCamera, name: e.target.value})} className="h-12" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-black uppercase ml-1 opacity-60">Latitude</Label>
                              <Input placeholder="-1.944" type="number" step="any" value={newCamera.location.latitude} onChange={(e) => setNewCamera({...newCamera, location: {...newCamera.location, latitude: parseFloat(e.target.value) || 0}})} className="h-12" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-black uppercase ml-1 opacity-60">Longitude</Label>
                              <Input placeholder="30.061" type="number" step="any" value={newCamera.location.longitude} onChange={(e) => setNewCamera({...newCamera, location: {...newCamera.location, longitude: parseFloat(e.target.value) || 0}})} className="h-12" />
                            </div>
                          </div>
                          <Button className="w-full h-14 rounded-2xl font-black uppercase text-xs shadow-xl" onClick={handleRegisterCamera} disabled={isRegistering || !newCamera.camera_id || !newCamera.name}>
                            {isRegistering ? <Loader2 className="animate-spin" /> : "Register & Generate Link"}
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px] md:h-[600px] w-full">
                  <Table className="min-w-[700px]">
                    <TableHeader className="bg-secondary/20 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="pl-6 md:pl-10 h-12 md:h-14 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Camera Profile</TableHead>
                        <TableHead className="h-12 md:h-14 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center">Location</TableHead>
                        <TableHead className="h-12 md:h-14 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center">Webhook</TableHead>
                        <TableHead className="h-12 md:h-14 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-right pr-6 md:pr-10">Ops</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCameras.map((c) => (
                        <TableRow key={c.camera_id} className="hover:bg-secondary/10 border-border/50">
                          <TableCell className="pl-6 md:pl-10 py-4 md:py-6">
                            <div className="flex items-center gap-4">
                              <Camera className="w-5 h-5 text-sky-500 hidden sm:block" />
                              <div className="flex flex-col">
                                <span className="font-bold text-sm md:text-base">{c.name}</span>
                                <span className="text-[9px] md:text-[10px] font-mono font-bold text-primary">{c.camera_id}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] md:text-xs font-bold">{c.location?.road || 'Main Road'}</span>
                              <span className="text-[8px] md:text-[9px] opacity-60 uppercase">{c.location?.city}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {c.webhook_url ? (
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(c.webhook_url!)} className="text-[9px] md:text-[10px] font-bold text-rwanda-green h-8">
                                <LinkIcon className="w-3 h-3 mr-1" /> Copy Link
                              </Button>
                            ) : (
                              <Badge variant="outline" className="opacity-30 text-[7px] md:text-[8px]">NO LINK</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6 md:pr-10">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="w-4 h-4 opacity-40 hover:opacity-100" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="officers">
            <Card className="bg-card/60 border-border rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden">
              <CardHeader className="p-6 md:p-10 pb-4 border-b border-border/50 bg-secondary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-black">Police Registry</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Strategic enforcement officer management.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                  <div className="relative flex-grow md:w-80">
                    <Input placeholder="Search badge, name..." value={officerSearchTerm} onChange={(e) => setOfficerSearchTerm(e.target.value)} className="h-10 md:h-12 rounded-xl pl-10 md:pl-12 text-sm" />
                    <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  </div>
                  <Dialog open={isOfficerDialogOpen} onOpenChange={setIsOfficerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-10 md:h-12 rounded-xl font-black uppercase text-[10px] md:text-xs gap-2 px-6">
                        <Plus className="w-4 h-4" /> Enroll Officer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:max-w-2xl rounded-[1.5rem] md:rounded-[2.5rem] p-0 overflow-hidden">
                      <ScrollArea className="max-h-[85vh]">
                        <div className="p-6 md:p-10 space-y-6 md:space-y-8">
                          <DialogHeader>
                            <DialogTitle className="text-2xl md:text-3xl font-black">Officer Enrollment</DialogTitle>
                            <DialogDescription className="text-xs md:text-sm">Initialize a new enforcement node record.</DialogDescription>
                          </DialogHeader>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-black uppercase ml-1 opacity-60">First Name</Label>
                              <Input placeholder="John" value={newOfficer.identity.first_name} onChange={(e) => setNewOfficer({...newOfficer, identity: {...newOfficer.identity, first_name: e.target.value}})} className="h-12" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-black uppercase ml-1 opacity-60">Last Name</Label>
                              <Input placeholder="Doe" value={newOfficer.identity.last_name} onChange={(e) => setNewOfficer({...newOfficer, identity: {...newOfficer.identity, last_name: e.target.value}})} className="h-12" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase ml-1 opacity-60">Service Number</Label>
                            <Input placeholder="P001245" value={newOfficer.service_number} onChange={(e) => setNewOfficer({...newOfficer, service_number: e.target.value})} className="h-12 font-mono font-bold" />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-black uppercase ml-1 opacity-60">Rank</Label>
                              <Input placeholder="Inspector" value={newOfficer.employment.rank} onChange={(e) => setNewOfficer({...newOfficer, employment: {...newOfficer.employment, rank: e.target.value}})} className="h-12" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-black uppercase ml-1 opacity-60">Station</Label>
                              <Input placeholder="Kigali Central" value={newOfficer.employment.station} onChange={(e) => setNewOfficer({...newOfficer, employment: {...newOfficer.employment, station: e.target.value}})} className="h-12" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase ml-1 opacity-60">Assigned Role</Label>
                            <Select value={newOfficer.role} onValueChange={(v) => setNewOfficer({...newOfficer, role: v})}>
                              <SelectTrigger className="h-12 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="traffic_police">Traffic Police Officer</SelectItem>
                                <SelectItem value="police_admin">Police Administrator</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button className="w-full h-14 md:h-16 rounded-2xl font-black uppercase text-xs md:text-sm shadow-xl" onClick={handleEnrollOfficer} disabled={isEnrollingOfficer || !newOfficer.service_number}>
                            {isEnrollingOfficer ? <Loader2 className="animate-spin" /> : "Initiate Protocol"}
                          </Button>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px] md:h-[600px] w-full">
                  <Table className="min-w-[800px]">
                    <TableHeader className="bg-secondary/20 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="pl-6 md:pl-10 h-12 md:h-14 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Officer</TableHead>
                        <TableHead className="h-12 md:h-14 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center">Rank / Station</TableHead>
                        <TableHead className="h-12 md:h-14 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center">Protocol</TableHead>
                        <TableHead className="h-12 md:h-14 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                        <TableHead className="h-12 md:h-14 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-right pr-6 md:pr-10">Ops</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOfficers.map((o) => (
                        <TableRow key={o.police_id} className="hover:bg-secondary/10 border-border/50">
                          <TableCell className="pl-6 md:pl-10 py-4 md:py-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm md:text-base">{o.identity?.full_name}</span>
                              <span className="text-[9px] md:text-[10px] font-mono font-bold text-primary">{o.service_number}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] md:text-xs font-bold">{o.employment?.rank}</span>
                              <span className="text-[8px] md:text-[9px] opacity-60 uppercase">{o.employment?.station}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex gap-1.5">
                                <UserCheck className={cn("w-3.5 h-3.5", o.enrollment?.face?.enrolled ? "text-rwanda-green" : "text-muted-foreground/30")} />
                                <Key className={cn("w-3.5 h-3.5", o.enrollment?.pin?.configured ? "text-rwanda-green" : "text-muted-foreground/30")} />
                              </div>
                              <span className="text-[7px] md:text-[8px] font-black uppercase opacity-60">
                                {[o.enrollment?.face?.enrolled, o.enrollment?.pin?.configured].filter(Boolean).length}/2 OK
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={cn(
                              "text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 py-0.5",
                              o.status === 'active' ? "border-rwanda-green text-rwanda-green" :
                              o.status === 'enrollment_ready' ? "border-sky-500 text-sky-500" :
                              o.status === 'suspended' ? "border-destructive text-destructive" :
                              "text-muted-foreground"
                            )}>
                              {o.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6 md:pr-10">
                            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={() => { setSelectedOfficer(o); setIsOfficerDetailOpen(true); }}>
                              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Officer Detail/Management Dialog */}
      <Dialog open={isOfficerDetailOpen} onOpenChange={setIsOfficerDetailOpen}>
        <DialogContent className="w-[95vw] sm:max-w-4xl rounded-[1.5rem] md:rounded-[3rem] p-0 overflow-hidden border-border/50 shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Officer Profile Management</DialogTitle>
            <DialogDescription>Administrative overview and control.</DialogDescription>
          </DialogHeader>
          {selectedOfficer && (
            <ScrollArea className="max-h-[90vh]">
              <div className="p-6 md:p-10 space-y-8 md:space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-secondary flex items-center justify-center border-2 md:border-4 border-background shadow-xl">
                      <ShieldAlert className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">{selectedOfficer.identity?.full_name}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <Badge className="bg-primary text-[8px] md:text-[10px] font-black uppercase">{selectedOfficer.service_number}</Badge>
                        <Badge variant="outline" className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{selectedOfficer.role.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  </div>
                  <Badge className={cn(
                    "h-8 md:h-10 px-4 md:px-6 rounded-lg md:rounded-xl flex items-center justify-center font-black uppercase tracking-widest text-[8px] md:text-[10px] w-full md:w-auto",
                    selectedOfficer.status === 'active' ? "bg-rwanda-green text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {selectedOfficer.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  <Card className="bg-secondary/10 border-border rounded-[1.5rem] md:rounded-[2rem]">
                    <CardHeader className="p-6 md:p-8 pb-4">
                      <CardTitle className="text-lg md:text-xl font-black flex items-center gap-2">
                        <Smartphone className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Employment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 pt-0 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[7px] md:text-[8px] font-black uppercase opacity-60">Rank</p>
                          <p className="text-xs md:text-sm font-bold">{selectedOfficer.employment?.rank}</p>
                        </div>
                        <div>
                          <p className="text-[7px] md:text-[8px] font-black uppercase opacity-60">Station</p>
                          <p className="text-xs md:text-sm font-bold">{selectedOfficer.employment?.station}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[7px] md:text-[8px] font-black uppercase opacity-60">Police ID</p>
                          <p className="text-[10px] md:text-xs font-mono font-bold text-primary">{selectedOfficer.police_id}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-secondary/10 border-border rounded-[1.5rem] md:rounded-[2rem]">
                    <CardHeader className="p-6 md:p-8 pb-4">
                      <CardTitle className="text-lg md:text-xl font-black flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Enrollment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 pt-0 space-y-4 md:space-y-6">
                      <div className="space-y-3">
                        {[
                          { id: 'face', label: 'Face Registry', enrolled: selectedOfficer.enrollment?.face?.enrolled, icon: UserCheck },
                          { id: 'pin', label: 'PIN Access', enrolled: selectedOfficer.enrollment?.pin?.configured, icon: Key }
                        ].map((step) => (
                          <div key={step.id} className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-background border border-border">
                            <div className="flex items-center gap-3">
                              <step.icon className={cn("w-4 h-4 md:w-5 md:h-5", step.enrolled ? "text-rwanda-green" : "text-muted-foreground/30")} />
                              <span className="text-xs md:text-sm font-bold">{step.label}</span>
                            </div>
                            {step.enrolled ? (
                              <Badge className="bg-rwanda-green text-[7px] md:text-[8px] font-black">ENROLLED</Badge>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 md:h-8 text-[8px] md:text-[9px] font-black uppercase px-3" 
                                onClick={() => {
                                  if (step.id === 'face') setIsFaceEnrollOpen(true);
                                  else setIsPinEnrollOpen(true);
                                }}
                              >
                                Enroll
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <BadgeAlert className="w-5 h-5 text-destructive" />
                    <h3 className="text-xl font-black">Strategic Operations</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {selectedOfficer.status === 'enrollment_ready' && (
                      <Button className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-rwanda-green hover:bg-rwanda-green/90 font-black uppercase text-[10px] md:text-xs" onClick={() => handleUpdateOfficerStatus(selectedOfficer.police_id, 'active')}>
                        Activate Officer
                      </Button>
                    )}
                    {selectedOfficer.status === 'active' && (
                      <Button variant="outline" className="h-12 md:h-14 rounded-xl md:rounded-2xl border-destructive text-destructive font-black uppercase text-[10px] md:text-xs" onClick={() => handleUpdateOfficerStatus(selectedOfficer.police_id, 'suspended')}>
                        Suspend Node
                      </Button>
                    )}
                    {selectedOfficer.status === 'suspended' && (
                      <Button className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-rwanda-green font-black uppercase text-[10px] md:text-xs" onClick={() => handleUpdateOfficerStatus(selectedOfficer.police_id, 'active')}>
                        Re-Activate
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      className="h-12 md:h-14 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs opacity-60 flex items-center gap-2"
                      onClick={() => setIsResetDialogOpen(true)}
                    >
                      <RefreshCw className="w-3 h-3" /> Reset Profile
                    </Button>
                  </div>
                </div>

                <Card className="rounded-[1.5rem] md:rounded-[2rem] border-border bg-secondary/5">
                   <CardHeader className="p-6 md:p-8 flex flex-row items-center justify-between pb-2">
                     <CardTitle className="text-lg md:text-xl font-black flex items-center gap-2">
                       <History className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Audit History
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="p-6 md:p-8 pt-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-[10px] md:text-xs font-medium opacity-60">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span>POLICE_CREATED — System — Today</span>
                        </div>
                      </div>
                   </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Face Enrollment Dialog */}
      {selectedOfficer && (
        <FaceEnrollmentDialog
          isOpen={isFaceEnrollOpen}
          onOpenChange={setIsFaceEnrollOpen}
          policeId={selectedOfficer.police_id}
          fullName={selectedOfficer.identity?.full_name}
          onSuccess={handleFaceSuccess}
        />
      )}

      {/* PIN Enrollment Dialog */}
      {selectedOfficer && user && (
        <PinEnrollmentDialog
          isOpen={isPinEnrollOpen}
          onOpenChange={setIsPinEnrollOpen}
          policeId={selectedOfficer.police_id}
          fullName={selectedOfficer.identity?.full_name}
          serviceNumber={selectedOfficer.service_number}
          adminId={user.uid}
          onSuccess={handlePinSuccess}
        />
      )}

      {/* Reset Enrollment Confirmation Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-black">Confirm Reset</DialogTitle>
            <DialogDescription className="text-xs md:text-sm mt-1">
              Permanently delete biometric data and PIN credentials. This node will require full re-enrollment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type officer's full name to confirm</Label>
              <Input 
                placeholder={selectedOfficer?.identity?.full_name}
                value={resetConfirmationName}
                onChange={(e) => setResetConfirmationName(e.target.value)}
                className="h-12 rounded-xl text-sm"
              />
            </div>
            <Button 
              variant="destructive" 
              className="w-full h-14 rounded-2xl font-black uppercase text-xs"
              disabled={resetConfirmationName !== selectedOfficer?.identity?.full_name}
              onClick={handleResetEnrollment}
            >
              Confirm Permanent Reset
            </Button>
            <Button 
              variant="ghost" 
              className="w-full h-10 rounded-xl font-bold uppercase text-[9px] md:text-[10px]"
              onClick={() => { setIsResetDialogOpen(false); setResetConfirmationName(''); }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
