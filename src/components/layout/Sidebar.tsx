import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { LayoutDashboard, Users, GraduationCap, BookOpen, BarChart3, User, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { role } = useRole();
  const location = useLocation();

  const navigationItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      roles: ['directeur', 'formateur', 'etudiant'] 
    },
    { 
      path: '/formateurs', 
      label: 'Formateurs', 
      icon: Users, 
      roles: ['directeur'] 
    },
    { 
      path: '/promotions', 
      label: 'Promotions', 
      icon: GraduationCap, 
      roles: ['directeur'] 
    },
    { 
      path: '/espaces-pedagogiques', 
      label: 'Espaces pédagogiques', 
      icon: BookOpen, 
      roles: ['directeur', 'formateur', 'etudiant'] 
    },
    { 
      path: '/statistiques', 
      label: 'Statistiques globales', 
      icon: BarChart3, 
      roles: ['directeur'] 
    },
  ];

  const utilityItems = [
    { path: '/profil', label: 'Profil', icon: User },
    { path: '/parametres', label: 'Paramètres', icon: Settings },
  ];

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(role)
  );

  return (
    <>
      <aside
        className={cn(
          "border-r border-gray-200 transition-all duration-200 ease-in flex flex-col h-screen",
          isOpen ? "w-64" : "w-20",
          "lg:relative absolute z-50 lg:translate-x-0",
          !isOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-8 flex items-center justify-between">
          {isOpen && (
            <h1 className="font-heading font-bold text-xl ">
              DevCore
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="bg-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground"
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-150 ease-in cursor-pointer group",
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-foreground hover:bg-secondary hover:text-white",
                  !isOpen && "justify-center"
                )}
                aria-label={item.label}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-foreground group-hover:text-white")} strokeWidth={1.5} />
                {isOpen && <span className={cn("font-normal", isActive ? "text-white" : "text-foreground group-hover:text-white")}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-gray-300" />

        <div className="p-4 space-y-2">
          {utilityItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-150 ease-in cursor-pointer group",
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-foreground hover:bg-secondary hover:text-white",
                  !isOpen && "justify-center"
                )}
                aria-label={item.label}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-foreground group-hover:text-white")} strokeWidth={1.5} />
                {isOpen && <span className={cn("font-normal", isActive ? "text-white" : "text-foreground group-hover:text-white")}>{item.label}</span>}
              </Link>
            );
          })}
          
          <button
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-150 ease-in cursor-pointer text-foreground hover:bg-secondary hover:text-white group",
              !isOpen && "justify-center"
            )}
            aria-label="Déconnexion"
          >
            <LogOut className={cn("w-5 h-5 flex-shrink-0", "group-hover:text-white")} strokeWidth={1.5} />
            {isOpen && <span className="font-normal group-hover:text-white">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {!isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 lg:hidden z-40"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
};
