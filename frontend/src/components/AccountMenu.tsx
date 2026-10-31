import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function initials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => Array.from(part)[0]).join('').toLocaleUpperCase('az-AZ') || 'M';
}
export default function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  return <DropdownMenu open={open} onOpenChange={setOpen}>
    <Tooltip open={!open && tooltipOpen} onOpenChange={setTooltipOpen}>
      <TooltipTrigger asChild><DropdownMenuTrigger asChild>
        <Button variant="ghost" className="account-trigger" aria-label="Hesab menyusunu aç">
          <span className="avatar" aria-hidden="true">{initials(user?.displayName ?? '')}</span><LogOut size={17} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger></TooltipTrigger>
      <TooltipContent>Çıxış</TooltipContent>
    </Tooltip>
    <DropdownMenuContent align="end" aria-label="Hesab menyusu">
      <div className="account-details"><strong>{user?.displayName}</strong><span>{user?.email}</span></div>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={logout}><LogOut size={17} aria-hidden="true" />Çıxış</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
