import { useEffect, useRef, useState } from 'react'
import { isValidIfscFormat, lookupIfsc } from '../lib/ifscLookup'
import { holderMatchesExpected, nameSimilarity } from '../lib/nameMatch'

function Field({ label, children, hint }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
      {hint ? <span className="text-xs text-subtext">{hint}</span> : null}
    </label>
  )
}

function inputClassName(invalid = false) {
  return `w-full rounded-lg border px-3 py-2${invalid ? ' border-error' : ''}`
}

export const EMPTY_BANK_FORM = {
  bankAccountHolder: '',
  bankAccountNumber: '',
  bankName: '',
  bankIfsc: '',
  bankUpiId: '',
}

export function hasBankDetails(form) {
  return !!(
    form.bankAccountHolder ||
    form.bankAccountNumber ||
    form.bankName ||
    form.bankIfsc ||
    form.bankUpiId
  )
}

export function maskAccountNumber(value) {
  if (!value) return null
  const digits = String(value).replace(/\s/g, '')
  if (digits.length <= 4) return '••••'
  return `•••• ${digits.slice(-4)}`
}

/**
 * @param {object} form
 * @param {string} accountNumberConfirm
 * @param {{ existingAccountNumber?: string, aadhaarVerified?: boolean, aadhaarName?: string, requireAadhaarForBank?: boolean }} options
 * @returns {string|null} error message
 */
export function validateBankDetails(form, accountNumberConfirm, options = {}) {
  const { existingAccountNumber, aadhaarVerified = false, aadhaarName = '', requireAadhaarForBank = false } =
    options
  const account = String(form.bankAccountNumber || '').replace(/\s/g, '')
  const confirm = String(accountNumberConfirm || '').replace(/\s/g, '')
  const keepingExistingAccount = !account && !!existingAccountNumber

  if (!hasBankDetails(form) && !existingAccountNumber) return null

  const partial =
    form.bankAccountHolder ||
    form.bankIfsc ||
    form.bankName ||
    account ||
    confirm ||
    form.bankUpiId

  if (!partial && existingAccountNumber) return null

  if (requireAadhaarForBank && !aadhaarVerified) {
    return 'Verify Aadhaar first — bank account holder name must match the Aadhaar name'
  }

  if (!form.bankAccountHolder?.trim()) {
    return 'Account holder name is required when adding bank details'
  }
  if (!form.bankIfsc?.trim()) {
    return 'IFSC code is required when adding bank details'
  }
  if (!isValidIfscFormat(form.bankIfsc)) {
    return 'Enter a valid 11-character IFSC code (e.g. SBIN0001234)'
  }
  if (!form.bankName?.trim()) {
    return 'Bank name is required — enter IFSC to auto-fill or type manually'
  }

  if (account) {
    if (account.length < 9) {
      return 'Account number looks too short'
    }
    if (!confirm) {
      return 'Re-enter the account number to confirm'
    }
    if (account !== confirm) {
      return 'Account numbers do not match — check and re-enter'
    }
  } else if (!keepingExistingAccount && hasBankDetails(form)) {
    return 'Account number is required when adding bank details'
  }

  const aadhaarExpected = aadhaarName?.trim()
  if (aadhaarExpected && form.bankAccountHolder?.trim()) {
    const match = holderMatchesExpected(form.bankAccountHolder, aadhaarExpected)
    if (match === false) {
      return `Account holder name must match Aadhaar name (${aadhaarExpected})`
    }
  }

  return null
}

