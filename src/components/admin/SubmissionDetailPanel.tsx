import React from 'react';
import { KycSubmission } from '../../types/admin';
import { card, colors } from './theme';
import StatusBadge from './ui/StatusBadge';
import { FloatingTextarea } from '../ui/floating-textarea';
import { FloatingSelect } from '../ui/floating-select';
import { FloatingDate } from '../ui/floating-date';
import { SelectItem } from '../ui/select';

const actionButtonBase: React.CSSProperties = {
  padding: '9px 18px',
  borderRadius: '999px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
};

/** camelCase / snake_case field key → readable label, e.g. "contactPersonName" → "Contact Person Name". */
function humanizeFieldLabel(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Renders a form-data value as human-readable text (arrays, objects, booleans, empties). */
function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    return value.length ? value.map((v) => formatFieldValue(v)).join(', ') : 'N/A';
  }
  if (typeof value === 'object') {
    const parts = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${humanizeFieldLabel(k)}: ${formatFieldValue(v)}`);
    return parts.length ? parts.join('; ') : 'N/A';
  }
  return String(value);
}

/** Sorted, filtered [key, value] pairs of a submission's formData for display. */
function formDataEntries(formData: unknown): Array<[string, unknown]> {
  if (!formData || typeof formData !== 'object') return [];
  return Object.entries(formData as Record<string, unknown>);
}

interface SubmissionDetailPanelProps {
  selectedSubmission: KycSubmission | null;
  canChangeSubmissionStatus: boolean;
  canRequestMoreInfo: boolean;
  remarks: string;
  setRemarks: (value: string) => void;
  nextAction: string;
  setNextAction: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  requestMessage: string;
  setRequestMessage: (value: string) => void;
  updateSubmissionStatus: (
    id: string,
    status: string,
    comments?: string,
    nextAction?: string,
    dueDate?: string,
    skipConfirmation?: boolean
  ) => Promise<boolean>;
  requestMoreInfo: () => Promise<void>;
  exportSingleSubmissionToExcel: (submission: KycSubmission) => void;
  downloadFile: (filePath: string, fileName: string) => void;
  getLifecycleBadges: (submission: KycSubmission) => Array<{ text: string; bg: string; color: string }>;
}

const SubmissionDetailPanel: React.FC<SubmissionDetailPanelProps> = ({
  selectedSubmission,
  canChangeSubmissionStatus,
  canRequestMoreInfo,
  remarks,
  setRemarks,
  nextAction,
  setNextAction,
  dueDate,
  setDueDate,
  requestMessage,
  setRequestMessage,
  updateSubmissionStatus,
  requestMoreInfo,
  exportSingleSubmissionToExcel,
  downloadFile,
  getLifecycleBadges
}) => (
    <div style={{ ...card, overflow: 'hidden' }}>
      {selectedSubmission ? (
        <div>
          {/* Top Section - Actions and Remarks */}
          <div style={{
            backgroundColor: '#fafafa',
            padding: '24px',
            borderBottom: `1px solid ${colors.border}`
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '20px'
            }}>
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '18px', color: colors.textPrimary }}>
                  {selectedSubmission.clientId?.name || 'N/A'}
                </h4>
                <div style={{ fontSize: '14px', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ textTransform: 'capitalize' }}>{selectedSubmission.type}</span>
                  <span>·</span>
                  <StatusBadge status={selectedSubmission.status} />
                  <span>·</span>
                  <span>Submitted {new Date(selectedSubmission.submittedAt).toLocaleString()}</span>
                </div>
                {getLifecycleBadges(selectedSubmission).length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {getLifecycleBadges(selectedSubmission).map((badge) => (
                      <span
                        key={badge.text}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          backgroundColor: badge.bg,
                          color: badge.color,
                          fontWeight: 600
                        }}
                      >
                        {badge.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {canChangeSubmissionStatus && (
                  <>
                    <button
                      onClick={() => updateSubmissionStatus(selectedSubmission._id, 'approved', remarks, nextAction, dueDate)}
                      style={{ ...actionButtonBase, backgroundColor: colors.green, color: 'white', border: 'none' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateSubmissionStatus(selectedSubmission._id, 'rejected', remarks, nextAction, dueDate)}
                      style={{ ...actionButtonBase, backgroundColor: 'transparent', color: '#c0392b', border: '1px solid #c0392b' }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => updateSubmissionStatus(selectedSubmission._id, 'pending', remarks, nextAction, dueDate)}
                      style={{ ...actionButtonBase, backgroundColor: 'transparent', color: '#b7791f', border: '1px solid #d9b45f' }}
                    >
                      Mark Pending
                    </button>
                  </>
                )}
                <button
                  onClick={() => exportSingleSubmissionToExcel(selectedSubmission)}
                  style={{ ...actionButtonBase, backgroundColor: 'transparent', color: colors.green, border: `1px solid ${colors.green}` }}
                >
                  Export to Excel
                </button>
              </div>
            </div>

            {/* Enhanced Remarks/Notes Section */}
            <div style={{ marginBottom: '18px' }}>
              <FloatingTextarea
                label="Admin Remarks/Notes"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>

            {/* Next Action and Due Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              <div>
                <FloatingSelect
                  label="Next Action"
                  value={nextAction || ''}
                  onValueChange={setNextAction}
                >
                  <SelectItem value=""><em>Select next action</em></SelectItem>
                  <SelectItem value="review_documents">Review Documents</SelectItem>
                  <SelectItem value="contact_client">Contact Client</SelectItem>
                  <SelectItem value="verify_information">Verify Information</SelectItem>
                  <SelectItem value="escalate">Escalate</SelectItem>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </FloatingSelect>
              </div>

              <div>
                <FloatingDate
                  label="Due Date"
                  value={dueDate}
                  onChange={setDueDate}
                />
              </div>
            </div>

            {/* Request More Info */}
            {canRequestMoreInfo && (
            <div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <FloatingTextarea
                    label="Request Additional Information"
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                <button
                  onClick={requestMoreInfo}
                  disabled={!requestMessage}
                  style={{
                    ...actionButtonBase,
                    backgroundColor: requestMessage ? colors.green : '#c9c9c9',
                    color: 'white',
                    border: 'none',
                    cursor: requestMessage ? 'pointer' : 'not-allowed',
                    marginTop: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Send Request
                </button>
              </div>
            </div>
            )}
          </div>

          {/* Bottom Section - Complete Details */}
          <div style={{ padding: '24px' }}>
            <h5 style={{ marginTop: 0, fontSize: '16px', color: colors.textPrimary, borderBottom: `2px solid ${colors.green}`, paddingBottom: '10px' }}>
              Complete Submission Details
            </h5>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '15px'
            }}>
              {/* Client Information */}
              <div style={{
                backgroundColor: '#fafafa',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #e4e4e4'
              }}>
                <h6 style={{ margin: '0 0 10px', fontSize: '14px', color: '#1a1a1a' }}>Client Information</h6>
                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  {selectedSubmission.type === 'individual' && (
                    <>
                      <div><strong>Full Name:</strong> {selectedSubmission.formData?.firstName} {selectedSubmission.formData?.middleName} {selectedSubmission.formData?.lastName}</div>
                      <div><strong>Gender:</strong> {selectedSubmission.formData?.gender || 'N/A'}</div>
                      <div><strong>Marital Status:</strong> {selectedSubmission.formData?.maritalStatus || 'N/A'}</div>
                      <div><strong>Date of Birth:</strong> {selectedSubmission.formData?.dateOfBirth || 'N/A'}</div>
                      <div><strong>ID Type:</strong> {selectedSubmission.formData?.idType || 'N/A'}</div>
                      <div><strong>ID Number:</strong> {selectedSubmission.formData?.idNumber || 'N/A'}</div>
                      <div><strong>ID Expiry Date:</strong> {selectedSubmission.formData?.idExpiryDate || 'N/A'}</div>
                      <div><strong>Country of Residence:</strong> {selectedSubmission.formData?.countryOfResidence || 'N/A'}</div>
                      <div><strong>Nationality:</strong> {selectedSubmission.formData?.nationality || 'N/A'}</div>
                    </>
                  )}
                  {selectedSubmission.type === 'group' && (
                    <>
                      <div><strong>Group Name:</strong> {selectedSubmission.formData?.groupName || selectedSubmission.formData?.name || 'N/A'}</div>
                      <div><strong>Products:</strong> {Array.isArray(selectedSubmission.formData?.products) ? selectedSubmission.formData.products.join(', ') : selectedSubmission.formData?.products || 'N/A'}</div>
                      <div><strong>Founding Document:</strong> {selectedSubmission.formData?.foundingDocument || 'N/A'}</div>
                      <div><strong>Source of Funds:</strong> {selectedSubmission.formData?.sourceOfFunds || 'N/A'}</div>
                      <div><strong>Bank Account Proof:</strong> {selectedSubmission.formData?.bankAccountProof || 'N/A'}</div>
                      <div><strong>Scheme Numbers:</strong> {Array.isArray(selectedSubmission.formData?.schemeNumbers) ? selectedSubmission.formData.schemeNumbers.join(', ') : selectedSubmission.formData?.schemeNumbers || 'N/A'}</div>
                    </>
                  )}
                  {selectedSubmission.type === 'corporate' && (
                    <>
                      <div><strong>Organization Name:</strong> {selectedSubmission.formData?.organizationName || 'N/A'}</div>
                      <div><strong>Contact Person:</strong> {selectedSubmission.formData?.contactPersonName || selectedSubmission.formData?.contactPerson?.name || 'N/A'}</div>
                      <div><strong>Contact Person Phone:</strong> {selectedSubmission.formData?.contactPersonPhone || selectedSubmission.formData?.contactPerson?.phone || 'N/A'}</div>
                      <div><strong>Contact Person Email:</strong> {selectedSubmission.formData?.contactPersonEmail || selectedSubmission.formData?.contactPerson?.email || 'N/A'}</div>
                      <div><strong>Identification Document:</strong> {selectedSubmission.formData?.identificationDocument || 'N/A'}</div>
                      <div><strong>Address Proof:</strong> {selectedSubmission.formData?.addressProof || 'N/A'}</div>
                      <div><strong>Articles of Association:</strong> {selectedSubmission.formData?.articlesOfAssociation || 'N/A'}</div>
                      <div><strong>Directors ID:</strong> {selectedSubmission.formData?.directorsId || 'N/A'}</div>
                      <div><strong>Products:</strong> {Array.isArray(selectedSubmission.formData?.products) ? selectedSubmission.formData.products.join(', ') : selectedSubmission.formData?.products || 'N/A'}</div>
                      <div><strong>Scheme Numbers:</strong> {Array.isArray(selectedSubmission.formData?.schemeNumbers) ? selectedSubmission.formData.schemeNumbers.join(', ') : selectedSubmission.formData?.schemeNumbers || 'N/A'}</div>
                    </>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div style={{
                backgroundColor: '#fafafa',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #e4e4e4'
              }}>
                <h6 style={{ margin: '0 0 10px', fontSize: '14px', color: '#1a1a1a' }}>Contact Information</h6>
                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  <div><strong>Phone:</strong> {selectedSubmission.clientId?.contact?.phone || 'N/A'}</div>
                  <div><strong>Email:</strong> {selectedSubmission.clientId?.contact?.email || 'N/A'}</div>
                  <div><strong>Address:</strong> {selectedSubmission.clientId?.contact?.address || 'N/A'}</div>
                  {selectedSubmission.type === 'individual' && (
                    <>
                      {selectedSubmission.formData?.cellNumber && (
                        <div><strong>Cell Number:</strong> {selectedSubmission.formData.cellNumber}</div>
                      )}
                      {selectedSubmission.formData?.telephoneNumber && (
                        <div><strong>Telephone:</strong> {selectedSubmission.formData.telephoneNumber}</div>
                      )}
                      {selectedSubmission.formData?.mobileNumber && (
                        <div><strong>Mobile Number:</strong> {selectedSubmission.formData.mobileNumber}</div>
                      )}
                      {selectedSubmission.formData?.emailAddress && (
                        <div><strong>Alternate Email:</strong> {selectedSubmission.formData.emailAddress}</div>
                      )}
                      {selectedSubmission.formData?.physicalAddress && (
                        <div><strong>Physical Address:</strong> {selectedSubmission.formData.physicalAddress}</div>
                      )}
                      {selectedSubmission.formData?.postalAddress && (
                        <div><strong>Postal Address:</strong> {selectedSubmission.formData.postalAddress}</div>
                      )}
                      {selectedSubmission.formData?.proofOfAddress && (
                        <div><strong>Proof of Address:</strong> {selectedSubmission.formData.proofOfAddress}</div>
                      )}
                    </>
                  )}
                  {selectedSubmission.type === 'corporate' && (
                    <>
                      {selectedSubmission.formData?.phone && (
                        <div><strong>Organization Phone:</strong> {selectedSubmission.formData.phone}</div>
                      )}
                      {selectedSubmission.formData?.email && (
                        <div><strong>Organization Email:</strong> {selectedSubmission.formData.email}</div>
                      )}
                      {selectedSubmission.formData?.address && (
                        <div><strong>Organization Address:</strong> {selectedSubmission.formData.address}</div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              <div style={{
                backgroundColor: '#fafafa',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #e4e4e4'
              }}>
                <h6 style={{ margin: '0 0 10px', fontSize: '14px', color: '#1a1a1a' }}>Financial Information</h6>
                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  {selectedSubmission.formData?.products && (
                    <div><strong>Products:</strong> {Array.isArray(selectedSubmission.formData.products) ? selectedSubmission.formData.products.join(', ') : selectedSubmission.formData.products}</div>
                  )}
                  {selectedSubmission.formData?.schemeNumbers && (
                    <div><strong>Scheme Numbers:</strong> {selectedSubmission.formData.schemeNumbers}</div>
                  )}
                  {selectedSubmission.type === 'individual' && (
                    <>
                      {selectedSubmission.formData?.sourceOfIncome && (
                        <div><strong>Source of Income:</strong> {selectedSubmission.formData.sourceOfIncome}</div>
                      )}
                      {selectedSubmission.formData?.employerName && (
                        <div><strong>Employer Name:</strong> {selectedSubmission.formData.employerName}</div>
                      )}
                      {selectedSubmission.formData?.employmentStartDate && (
                        <div><strong>Employment Start Date:</strong> {selectedSubmission.formData.employmentStartDate}</div>
                      )}
                      {selectedSubmission.formData?.monthlyNetIncome && (
                        <div><strong>Monthly Net Income:</strong> MWK {selectedSubmission.formData.monthlyNetIncome}</div>
                      )}
                      {selectedSubmission.formData?.businessType && (
                        <div><strong>Business Type:</strong> {selectedSubmission.formData.businessType}</div>
                      )}
                      {selectedSubmission.formData?.businessAddress && (
                        <div><strong>Business Address:</strong> {selectedSubmission.formData.businessAddress}</div>
                      )}
                      {selectedSubmission.formData?.businessRegistrationNumber && (
                        <div><strong>Business Registration Number:</strong> {selectedSubmission.formData.businessRegistrationNumber}</div>
                      )}
                      {selectedSubmission.formData?.businessMonthlyIncome && (
                        <div><strong>Business Monthly Income:</strong> MWK {selectedSubmission.formData.businessMonthlyIncome}</div>
                      )}
                      {selectedSubmission.formData?.otherIncome && (
                        <div><strong>Other Income:</strong> {selectedSubmission.formData.otherIncome}</div>
                      )}
                      {selectedSubmission.formData?.sourceOfFunds && (
                        <div><strong>Source of Funds:</strong> {selectedSubmission.formData.sourceOfFunds}</div>
                      )}
                      {selectedSubmission.formData?.otherMonthlyIncome && (
                        <div><strong>Other Monthly Income:</strong> MWK {selectedSubmission.formData.otherMonthlyIncome}</div>
                      )}
                    </>
                  )}
                  {selectedSubmission.type === 'corporate' && (
                    <>
                      {selectedSubmission.formData?.sourceOfFunds && (
                        <div><strong>Source of Funds:</strong> {selectedSubmission.formData.sourceOfFunds}</div>
                      )}
                      {selectedSubmission.formData?.bankAccountProof && (
                        <div><strong>Bank Account Proof:</strong> {selectedSubmission.formData.bankAccountProof}</div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              <div style={{
                backgroundColor: '#fafafa',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #e4e4e4'
              }}>
                <h6 style={{ margin: '0 0 10px', fontSize: '14px', color: '#1a1a1a' }}>Additional Details</h6>
                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  {selectedSubmission.type === 'individual' && (
                    <>
                      {selectedSubmission.formData?.policyNumbers && (
                        <div><strong>Policy Numbers:</strong> {Array.isArray(selectedSubmission.formData.policyNumbers) ? selectedSubmission.formData.policyNumbers.join(', ') : selectedSubmission.formData.policyNumbers}</div>
                      )}
                      {selectedSubmission.formData?.immigrationPermit && (
                        <div><strong>Immigration Permit:</strong> {selectedSubmission.formData.immigrationPermit}</div>
                      )}
                      {selectedSubmission.formData?.permitExpiryDate && (
                        <div><strong>Permit Expiry Date:</strong> {selectedSubmission.formData.permitExpiryDate}</div>
                      )}
                      {selectedSubmission.formData?.mobileNumber && (
                        <div><strong>Mobile Number:</strong> {selectedSubmission.formData.mobileNumber}</div>
                      )}
                      {selectedSubmission.formData?.otherIncome && (
                        <div><strong>Other Income:</strong> {selectedSubmission.formData.otherIncome}</div>
                      )}
                      {selectedSubmission.formData?.sourceOfFunds && (
                        <div><strong>Source of Funds:</strong> {selectedSubmission.formData.sourceOfFunds}</div>
                      )}
                      {selectedSubmission.formData?.otherMonthlyIncome && (
                        <div><strong>Other Monthly Income:</strong> MWK {selectedSubmission.formData.otherMonthlyIncome}</div>
                      )}
                      {selectedSubmission.formData?.isPEP && (
                        <div><strong>PEP Status:</strong> {selectedSubmission.formData.isPEP}</div>
                      )}
                      {selectedSubmission.formData?.relatedToPEP && (
                        <div><strong>Related to PEP:</strong> {selectedSubmission.formData.relatedToPEP}</div>
                      )}
                      {selectedSubmission.formData?.nextOfKinName && (
                        <div><strong>Next of Kin Name:</strong> {selectedSubmission.formData.nextOfKinName}</div>
                      )}
                      {selectedSubmission.formData?.nextOfKinRelationship && (
                        <div><strong>Next of Kin Relationship:</strong> {selectedSubmission.formData.nextOfKinRelationship}</div>
                      )}
                      {selectedSubmission.formData?.nextOfKinOccupation && (
                        <div><strong>Next of Kin Occupation:</strong> {selectedSubmission.formData.nextOfKinOccupation}</div>
                      )}
                      {selectedSubmission.formData?.preferredCommunication && (
                        <div><strong>Preferred Communication:</strong> {selectedSubmission.formData.preferredCommunication}</div>
                      )}
                      {selectedSubmission.formData?.termsAgreement && (
                        <div><strong>Terms Agreement:</strong> {selectedSubmission.formData.termsAgreement ? 'Accepted' : 'Not Accepted'}</div>
                      )}
                    </>
                  )}
                  {selectedSubmission.type === 'group' && (
                    <>
                      {selectedSubmission.formData?.declaration && (
                        <div><strong>Declaration:</strong> {selectedSubmission.formData.declaration ? 'Accepted' : 'Not Accepted'}</div>
                      )}
                      {/* Signatories */}
                      {selectedSubmission.formData?.signatories && Array.isArray(selectedSubmission.formData.signatories) && selectedSubmission.formData.signatories.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <strong>Signatories ({selectedSubmission.formData.signatories.length}):</strong>
                          <div style={{ marginLeft: '10px', marginTop: '5px' }}>
                            {selectedSubmission.formData.signatories.map((sig: any, index: number) => (
                              <div key={index} style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#f0f0f0', borderRadius: '6px' }}>
                                <div><strong>Name:</strong> {sig.fullName || 'N/A'}</div>
                                <div><strong>Address:</strong> {sig.address || 'N/A'}</div>
                                <div><strong>Phone:</strong> {sig.phone || 'N/A'}</div>
                                <div><strong>Email:</strong> {sig.email || 'N/A'}</div>
                                <div><strong>Occupation:</strong> {sig.occupation || 'N/A'}</div>
                                <div><strong>ID Type:</strong> {sig.idType || 'N/A'}</div>
                                <div><strong>Address Proof:</strong> {sig.addressProof || 'N/A'}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {selectedSubmission.type === 'corporate' && (
                    <>
                      {selectedSubmission.formData?.pepDeclaration && (
                        <div><strong>PEP Declaration:</strong> {selectedSubmission.formData.pepDeclaration ? 'Accepted' : 'Not Accepted'}</div>
                      )}
                      {selectedSubmission.formData?.declaration && (
                        <div><strong>Declaration:</strong> {selectedSubmission.formData.declaration ? 'Accepted' : 'Not Accepted'}</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Documents Section */}
            {selectedSubmission.documents && selectedSubmission.documents.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h6 style={{ margin: '0 0 15px', fontSize: '14px', color: '#1a1a1a', borderBottom: `1px solid ${colors.border}`, paddingBottom: '10px' }}>
                  Uploaded Documents ({selectedSubmission.documents.length})
                </h6>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '10px'
                }}>
                  {selectedSubmission.documents.map((doc, index) => (
                    <button
                      key={index}
                      onClick={() => downloadFile(doc.path, doc.name)}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: 'transparent',
                        color: colors.green,
                        border: `1px solid ${colors.green}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {doc.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Complete Form Data */}
            <div style={{ marginTop: '20px' }}>
              <h6 style={{ margin: '0 0 15px', fontSize: '14px', color: '#1a1a1a', borderBottom: `1px solid ${colors.border}`, paddingBottom: '10px' }}>
                Complete Form Data
              </h6>
              <div style={{
                backgroundColor: '#fafafa',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #e4e4e4',
                maxHeight: '360px',
                overflowY: 'auto'
              }}>
                {formDataEntries(selectedSubmission.formData).length === 0 ? (
                  <div style={{ fontSize: '14px', color: colors.textMuted }}>No form data submitted.</div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '10px 24px'
                  }}>
                    {formDataEntries(selectedSubmission.formData).map(([key, value]) => (
                      <div key={key} style={{ fontSize: '13px', lineHeight: 1.5, display: 'flex', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#1a1a1a' }}>{humanizeFieldLabel(key)}:</span>
                        <span style={{ color: colors.textPrimary, wordBreak: 'break-word' }}>{formatFieldValue(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: colors.textMuted,
          fontSize: '16px'
        }}>
          Select a submission from the list to view detailed information
        </div>
      )}
    </div>
);

export default SubmissionDetailPanel;
