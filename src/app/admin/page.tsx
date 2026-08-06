
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, doc, query, orderBy, setDoc, updateDoc } from 'firebase/firestore';
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
  ExternalLink
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
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [cameraSearchTerm, setCameraSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('citizens');
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [generatedWebhook, setGeneratedWebhook] = useState<string | null>(null);

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

  // Check admin status
  const profileRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [user, db]);
  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  // Fetch all users
  const usersQuery = useMemo(() => (db ? query(collection(db, 'users'), orderBy('createdAt', 'desc')) : null), [db]);
  const { data: allUsers, loading: usersLoading } = useCollection(usersQuery);

  // Fetch all cameras
  const camerasQuery = useMemo(() => (db ? collection(db, 'cameras') : null), [db]);
  const { data: allCameras, loading: camerasLoading } = useCollection(camerasQuery);

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

  const stats = useMemo(() => {
    if (!allUsers) return { total: 0, activeSubs: 0, devices: 0, cameras: 0 };
    return {
      total: allUsers.length,
      activeSubs: allUsers.filter(u => u.subscriptionActive).length,
      devices: allUsers.filter(u => u.deviceId).length,
      cameras: allCameras?.length || 0
    };
  }, [allUsers, allCameras]);

  const handleRegisterCamera = async () => {
    if (!db || !newCamera.camera_id || !newCamera.name) return;
    
    setIsRegistering(true);
    setGeneratedWebhook(null);

    try {
      // Step 1: Create the camera record in Firestore
      const cameraRef = doc(db, 'cameras', newCamera.camera_id);
      await setDoc(cameraRef, newCamera);

      // Step 2: Send POST to Node-RED
      const response = await fetch(
        'http://159.65.234.249:1880/api/cameras/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCamera),
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result);
      }

      console.log("Camera registration successful:", result);

      // Step 3 & 4: Parse result and update Firestore with webhook_url
      const resultJson = JSON.parse(result);
      
      if (resultJson.success && resultJson.webhook_url) {
        await updateDoc(cameraRef, {
          webhook_url: resultJson.webhook_url
        });
        setGeneratedWebhook(resultJson.webhook_url);
        
        toast({
          title: "Registration Success",
          description: "Camera registered and synced with Node-RED.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Integration Issue",
          description: "Camera saved but Node-RED sync was incomplete.",
        });
      }

    } catch (error: any) {
      console.error("Error registering camera:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Webhook URL copied to clipboard.",
    });
  };

  if (userLoading || profileLoading || usersLoading || camerasLoading) {
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
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">This area is reserved for system administrators. Please contact support if you believe this is an error.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="rounded-xl font-bold h-12 px-8">
          Return to Dashboard
        </Button>
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
          <div className="flex gap-3 bg-secondary/30 p-2 rounded-2xl border border-border">
            <Button variant="ghost" className="rounded-xl font-bold gap-2"><Activity className="w-4 h-4" /> Logs</Button>
            <Button variant="ghost" className="rounded-xl font-bold gap-2"><BarChart3 className="w-4 h-4" /> Reports</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Citizens', value: stats.total, icon: Users, color: 'text-primary' },
            { label: 'Active Guards', value: stats.activeSubs, icon: CheckCircle2, color: 'text-rwanda-green' },
            { label: 'Hardware Nodes', value: stats.devices, icon: Smartphone, color: 'text-accent' },
            { label: 'Registry Cameras', value: stats.cameras, icon: Camera, color: 'text-sky-500' }
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
          <TabsList className="bg-secondary/30 p-1.5 rounded-2xl border border-border h-auto">
            <TabsTrigger value="citizens" className="rounded-xl py-3 px-8 font-black uppercase tracking-widest text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
              Citizens
            </TabsTrigger>
            <TabsTrigger value="cameras" className="rounded-xl py-3 px-8 font-black uppercase tracking-widest text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
              Camera Registry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="citizens">
            <Card className="bg-card/60 border-border rounded-[3rem] shadow-2xl overflow-hidden">
              <CardHeader className="p-10 pb-6 border-b border-border/50 bg-secondary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <CardTitle className="text-3xl font-black">Citizen Directory</CardTitle>
                  <CardDescription className="text-sm font-light">Monitor individual security statuses across the nation.</CardDescription>
                </div>
                <div className="flex w-full md:w-auto gap-2">
                  <div className="relative flex-grow md:w-80">
                    <Input 
                      placeholder="Search name, email, or node..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-12 rounded-xl bg-background border-border pl-12"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  </div>
                  <Button variant="outline" className="h-12 w-12 rounded-xl p-0 shrink-0"><Filter className="w-4 h-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px] w-full">
                  <Table>
                    <TableHeader className="bg-secondary/20 sticky top-0 z-10">
                      <TableRow className="border-none">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest h-14 pl-10">Citizen / Operator</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest h-14 text-center">Security Status</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest h-14 text-center">Services</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest h-14 text-center">Hardware Node</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest h-14 text-right pr-10">Operations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.uid} className="hover:bg-secondary/10 transition-colors border-border/50">
                            <TableCell className="pl-10 py-6">
                              <div className="flex flex-col">
                                <span className="font-bold text-base flex items-center gap-2">
                                  {user.fullName}
                                  {user.isAdmin && <Badge className="bg-destructive text-[7px] h-4 py-0">Admin</Badge>}
                                </span>
                                <span className="text-xs text-muted-foreground opacity-60">{user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={cn(
                                "font-black text-[8px] uppercase tracking-widest px-3 py-1",
                                user.subscriptionActive ? "border-rwanda-green text-rwanda-green bg-rwanda-green/5" : "border-muted text-muted-foreground"
                              )}>
                                {user.subscriptionActive ? 'GRID ACTIVE' : 'INACTIVE'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center gap-1">
                                {user.servicesSelected?.map((s: string) => (
                                  <div key={s} className="w-2 h-2 rounded-full bg-primary" title={s} />
                                ))}
                                {!user.servicesSelected?.length && <span className="text-[10px] text-muted-foreground opacity-40">None</span>}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {user.deviceId ? (
                                <div className="flex flex-col items-center">
                                  <span className="text-[10px] font-mono font-bold text-primary">{user.deviceId}</span>
                                  <span className="text-[8px] uppercase opacity-50">{user.deviceName}</span>
                                </div>
                              ) : (
                                <AlertCircle className="w-4 h-4 mx-auto text-muted-foreground/30" />
                              )}
                            </TableCell>
                            <TableCell className="text-right pr-10">
                              <Button variant="ghost" size="icon" className="rounded-lg h-10 w-10 hover:bg-primary/10 hover:text-primary">
                                <ChevronRight className="w-5 h-5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="py-24 text-center">
                            <p className="text-muted-foreground font-bold">No results matching your query.</p>
                          </TableCell>
                        </TableRow>
                      )}
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
                  <CardDescription className="text-sm font-light">Global surveillance grid management.</CardDescription>
                </div>
                <div className="flex w-full md:w-auto gap-4">
                  <div className="relative flex-grow md:w-80">
                    <Input 
                      placeholder="Search ID, name, or location..." 
                      value={cameraSearchTerm}
                      onChange={(e) => setCameraSearchTerm(e.target.value)}
                      className="h-12 rounded-xl bg-background border-border pl-12"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  </div>
                  
                  <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-12 rounded-xl font-black uppercase tracking-widest text-xs gap-2 px-6" onClick={() => {
                        setGeneratedWebhook(null);
                        setNewCamera({
                          camera_id: '',
                          name: '',
                          location: { city: 'Kigali', district: '', road: '', latitude: -1.944, longitude: 30.061 },
                          owner: { organization: 'Traffic Authority' },
                          services: { 
                            live_stream: true, 
                            abnormal_activity_alert: true, 
                            information_storage: false, 
                            information_retrieval: false, 
                            traffic_enforcement: true 
                          },
                          rules: { allowed_events: ['Line Crossing', 'Loitering', 'Region Entrance'] }
                        });
                      }}>
                        <Plus className="w-4 h-4" /> Register Camera
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-background border-border rounded-[2.5rem] shadow-2xl p-0 overflow-hidden">
                      <ScrollArea className="max-h-[85vh]">
                        <div className="p-10 space-y-8">
                          <DialogHeader>
                            <DialogTitle className="text-3xl font-black">New Camera Registry</DialogTitle>
                            <DialogDescription>Initialize a new surveillance node and generate unique webhook integration.</DialogDescription>
                          </DialogHeader>

                          {generatedWebhook ? (
                            <div className="bg-rwanda-green/5 border border-rwanda-green/20 rounded-2xl p-8 space-y-6 animate-in zoom-in-95">
                              <div className="flex items-center gap-4 text-rwanda-green">
                                <div className="w-12 h-12 rounded-full bg-rwanda-green/10 flex items-center justify-center">
                                  <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                  <h4 className="font-black uppercase tracking-widest text-xs">Integration Ready</h4>
                                  <p className="text-sm opacity-80">Copy the following URL into the Milesight camera settings.</p>
                                </div>
                              </div>
                              <div className="relative">
                                <Input 
                                  readOnly 
                                  value={generatedWebhook} 
                                  className="pr-24 h-14 bg-background border-rwanda-green/30 font-mono text-xs"
                                />
                                <Button 
                                  size="sm"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-lg px-4 gap-2"
                                  onClick={() => copyToClipboard(generatedWebhook)}
                                >
                                  <Copy className="w-3.5 h-3.5" /> Copy
                                </Button>
                              </div>
                              <Button 
                                variant="outline" 
                                className="w-full h-12 rounded-xl border-rwanda-green/30 text-rwanda-green"
                                onClick={() => setIsCameraDialogOpen(false)}
                              >
                                Close & Return to Grid
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Camera ID</Label>
                                  <Input 
                                    placeholder="CAM_RW_000001" 
                                    value={newCamera.camera_id}
                                    onChange={(e) => setNewCamera({...newCamera, camera_id: e.target.value})}
                                    className="h-12 rounded-xl"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</Label>
                                  <Input 
                                    placeholder="KN 5 Road Camera" 
                                    value={newCamera.name}
                                    onChange={(e) => setNewCamera({...newCamera, name: e.target.value})}
                                    className="h-12 rounded-xl"
                                  />
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Location Profile</h4>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Road</Label>
                                    <Input 
                                      placeholder="KN 5 Road" 
                                      value={newCamera.location.road}
                                      onChange={(e) => setNewCamera({...newCamera, location: {...newCamera.location, road: e.target.value}})}
                                      className="h-11 rounded-xl"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">District</Label>
                                    <Input 
                                      placeholder="Gasabo" 
                                      value={newCamera.location.district}
                                      onChange={(e) => setNewCamera({...newCamera, location: {...newCamera.location, district: e.target.value}})}
                                      className="h-11 rounded-xl"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">City</Label>
                                    <Input 
                                      placeholder="Kigali" 
                                      value={newCamera.location.city}
                                      onChange={(e) => setNewCamera({...newCamera, location: {...newCamera.location, city: e.target.value}})}
                                      className="h-11 rounded-xl"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Latitude</Label>
                                    <Input 
                                      type="number"
                                      step="any"
                                      placeholder="-1.944" 
                                      value={newCamera.location.latitude}
                                      onChange={(e) => setNewCamera({...newCamera, location: {...newCamera.location, latitude: parseFloat(e.target.value) || 0}})}
                                      className="h-11 rounded-xl"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Longitude</Label>
                                    <Input 
                                      type="number"
                                      step="any"
                                      placeholder="30.061" 
                                      value={newCamera.location.longitude}
                                      onChange={(e) => setNewCamera({...newCamera, location: {...newCamera.location, longitude: parseFloat(e.target.value) || 0}})}
                                      className="h-11 rounded-xl"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Active Services</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  {Object.entries(newCamera.services).map(([key, val]) => (
                                    <div key={key} className="flex items-center space-x-2 bg-secondary/30 p-4 rounded-xl border border-border">
                                      <Checkbox 
                                        id={key} 
                                        checked={val} 
                                        onCheckedChange={(checked) => setNewCamera({
                                          ...newCamera, 
                                          services: {...newCamera.services, [key]: !!checked}
                                        })} 
                                      />
                                      <Label htmlFor={key} className="text-[10px] font-bold uppercase cursor-pointer">
                                        {key.replace(/_/g, ' ')}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <Button 
                                className="w-full h-14 rounded-xl font-black uppercase tracking-widest gap-2"
                                onClick={handleRegisterCamera}
                                disabled={isRegistering || !newCamera.camera_id || !newCamera.name}
                              >
                                {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-4 h-4" />}
                                {isRegistering ? "Initializing Integration..." : "Register & Sync Webhook"}
                              </Button>
                            </>
                          )}
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
                      <TableRow className="border-none">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest h-14 pl-10">Camera Profile</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest h-14 text-center">Location</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest h-14 text-center">Webhook</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest h-14 text-center">Status</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest h-14 text-right pr-10">Grid Control</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCameras.length > 0 ? (
                        filteredCameras.map((camera) => (
                          <TableRow key={camera.camera_id} className="hover:bg-secondary/10 transition-colors border-border/50">
                            <TableCell className="pl-10 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                                  <Camera className="w-5 h-5 text-sky-500" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-base">{camera.name}</span>
                                  <span className="text-[10px] font-mono font-bold text-primary">{camera.camera_id}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-bold flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-destructive" />
                                  {camera.location?.road}
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase">{camera.location?.district}, {camera.location?.city}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {camera.webhook_url ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 gap-2 rounded-lg text-[10px] font-bold text-rwanda-green bg-rwanda-green/5 hover:bg-rwanda-green hover:text-white"
                                  onClick={() => copyToClipboard(camera.webhook_url!)}
                                >
                                  <LinkIcon className="w-3.5 h-3.5" /> Copy URL
                                </Button>
                              ) : (
                                <Badge variant="outline" className="text-[8px] font-bold opacity-30">NO LINK</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={cn(
                                "text-[9px] font-bold uppercase",
                                camera.webhook_url ? "border-rwanda-green text-rwanda-green" : "border-amber-500 text-amber-500"
                              )}>
                                {camera.webhook_url ? 'SYNCED' : 'PENDING'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-10">
                              <Button variant="ghost" size="icon" className="rounded-lg h-10 w-10">
                                <Settings className="w-5 h-5 opacity-40 hover:opacity-100 hover:text-primary transition-all" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="py-24 text-center">
                            <p className="text-muted-foreground font-bold">No cameras registered in this sector.</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
