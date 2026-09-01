import React from 'react';
import { SystemSettings } from '../../../types/admin';
import { FloatingInput } from '../../ui/floating-input';
import { FloatingSelect } from '../../ui/floating-select';
import { SelectItem } from '../../ui/select';
import {
  reportHeadingStyle,
  reportCardHeadingStyle,
  card,
  colors,
} from '../theme';

interface SettingsMessage {
  type: 'success' | 'error';
  text: string;
}

interface SettingsTabProps {
  systemSettings: SystemSettings;
  settingsLoading: boolean;
  settingsSaving: boolean;
  settingsMessage: SettingsMessage | null;
  updateSystemNumberSetting: (section: 'sla' | 'reviewCycleMonths', key: string, value: string) => void;
  updateSystemPrioritySetting: (key: string, value: 'low' | 'medium' | 'high' | 'urgent') => void;
  updateDueSoonDays: (value: number) => void;
  resetSystemSettingsForm: () => void;
  saveSystemSettings: () => void;
  loadSystemSettings: () => void;
  hasCurrentRole: (role: string) => boolean;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  systemSettings,
  settingsLoading,
  settingsSaving,
  settingsMessage,
  updateSystemNumberSetting,
  updateSystemPrioritySetting,
  updateDueSoonDays,
  resetSystemSettingsForm,
  saveSystemSettings,
  loadSystemSettings,
  hasCurrentRole,
}) => {
  return (
    <div>
      <h3 style={reportHeadingStyle}>System Settings</h3>

      {!hasCurrentRole('admin') && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeeba',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          Access denied. System settings are available to admins only.
        </div>
      )}

      <div style={{
        display: hasCurrentRole('admin') ? 'block' : 'none'
      }}>
        {settingsMessage && (
          <div style={{
            backgroundColor: settingsMessage.type === 'success' ? '#dff6dd' : '#fde7e9',
            color: settingsMessage.type === 'success' ? '#006437' : '#a4262c',
            border: `1px solid ${settingsMessage.type === 'success' ? '#9fd89b' : '#f1aeb5'}`,
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            {settingsMessage.text}
          </div>
        )}

        <div style={{ ...card, padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <div>
              <h4 style={{ ...reportCardHeadingStyle, marginBottom: '6px' }}>KYC Workflow Configuration</h4>
              <p style={{ margin: 0, color: colors.textMuted, fontSize: '13px' }}>
                These values control default SLA targets, priority, renewal cycles, and due-soon alerts for KYC processing.
              </p>
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Last updated: {systemSettings.updatedAt ? new Date(systemSettings.updatedAt).toLocaleString() : 'Not yet saved'}
            </div>
          </div>

          {settingsLoading ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: '#666' }}>
              Loading system settings...
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {/* SLA Card */}
                <div style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px' }}>
                  <h5 className='mb-4' style={{ marginTop: 0 }}>Processing SLA (Days)</h5>
                  {(['individual', 'group', 'corporate'] as const).map((type) => (
                    <div key={type} style={{ marginBottom: '12px' }}>
                      <FloatingInput
                        label={type}
                        type="number"
                        min={1}
                        value={systemSettings.sla[type]}
                        onChange={(e) => updateSystemNumberSetting('sla', type, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                {/* Priority Card */}
                <div style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px' }}>
                  <h5 className='mb-4' style={{ marginTop: 0 }}>Default Priority</h5>
                  {(['individual', 'group', 'corporate'] as const).map((type) => (
                    <div key={type} style={{ marginBottom: '12px' }}>
                      <FloatingSelect
                        label={type}
                        value={systemSettings.priority[type]}
                        onValueChange={(v) => updateSystemPrioritySetting(type, v as 'low' | 'medium' | 'high' | 'urgent')}
                      >
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </FloatingSelect>
                    </div>
                  ))}
                </div>

                {/* Review Cycle Card */}
                <div style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px' }}>
                  <h5 className='mb-4' style={{ marginTop: 0 }}>Review Cycle (Months)</h5>
                  {(['individual', 'group', 'corporate'] as const).map((type) => (
                    <div key={type} style={{ marginBottom: '12px' }}>
                      <FloatingInput
                        label={type}
                        type="number"
                        min={1}
                        value={systemSettings.reviewCycleMonths[type]}
                        onChange={(e) => updateSystemNumberSetting('reviewCycleMonths', type, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                {/* Renewal Alerts Card */}
                <div style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px' }}>
                  <h5 className='mb-4' style={{ marginTop: 0 }}>Renewal Alerts</h5>
                  <div style={{ marginBottom: '12px' }}>
                    <FloatingInput
                      label="Days before expiry"
                      type="number"
                      min={1}
                      value={systemSettings.dueSoonDays}
                      onChange={(e) => updateDueSoonDays(Math.max(1, Number(e.target.value) || 1))}
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.5 }}>
                    <div>• SLA and priority apply to new submissions.</div>
                    <div>• Review cycle and due-soon alerts affect renewal tracking.</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
                <button
                  onClick={saveSystemSettings}
                  disabled={settingsLoading || settingsSaving}
                  style={{
                    padding: '10px 22px',
                    backgroundColor: colors.green,
                    color: 'white',
                    border: 'none',
                    borderRadius: '999px',
                    fontWeight: 600,
                    cursor: (settingsLoading || settingsSaving) ? 'not-allowed' : 'pointer',
                    opacity: (settingsLoading || settingsSaving) ? 0.7 : 1
                  }}
                >
                  {settingsSaving ? 'Saving...' : 'Save Settings'}
                </button>

                <button
                  onClick={loadSystemSettings}
                  disabled={settingsLoading || settingsSaving}
                  style={{
                    padding: '10px 22px',
                    backgroundColor: 'transparent',
                    color: colors.green,
                    border: `1px solid ${colors.green}`,
                    borderRadius: '999px',
                    fontWeight: 600,
                    cursor: (settingsLoading || settingsSaving) ? 'not-allowed' : 'pointer',
                    opacity: (settingsLoading || settingsSaving) ? 0.7 : 1
                  }}
                >
                  Reload
                </button>

                <button
                  onClick={resetSystemSettingsForm}
                  disabled={settingsSaving}
                  style={{
                    padding: '10px 22px',
                    backgroundColor: 'transparent',
                    color: colors.textMuted,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '999px',
                    fontWeight: 600,
                    cursor: settingsSaving ? 'not-allowed' : 'pointer',
                    opacity: settingsSaving ? 0.7 : 1
                  }}
                >
                  Reset Form
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
