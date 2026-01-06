import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PedagogicalSpaceModal from '@/components/modals/PedagogicalSpaceModal';
import { getAllPedagogicalSpaces, getAllPromotions, getAllUsers } from '@/lib/db';
import { getPromotions as apiGetPromotions, getUsers as apiGetUsers } from '@/lib/api';
import type { Promotion, User } from '@/lib/db';

interface Space {
  id: string;
  name: string;
  formateur: string;
  promotion: string;
  students: number;
  studentId?: string;
}

export const PedagogicalSpaces: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  async function loadSpaces() {
    try {
      const items = await getAllPedagogicalSpaces();
      setSpaces(items as unknown as Space[]);
    } catch (e) {
      console.error('Failed to load spaces', e);
    }
  }

  async function loadRefs() {
    try {
      // Essayer API d'abord
      let apiUsers: any[] | null = null;
      let apiPromos: any[] | null = null;
      try {
        const usr = await apiGetUsers();
        apiUsers = Array.isArray(usr) ? usr : null;
      } catch { apiUsers = null; }
      try {
        const promos = await apiGetPromotions();
        apiPromos = Array.isArray(promos) ? promos : null;
      } catch { apiPromos = null; }

      // Normaliser id/_id depuis API
      const normalizedApiUsers: User[] = (apiUsers ?? []).map((u: any) => ({
        id: String(u._id ?? u.id ?? ''),
        name: u.name,
        email: u.email,
        role: u.role,
        status: (u.status ?? 'active') as User['status'],
        createdOn: u.createdOn ?? new Date().toLocaleDateString('fr-FR'),
        phone: u.phone,
        promotion: u.promotion,
      })).filter((u: User) => !!u.id);

      const normalizedApiPromos: Promotion[] = (apiPromos ?? [])
        .map((p: any) => ({
          id: String(p._id ?? p.id ?? ''),
          academicYear: String(p.academicYear ?? p.year ?? ''),
          label: p.label,
          students: Number(p.students ?? 0),
          spaces: Number(p.spaces ?? 0),
        }))
        .filter((p: any) => !!p.id) as Promotion[];

      // Fusion avec IndexedDB
      const [localUsers, localPromos] = await Promise.all([getAllUsers(), getAllPromotions()]);
      const mergeById = <T extends { id: string }>(a: T[], b: T[]) => {
        const map = new Map<string, T>();
        for (const item of [...a, ...b]) { map.set(item.id, item); }
        return Array.from(map.values());
      };

      setUsers(mergeById(normalizedApiUsers, localUsers));
      setPromotions(mergeById(normalizedApiPromos, localPromos));
    } catch (e) {
      console.error('Failed to load refs', e);
    }
  }

  useEffect(() => {
    loadSpaces();
    loadRefs();
  }, []);

  const nameByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users) map.set(u.id, u.name);
    return map;
  }, [users]);

  const labelByPromotionId = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of promotions) map.set(p.id, p.label ?? `Promotion ${p.academicYear}`);
    return map;
  }, [promotions]);

  const filteredSpaces = spaces.filter(space => {
    const studentName = space.studentId ? (nameByUserId.get(space.studentId) || '') : '';
    const promoLabel = labelByPromotionId.get(space.promotion) || '';
    const q = searchQuery.toLowerCase();
    return (
      space.name.toLowerCase().includes(q) ||
      space.formateur.toLowerCase().includes(q) ||
      studentName.toLowerCase().includes(q) ||
      promoLabel.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
            Espaces pédagogiques
          </h1>
          <p className="text-gray-600">
            Gérer les matières et cours de la plateforme
          </p>
        </div>
        <Button 
          onClick={() => setOpenModal(true)}
          className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground"
        >
          <Plus className="w-5 h-5 mr-2" strokeWidth={1.5} />
          Créer un espace
        </Button>
      </div>

      <Card className="bg-card text-card-foreground border-gray-200">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={1.5} />
              <Input
                type="search"
                placeholder="Rechercher par matière ou formateur..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-12 bg-gray-50 border-gray-200 text-foreground placeholder:text-gray-400"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground">Matière</TableHead>
                <TableHead className="text-foreground">Formateur</TableHead>
                <TableHead className="text-foreground">Promotion</TableHead>
                <TableHead className="text-foreground">Étudiant</TableHead>
                <TableHead className="text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSpaces.map((space) => (
                <TableRow key={space.id}>
                  <TableCell className="font-medium text-foreground">{space.name}</TableCell>
                  <TableCell className="text-foreground">{space.formateur}</TableCell>
                  <TableCell className="text-gray-600">{labelByPromotionId.get(space.promotion) || space.promotion}</TableCell>
                  <TableCell className="text-gray-600">{space.studentId ? (nameByUserId.get(space.studentId) || space.studentId) : space.students}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="bg-transparent text-foreground hover:bg-gray-100 hover:text-foreground"
                        >
                          <MoreVertical className="w-5 h-5" strokeWidth={1.5} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
                        <DropdownMenuItem className="text-popover-foreground cursor-pointer">
                          <Eye className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-popover-foreground cursor-pointer">
                          <Pencil className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive cursor-pointer">
                          <Trash2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PedagogicalSpaceModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={() => loadSpaces()}
      />
    </div>
  );
};