export function BankDetailsFields({
  form,
  update,
  accountNumberConfirm = '',
  onAccountNumberConfirmChange,
  existingAccountNumber,
  aadhaarVerified = false,
  aadhaarName = '',
  requireAadhaarForBank = false,
}) {
  const [ifscInfo, setIfscInfo] = useState(null)
  const [ifscLoading, setIfscLoading] = useState(false)
  const [ifscError, setIfscError] = useState('')
  const [confirmTouched, setConfirmTouched] = useState(false)
  const lastLookupRef = useRef('')
  const holderAutoFilledRef = useRef(false)

  const account = String(form.bankAccountNumber || '').replace(/\s/g, '')
  const confirm = String(accountNumberConfirm || '').replace(/\s/g, '')
  const accountsMatch = account.length >= 9 && confirm.length >= 9 && account === confirm
  const confirmMismatch =
    confirmTouched && account && confirm && account !== confirm

  const expectedName = aadhaarName?.trim()
  const holderMatch = form.bankAccountHolder?.trim()
    ? holderMatchesExpected(form.bankAccountHolder, expectedName)
    : null
  const matchScore =
    form.bankAccountHolder?.trim() && expectedName
      ? nameSimilarity(form.bankAccountHolder, expectedName)
      : null

  const blocked = requireAadhaarForBank && !aadhaarVerified

  useEffect(() => {
    const code = String(form.bankIfsc || '').trim().toUpperCase()
    if (!code) {
      setIfscInfo(null)
      setIfscError('')
      lastLookupRef.current = ''
      return
    }

    if (!isValidIfscFormat(code)) {
      setIfscInfo(null)
      setIfscError('IFSC must be 11 characters (e.g. SBIN0001234)')
      return
    }

    if (lastLookupRef.current === code) return

    const timer = setTimeout(async () => {
      setIfscLoading(true)
      setIfscError('')
      const result = await lookupIfsc(code)
      setIfscLoading(false)
      lastLookupRef.current = code

      if (!result.ok) {
        setIfscInfo(null)
        setIfscError(result.error)
        return
      }

      setIfscInfo(result)
      if (result.bank) {
        update('bankName', result.bank)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [form.bankIfsc, update])

  useEffect(() => {
    if (!aadhaarVerified || !aadhaarName?.trim()) return
    if (form.bankAccountHolder?.trim()) return
    update('bankAccountHolder', aadhaarName.trim())
  }, [aadhaarVerified, aadhaarName, form.bankAccountHolder, update])

  useEffect(() => {
    if (!accountsMatch || !expectedName) return
    if (form.bankAccountHolder?.trim()) return
    if (holderAutoFilledRef.current) return
    holderAutoFilledRef.current = true
    update('bankAccountHolder', expectedName)
  }, [accountsMatch, expectedName, form.bankAccountHolder, update])

  useEffect(() => {
    if (!accountsMatch) {
      holderAutoFilledRef.current = false
    }
  }, [accountsMatch])

  return (
    <div className="space-y-4">
      {blocked ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Verify Aadhaar first.</strong> Bank details can only be added after Aadhaar
          verification. The account holder name must match the name on Aadhaar.
        </div>
      ) : null}

      {aadhaarVerified && expectedName ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <strong>Aadhaar name:</strong> {expectedName} — account holder must match this name.
        </div>
      ) : null}

      <fieldset disabled={blocked} className="space-y-4 disabled:opacity-60">
      <Field label="IFSC code">
        <input
          placeholder="e.g. SBIN0001234"
          value={form.bankIfsc}
          onChange={(e) => {
            lastLookupRef.current = ''
            update('bankIfsc', e.target.value.toUpperCase())
          }}
          className={inputClassName(!!ifscError && form.bankIfsc)}
          maxLength={11}
        />
        {ifscLoading ? <span className="text-xs text-subtext">Looking up bank…</span> : null}
        {ifscError ? <span className="text-xs text-error">{ifscError}</span> : null}
      </Field>

      {ifscInfo ? (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
          <p className="font-medium text-primary">{ifscInfo.bank}</p>
          {ifscInfo.branch ? (
            <p className="text-xs text-subtext">
              {ifscInfo.branch}
              {ifscInfo.city ? ` · ${ifscInfo.city}` : ''}
            </p>
          ) : null}
        </div>
      ) : null}

      <Field label="Bank name">
        <input
          placeholder="e.g. State Bank of India"
          value={form.bankName}
          onChange={(e) => update('bankName', e.target.value)}
          className={inputClassName()}
        />
      </Field>

      <Field
        label="Account number"
        hint={
          existingAccountNumber
            ? `Current on file: ${maskAccountNumber(existingAccountNumber)} — enter below only to change`
            : undefined
        }
      >
        <input
          placeholder="e.g. 123456789012"
          inputMode="numeric"
          autoComplete="off"
          value={form.bankAccountNumber}
          onChange={(e) => update('bankAccountNumber', e.target.value.replace(/\D/g, ''))}
          className={inputClassName()}
        />
      </Field>

      <Field label="Re-enter account number">
        <input
          placeholder="Type account number again to confirm"
          inputMode="numeric"
          autoComplete="off"
          value={accountNumberConfirm}
          onChange={(e) => {
            setConfirmTouched(true)
            onAccountNumberConfirmChange?.(e.target.value.replace(/\D/g, ''))
          }}
          onBlur={() => setConfirmTouched(true)}
          className={inputClassName(confirmMismatch)}
        />
        {confirmMismatch ? (
          <span className="text-xs text-error">Account numbers do not match</span>
        ) : accountsMatch ? (
          <span className="text-xs text-emerald-700">Account numbers match</span>
        ) : null}
      </Field>

      <Field
        label="Account holder name"
        hint={
          expectedName
            ? `Must match Aadhaar name: ${expectedName}`
            : 'Name exactly as on the bank account'
        }
      >
        <input
          placeholder="Name as per bank records"
          value={form.bankAccountHolder}
          onChange={(e) => update('bankAccountHolder', e.target.value)}
          className={inputClassName(holderMatch === false)}
        />
        {accountsMatch && holderMatch === true ? (
          <span className="text-xs text-emerald-700">
            ✓ Account holder matches Aadhaar name
            {matchScore != null ? ` (${Math.round(matchScore * 100)}%)` : ''}
          </span>
        ) : null}
        {holderMatch === false ? (
          <span className="text-xs text-error">
            Name does not match Aadhaar ({expectedName}). Use the name registered with this bank
            account.
          </span>
        ) : null}
      </Field>

      <Field label="UPI ID (optional)" hint="For faster payouts when supported">
        <input
          placeholder="e.g. name@upi"
          value={form.bankUpiId}
          onChange={(e) => update('bankUpiId', e.target.value)}
          className={inputClassName()}
        />
      </Field>
      </fieldset>
    </div>
  )
}

export function BankDetailsReview({ form, maskAccount = false, ifscBranch }) {
  const accountDisplay = maskAccount
    ? maskAccountNumber(form.bankAccountNumber)
    : form.bankAccountNumber

  const hasAny =
    form.bankAccountHolder ||
    form.bankAccountNumber ||
    form.bankName ||
    form.bankIfsc ||
    form.bankUpiId

  if (!hasAny) {
    return <span className="text-subtext">Not provided</span>
  }

  return (
    <dl className="space-y-2">
      {form.bankAccountHolder ? (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt className="w-36 shrink-0 text-sm text-subtext">Holder</dt>
          <dd className="text-sm font-medium">{form.bankAccountHolder}</dd>
        </div>
      ) : null}
      {form.bankIfsc ? (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt className="w-36 shrink-0 text-sm text-subtext">IFSC</dt>
          <dd className="text-sm font-medium">{form.bankIfsc}</dd>
        </div>
      ) : null}
      {form.bankName ? (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt className="w-36 shrink-0 text-sm text-subtext">Bank</dt>
          <dd className="text-sm font-medium">
            {form.bankName}
            {ifscBranch ? (
              <span className="mt-0.5 block text-xs font-normal text-subtext">{ifscBranch}</span>
            ) : null}
          </dd>
        </div>
      ) : null}
      {form.bankAccountNumber ? (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt className="w-36 shrink-0 text-sm text-subtext">Account</dt>
          <dd className="text-sm font-medium">{accountDisplay}</dd>
        </div>
      ) : null}
      {form.bankUpiId ? (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt className="w-36 shrink-0 text-sm text-subtext">UPI</dt>
          <dd className="text-sm font-medium">{form.bankUpiId}</dd>
        </div>
      ) : null}
    </dl>
  )
}
