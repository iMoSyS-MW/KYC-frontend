import React, { useState } from 'react';
import {
  Menu,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  FileText,
  BarChart3,
  Folder,
  Users,
  ClipboardCheck,
  Settings,
  RefreshCw,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onOpenPasswordModal: () => void;
  currentUser: any;
  menuBadges?: Record<string, number>;
  onCollapseChange?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout, onOpenPasswordModal, currentUser, menuBadges, onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [reportsMenuOpen, setReportsMenuOpen] = useState(true);
  const [auditMenuOpen, setAuditMenuOpen] = useState(false);

  const menuItems = [
    {
      key: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      key: 'submissions',
      label: 'Submissions',
      icon: FileText,
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: BarChart3,
      hasDropdown: true,
      children: [
        { key: 'reports-analytics', label: 'Analytics & Charts' },
        { key: 'reports-submissions', label: 'Submissions Report' },
        { key: 'reports-followups', label: 'Follow-ups Report' },
        { key: 'reports-turnaround', label: 'Turnaround Time' },
        { key: 'reports-sms', label: 'SMS Queue Report' },
        { key: 'reports-sla-breach', label: 'SLA Breach' },
        { key: 'reports-upcoming-sla', label: 'Upcoming SLA' },
        { key: 'reports-renewal', label: 'KYC Renewal / Expiry' },
        { key: 'reports-settings-impact', label: 'Settings Impact' },
      ]
    },
    {
      key: 'files',
      label: 'File Management',
      icon: Folder,
    },
    {
      key: 'followups',
      label: 'Follow Ups',
      icon: RefreshCw,
    },
    {
      key: 'users',
      label: 'User Management',
      icon: Users,
    },
    {
      key: 'user-audit',
      label: 'User Audit Reports',
      icon: ClipboardCheck,
      hasDropdown: true,
      children: [
        { key: 'user-audit-review', label: 'User Review' },
        { key: 'user-audit-activity', label: 'User Activity' },
      ]
    },
    ...((currentUser?.roles?.includes('admin') || currentUser?.role === 'admin') ? [{
      key: 'settings',
      label: 'System Settings',
      icon: Settings,
    }] : [])
  ];

  const handleToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  const handleMenuClick = (item: any) => {
    if (item.key === 'reports') {
      if (isCollapsed) {
        onTabChange('reports-analytics');
      } else {
        setReportsMenuOpen(prev => !prev);
      }
    } else if (item.key === 'user-audit') {
      if (isCollapsed) {
        onTabChange('user-audit-review');
      } else {
        setAuditMenuOpen(prev => !prev);
      }
    } else {
      onTabChange(item.key);
    }
  };

  const isItemActive = (item: any) => {
    return activeTab === item.key || item.children?.some((child: any) => child.key === activeTab);
  };

  const isChildActive = (childKey: string) => activeTab === childKey;

  return (
    <div className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50 flex flex-col ${isCollapsed ? 'w-[60px]' : 'w-[250px]'}`}>
      {/* Header */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-200`}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full py-4 px-4">
            <button
              onClick={handleToggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="px-4 py-2 border border-gray-400 rounded-full">
              <span className="text-sm font-medium text-gray-800">KYC Admin</span>
            </div>
          </div>
        ) : (
          <button
            onClick={handleToggle}
            className="p-2 mt-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = isItemActive(item);
          const isExpanded = item.key === 'reports' ? reportsMenuOpen : auditMenuOpen;

          return (
            <div key={item.key}>
              {/* Menu Item */}
              <button
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 text-left transition-colors ${
                  isActive ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-green-700' : 'text-gray-500'}`} />
                  {!isCollapsed && (
                    <span className={`text-sm ${isActive ? 'font-semibold' : 'font-normal'}`}>
                      {item.label}
                    </span>
                  )}
                </div>
                {!isCollapsed && item.hasDropdown && (
                  isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )
                )}
              </button>

              {/* Sub-menu items */}
              {!isCollapsed && item.children && isExpanded && (
                <div className="mt-1 mb-2">
                  {item.children.map((child: any) => {
                    const childActive = isChildActive(child.key);
                    return (
                      <button
                        key={child.key}
                        onClick={() => onTabChange(child.key)}
                        className={`w-full text-left pl-14 pr-4 py-3 transition-colors ${
                          childActive
                            ? 'bg-green-100 text-green-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-sm">{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer - Logout Button */}
      <div className={`border-t border-gray-200 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <button
          onClick={onLogout}
          className={`flex items-center w-full ${isCollapsed ? 'px-2 py-3' : 'gap-3 px-0 py-3'} text-gray-600 hover:text-red-600 rounded-lg transition-colors`}
          title="Logout"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
