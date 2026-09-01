import { useState, useCallback } from 'react';
import axios from '../../../api/client';
import { SystemSettings } from '../../../types/admin';
import { useConfirmationDialog } from '../../../context/ConfirmationDialogContext';

const defaultSystemSettings: SystemSettings = {
  sla: {
    individual: 7,
    group: 14,
    corporate: 21
  },
  priority: {
    individual: 'medium',
    group: 'medium',
    corporate: 'high'
  },
  reviewCycleMonths: {
    individual: 12,
    group: 12,
    corporate: 12
  },
  dueSoonDays: 30,
  updatedAt: '',
  updatedBy: null
};

export function useSettings() {
  const { confirm } = useConfirmationDialog();
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(defaultSystemSettings);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const normalizeSystemSettings = (raw: any): SystemSettings => {
    const reviewCycle = raw?.reviewCycleMonths ?? raw?.review_cycle_months;
    return {
      sla: {
        individual: raw?.sla?.individual ?? defaultSystemSettings.sla.individual,
        group: raw?.sla?.group ?? defaultSystemSettings.sla.group,
        corporate: raw?.sla?.corporate ?? defaultSystemSettings.sla.corporate,
      },
      priority: {
        individual: raw?.priority?.individual ?? defaultSystemSettings.priority.individual,
        group: raw?.priority?.group ?? defaultSystemSettings.priority.group,
        corporate: raw?.priority?.corporate ?? defaultSystemSettings.priority.corporate,
      },
      reviewCycleMonths: {
        individual: reviewCycle?.individual ?? defaultSystemSettings.reviewCycleMonths.individual,
        group: reviewCycle?.group ?? defaultSystemSettings.reviewCycleMonths.group,
        corporate: reviewCycle?.corporate ?? defaultSystemSettings.reviewCycleMonths.corporate,
      },
      dueSoonDays: raw?.dueSoonDays ?? raw?.due_soon_days ?? defaultSystemSettings.dueSoonDays,
      updatedAt: raw?.updatedAt ?? raw?.updated_at ?? '',
      updatedBy: raw?.updatedBy ?? raw?.updated_by ?? null,
    };
  };

  const loadSystemSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSystemSettings(normalizeSystemSettings(response.data));
    } catch (error) {
      console.error('Error loading system settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const updateSystemNumberSetting = (section: 'sla' | 'reviewCycleMonths', type: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) return;

    setSystemSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [type]: numValue
      }
    }));
  };

  const updateSystemPrioritySetting = (type: string, value: 'low' | 'medium' | 'high' | 'urgent') => {
    setSystemSettings(prev => ({
      ...prev,
      priority: {
        ...prev.priority,
        [type]: value
      }
    }));
  };

  const updateDueSoonDays = (value: number) => {
    if (!Number.isFinite(value) || value < 1) return;
    setSystemSettings(prev => ({ ...prev, dueSoonDays: Math.round(value) }));
  };

  const resetSystemSettingsForm = async () => {
    const confirmed = await confirm({
      title: 'Reset settings?',
      message: 'This will reset all settings to their default values. This action cannot be undone.',
      confirmLabel: 'Reset',
      tone: 'danger'
    });

    if (confirmed) {
      setSystemSettings(defaultSystemSettings);
      setSettingsMessage(null);
    }
  };

  const saveSystemSettings = async () => {
    const confirmed = await confirm({
      title: 'Save settings?',
      message: 'This will update the system settings. Changes will take effect immediately.',
      confirmLabel: 'Save',
      tone: 'primary'
    });

    if (!confirmed) return { success: false, message: 'Cancelled' };

    setSettingsSaving(true);
    setSettingsMessage(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put('/api/admin/settings', systemSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const saved = (response.data as any)?.settings;
      if (saved) setSystemSettings(normalizeSystemSettings(saved));
      setSettingsMessage({ type: 'success', text: 'Settings saved successfully!' });
      return { success: true, message: 'Settings saved successfully!' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error saving settings';
      setSettingsMessage({ type: 'error', text: message });
      return { success: false, message };
    } finally {
      setSettingsSaving(false);
    }
  };

  return {
    systemSettings,
    setSystemSettings,
    settingsLoading,
    settingsSaving,
    settingsMessage,
    setSettingsMessage,
    loadSystemSettings,
    updateSystemNumberSetting,
    updateSystemPrioritySetting,
    updateDueSoonDays,
    resetSystemSettingsForm,
    saveSystemSettings,
  };
}
