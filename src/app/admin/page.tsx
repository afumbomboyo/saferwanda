
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, doc, query, orderBy, updateDoc } from 'firebase/firestore';
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
  UserPlus
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
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [promoting, setPromoting] = useState(false);

  // Check admin status
  const profileRef = useMemo(() => (user && db ? doc(db, 'users', user.uid) : null), [user, db]);
  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  // Fetch all users
  const usersQuery = useMemo(() => (db ? query(collection(db, 'users'), orderBy('createdAt', 'desc')) : null), [db]);
  const { data: allUsers, loading: usersLoading } = useCollection(usersQuery);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/auth');
    }
  }, [user, userLoading, router]);

  const handlePromoteToAdmin = async () => {
    if (!user || !db) return;
    setPromoting(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { isAdmin: true });
      toast({
        title: "Administrative Access Granted",
        description: "You now have full platform oversight privileges.",
      });
    } catch (err) {
      console.error("Promotion error:", err);
      toast({
        variant: "destructive",
        title: "Access Request Failed",
        description: "Could not update your permissions at this time.",
      });
    } finally {
      setPromoting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter(u => 
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.deviceId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm]);

  const stats = useMemo(() => {
    if (!allUsers) return { total: 0, activeSubs: 0, devices: 0 };
    return {
      total: allUsers.length,
      activeSubs: allUsers.filter(u => u.subscriptionActive).length,
      devices: allUsers.filter(u => u.deviceId).length
    };
  }, [allUsers]);

  if (userLoading || profileLoading || usersLoading) {
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
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">You do not have administrative privileges. For development testing, you can promote your account below.</p>
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handlePromoteToAdmin} 
            className="rounded-xl font-bold bg-destructive hover:bg-destructive/90 px-8 h-12 gap-2"
            disabled={promoting}
          >
            {promoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Claim Administrative Privileges
          </Button>
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="rounded-xl font-bold">Return to Dashboard</Button>
        </div>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Citizens', value: stats.total, icon: Users, color: 'text-primary' },
            { label: 'Active Guards', value: stats.activeSubs, icon: CheckCircle2, color: 'text-rwanda-green' },
            { label: 'Hardware Nodes', value: stats.devices, icon: Smartphone, color: 'text-accent' }
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

        {/* User Management Section */}
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

      </div>
    </div>
  );
}
