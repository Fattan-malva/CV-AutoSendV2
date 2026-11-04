'use client'

import { type ReactNode } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import CvAIButton from './CvAIButton'
import type {
  CvCertification,
  CvData,
  CvEducation,
  CvExperience,
  CvLanguage,
  CvSkill,
} from '@/types'

const labelClass = 'text-[10px] font-medium uppercase tracking-wider text-muted-foreground'
const inputClass = 'h-8 text-xs'

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <Label className={labelClass}>{label}</Label>
      {children}
    </div>
  )
}

function SectionCard({
  title,
  aiSection,
  language,
  aiContext,
  onAiResult,
  children,
  defaultOpen = true,
}: {
  title: string
  aiSection?: string
  language?: 'id' | 'en'
  aiContext?: string
  onAiResult?: (text: string) => void
  children: ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details open={defaultOpen} className='group rounded-lg border bg-card'>
      <summary className='flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 transition-colors hover:bg-muted/40 [&::-webkit-details-marker]:hidden'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>{title}</span>
          {aiSection && language && aiContext !== undefined && onAiResult ? (
            <CvAIButton
              section={aiSection}
              language={language}
              context={aiContext}
              onResult={onAiResult}
            />
          ) : null}
        </div>
        <ChevronDown className='size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180' />
      </summary>
      <div className='space-y-3 border-t px-3 py-3'>{children}</div>
    </details>
  )
}

function AddButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      onClick={onClick}
      className='h-7 px-2 text-xs text-primary hover:text-primary'
    >
      <Plus className='size-3.5' />
      {children}
    </Button>
  )
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      onClick={onClick}
      aria-label={label}
      className='absolute end-1.5 top-1.5 size-7 text-muted-foreground hover:text-destructive'
    >
      <Trash2 className='size-3.5' />
    </Button>
  )
}

export default function CvEditor({
  cv,
  onChange,
  language,
  getAIContext,
}: {
  cv: CvData
  onChange: (cv: CvData) => void
  language: 'id' | 'en'
  getAIContext: (section: string) => string
}) {
  const t = language === 'en' ? enLabels : idLabels
  const update = (patch: Partial<CvData>) => onChange({ ...cv, ...patch })

  const setPersonalInfo = (patch: Partial<CvData['personalInfo']>) =>
    update({ personalInfo: { ...cv.personalInfo, ...patch } })

  const addExperience = () =>
    update({
      experience: [
        ...cv.experience,
        {
          id: crypto.randomUUID(),
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          bulletPoints: [''],
        },
      ],
    })

  const updateExperience = (id: string, patch: Partial<CvExperience>) =>
    update({ experience: cv.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)) })

  const removeExperience = (id: string) =>
    update({ experience: cv.experience.filter((e) => e.id !== id) })

  const addEducation = () =>
    update({
      education: [
        ...cv.education,
        {
          id: crypto.randomUUID(),
          institution: '',
          degree: '',
          field: '',
          gpa: '',
          startDate: '',
          endDate: '',
        },
      ],
    })

  const updateEducation = (id: string, patch: Partial<CvEducation>) =>
    update({ education: cv.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) })

  const removeEducation = (id: string) =>
    update({ education: cv.education.filter((e) => e.id !== id) })

  const addSkill = () => update({ skills: [...cv.skills, { category: '', items: [''] }] })

  const updateSkill = (i: number, patch: Partial<CvSkill>) =>
    update({ skills: cv.skills.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) })

  const removeSkill = (i: number) =>
    update({ skills: cv.skills.filter((_, idx) => idx !== i) })

  const addCert = () =>
    update({ certifications: [...cv.certifications, { name: '', issuer: '', date: '' }] })

  const updateCert = (i: number, patch: Partial<CvCertification>) =>
    update({
      certifications: cv.certifications.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    })

  const removeCert = (i: number) =>
    update({ certifications: cv.certifications.filter((_, idx) => idx !== i) })

  const addLang = () =>
    update({ languages: [...cv.languages, { language: '', proficiency: 'Professional' }] })

  const updateLang = (i: number, patch: Partial<CvLanguage>) =>
    update({ languages: cv.languages.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) })

  const removeLang = (i: number) =>
    update({ languages: cv.languages.filter((_, idx) => idx !== i) })

  const moveSection = (from: number, to: number) => {
    const order = [...cv.sectionOrder]
    const [removed] = order.splice(from, 1)
    order.splice(to, 0, removed)
    update({ sectionOrder: order })
  }

  return (
    <div className='space-y-2'>
      <SectionCard title={t.personalInfo}>
        <div className='grid grid-cols-2 gap-2'>
          <Field label={t.fullName} className='col-span-2'>
            <Input
              value={cv.personalInfo.fullName}
              onChange={(e) => setPersonalInfo({ fullName: e.target.value })}
              className={inputClass}
              placeholder={t.fullNamePlaceholder}
            />
          </Field>
          <Field label={t.email}>
            <Input
              value={cv.personalInfo.email}
              onChange={(e) => setPersonalInfo({ email: e.target.value })}
              className={inputClass}
              placeholder='email@example.com'
              type='email'
            />
          </Field>
          <Field label={t.phone}>
            <Input
              value={cv.personalInfo.phone}
              onChange={(e) => setPersonalInfo({ phone: e.target.value })}
              className={inputClass}
              placeholder='+62 812...'
            />
          </Field>
          <Field label={t.address} className='col-span-2'>
            <Input
              value={cv.personalInfo.address}
              onChange={(e) => setPersonalInfo({ address: e.target.value })}
              className={inputClass}
              placeholder={t.addressPlaceholder}
            />
          </Field>
          <Field label='LinkedIn'>
            <Input
              value={cv.personalInfo.linkedin}
              onChange={(e) => setPersonalInfo({ linkedin: e.target.value })}
              className={inputClass}
              placeholder='linkedin.com/in/...'
            />
          </Field>
          <Field label='Portfolio'>
            <Input
              value={cv.personalInfo.portfolio}
              onChange={(e) => setPersonalInfo({ portfolio: e.target.value })}
              className={inputClass}
              placeholder='github.com/...'
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        title={t.summary}
        aiSection='summary'
        language={language}
        aiContext={getAIContext('summary')}
        onAiResult={(text) => update({ summary: text })}
      >
        <Textarea
          value={cv.summary}
          onChange={(e) => update({ summary: e.target.value })}
          className='min-h-[84px] text-xs leading-relaxed'
          placeholder={t.summaryPlaceholder}
        />
      </SectionCard>

      <SectionCard
        title={t.experience}
        aiSection='bullet'
        language={language}
        aiContext={getAIContext('bullet')}
        onAiResult={(text) => {
          if (cv.experience.length > 0) {
            const last = cv.experience[cv.experience.length - 1]
            updateExperience(last.id, {
              bulletPoints: text.split('\n').filter((line: string) => line.trim()),
            })
          }
        }}
      >
        {cv.experience.map((exp) => (
          <div key={exp.id} className='relative space-y-2 rounded-lg border bg-muted/20 p-3'>
            <RemoveButton onClick={() => removeExperience(exp.id)} label='Remove experience' />
            <div className='grid grid-cols-2 gap-2 pe-7'>
              <Field label={t.position} className='col-span-2'>
                <Input
                  value={exp.position}
                  onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                  className={inputClass}
                  placeholder={t.positionPlaceholder}
                />
              </Field>
              <Field label={t.company} className='col-span-2'>
                <Input
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                  className={inputClass}
                  placeholder={t.companyPlaceholder}
                />
              </Field>
              <Field label={t.startDate}>
                <Input
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                  className={inputClass}
                  placeholder='2020-01'
                />
              </Field>
              <Field label={t.endDate}>
                <Input
                  value={exp.endDate}
                  onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                  className={inputClass}
                  placeholder='2023-12'
                  disabled={exp.current}
                />
              </Field>
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                id={`current-${exp.id}`}
                checked={exp.current}
                onCheckedChange={(checked) =>
                  updateExperience(exp.id, {
                    current: Boolean(checked),
                    endDate: checked ? '' : exp.endDate,
                  })
                }
              />
              <Label htmlFor={`current-${exp.id}`} className='text-xs text-muted-foreground'>
                {t.currentJob}
              </Label>
            </div>
            <div className='space-y-1'>
              <Label className={labelClass}>{t.bulletPoints}</Label>
              {exp.bulletPoints.map((bullet, bulletIndex) => (
                <div key={bulletIndex} className='flex items-center gap-1'>
                  <span className='text-xs text-muted-foreground'>•</span>
                  <Input
                    value={bullet}
                    onChange={(e) => {
                      const updated = [...exp.bulletPoints]
                      updated[bulletIndex] = e.target.value
                      updateExperience(exp.id, { bulletPoints: updated })
                    }}
                    className='h-7 text-[11px]'
                    placeholder={t.bulletPlaceholder}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='size-7 shrink-0 text-muted-foreground hover:text-destructive'
                    onClick={() => {
                      const updated = exp.bulletPoints.filter((_, idx) => idx !== bulletIndex)
                      updateExperience(exp.id, {
                        bulletPoints: updated.length ? updated : [''],
                      })
                    }}
                  >
                    <Trash2 className='size-3' />
                  </Button>
                </div>
              ))}
              <AddButton onClick={() => updateExperience(exp.id, { bulletPoints: [...exp.bulletPoints, ''] })}>
                {t.addBullet}
              </AddButton>
            </div>
          </div>
        ))}
        <AddButton onClick={addExperience}>{t.addExperience}</AddButton>
      </SectionCard>

      <SectionCard title={t.education}>
        {cv.education.map((edu) => (
          <div key={edu.id} className='relative space-y-2 rounded-lg border bg-muted/20 p-3'>
            <RemoveButton onClick={() => removeEducation(edu.id)} label='Remove education' />
            <div className='grid grid-cols-2 gap-2 pe-7'>
              <Field label={t.institution} className='col-span-2'>
                <Input
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                  className={inputClass}
                  placeholder={t.institutionPlaceholder}
                />
              </Field>
              <Field label={t.degree}>
                <Input
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                  className={inputClass}
                  placeholder="S1 / Bachelor's"
                />
              </Field>
              <Field label={t.field}>
                <Input
                  value={edu.field}
                  onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                  className={inputClass}
                  placeholder='Computer Science'
                />
              </Field>
              <Field label={t.startDate}>
                <Input
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                  className={inputClass}
                  placeholder='2016'
                />
              </Field>
              <Field label={t.endDate}>
                <Input
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                  className={inputClass}
                  placeholder='2020'
                />
              </Field>
              <Field label='GPA' className='col-span-2'>
                <Input
                  value={edu.gpa}
                  onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                  className={inputClass}
                  placeholder='3.8 / 4.0'
                />
              </Field>
            </div>
          </div>
        ))}
        <AddButton onClick={addEducation}>{t.addEducation}</AddButton>
      </SectionCard>

      <SectionCard
        title={t.skills}
        aiSection='skills'
        language={language}
        aiContext={getAIContext('skills')}
        onAiResult={(text) => {
          const lines = text.split('\n').filter((line: string) => line.includes(':'))
          const skills: CvSkill[] = lines.map((line: string) => {
            const [category, ...items] = line.split(':')
            return {
              category: category.trim(),
              items: items
                .join(':')
                .split(',')
                .map((item: string) => item.trim()),
            }
          })
          if (skills.length) update({ skills })
        }}
      >
        {cv.skills.map((skill, i) => (
          <div key={i} className='relative space-y-2 rounded-lg border bg-muted/20 p-3'>
            <RemoveButton onClick={() => removeSkill(i)} label='Remove skill category' />
            <Field label={t.category} className='pe-7'>
              <Input
                value={skill.category}
                onChange={(e) => updateSkill(i, { category: e.target.value })}
                className={inputClass}
                placeholder='Programming Languages'
              />
            </Field>
            <div className='space-y-1'>
              <Label className={labelClass}>{t.skills}</Label>
              {skill.items.map((item, itemIndex) => (
                <div key={itemIndex} className='flex items-center gap-1'>
                  <Input
                    value={item}
                    onChange={(e) => {
                      const updated = [...skill.items]
                      updated[itemIndex] = e.target.value
                      updateSkill(i, { items: updated })
                    }}
                    className='h-7 text-[11px]'
                    placeholder='JavaScript'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='size-7 shrink-0 text-muted-foreground hover:text-destructive'
                    onClick={() => {
                      const updated = skill.items.filter((_, idx) => idx !== itemIndex)
                      updateSkill(i, { items: updated.length ? updated : [''] })
                    }}
                  >
                    <Trash2 className='size-3' />
                  </Button>
                </div>
              ))}
              <AddButton onClick={() => updateSkill(i, { items: [...skill.items, ''] })}>
                {t.addSkill}
              </AddButton>
            </div>
          </div>
        ))}
        <AddButton onClick={addSkill}>{t.addCategory}</AddButton>
      </SectionCard>

      <SectionCard title={t.certifications}>
        {cv.certifications.map((cert, i) => (
          <div key={i} className='relative space-y-2 rounded-lg border bg-muted/20 p-3'>
            <RemoveButton onClick={() => removeCert(i)} label='Remove certification' />
            <Field label={t.certName} className='pe-7'>
              <Input
                value={cert.name}
                onChange={(e) => updateCert(i, { name: e.target.value })}
                className={inputClass}
                placeholder='AWS Certified'
              />
            </Field>
            <div className='grid grid-cols-2 gap-2'>
              <Field label={t.issuer}>
                <Input
                  value={cert.issuer}
                  onChange={(e) => updateCert(i, { issuer: e.target.value })}
                  className={inputClass}
                  placeholder='Amazon'
                />
              </Field>
              <Field label={t.date}>
                <Input
                  value={cert.date}
                  onChange={(e) => updateCert(i, { date: e.target.value })}
                  className={inputClass}
                  placeholder='2023'
                  type='month'
                />
              </Field>
            </div>
          </div>
        ))}
        <AddButton onClick={addCert}>{t.addCert}</AddButton>
      </SectionCard>

      <SectionCard title={t.languages}>
        {cv.languages.map((lang, i) => (
          <div key={i} className='relative space-y-2 rounded-lg border bg-muted/20 p-3'>
            <RemoveButton onClick={() => removeLang(i)} label='Remove language' />
            <div className='grid grid-cols-2 gap-2 pe-7'>
              <Field label={t.langName}>
                <Input
                  value={lang.language}
                  onChange={(e) => updateLang(i, { language: e.target.value })}
                  className={inputClass}
                  placeholder='English'
                />
              </Field>
              <Field label={t.proficiency}>
                <Select
                  value={lang.proficiency}
                  onValueChange={(value) => updateLang(i, { proficiency: value })}
                >
                  <SelectTrigger className='h-8 w-full text-xs'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'Native',
                      'Near Native',
                      'Professional',
                      'Working Knowledge',
                      'Elementary',
                    ].map((level) => (
                      <SelectItem key={level} value={level} className='text-xs'>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
        ))}
        <AddButton onClick={addLang}>{t.addLang}</AddButton>
      </SectionCard>

      <div className='space-y-2 pt-1'>
        <Label className={labelClass}>{t.sectionOrder}</Label>
        <div className='space-y-1'>
          {cv.sectionOrder.map((section, i) => (
            <div
              key={section}
              className='flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-xs'
            >
              <span className='flex-1'>{t[section] || section}</span>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-6 text-muted-foreground'
                onClick={() => i > 0 && moveSection(i, i - 1)}
                disabled={i === 0}
              >
                <ChevronUp className='size-3.5' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-6 text-muted-foreground'
                onClick={() => i < cv.sectionOrder.length - 1 && moveSection(i, i + 1)}
                disabled={i === cv.sectionOrder.length - 1}
              >
                <ChevronDown className='size-3.5' />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const enLabels = {
  personalInfo: 'Personal Info',
  fullName: 'Full Name',
  fullNamePlaceholder: 'John Doe',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  addressPlaceholder: 'City, Country',
  summary: 'Professional Summary',
  summaryPlaceholder: 'Write a brief professional summary...',
  experience: 'Experience',
  position: 'Position',
  positionPlaceholder: 'Software Engineer',
  company: 'Company',
  companyPlaceholder: 'Company Name',
  startDate: 'Start Date',
  endDate: 'End Date',
  currentJob: 'I currently work here',
  bulletPoints: 'Bullet Points',
  bulletPlaceholder: 'Describe your achievement...',
  addBullet: 'Add bullet point',
  addExperience: 'Add Experience',
  education: 'Education',
  institution: 'Institution',
  institutionPlaceholder: 'University Name',
  degree: 'Degree',
  field: 'Field of Study',
  addEducation: 'Add Education',
  skills: 'Skills',
  category: 'Category',
  addSkill: 'Add skill',
  addCategory: 'Add category',
  certifications: 'Certifications',
  certName: 'Name',
  issuer: 'Issuer',
  date: 'Date',
  addCert: 'Add Certification',
  languages: 'Languages',
  langName: 'Language',
  proficiency: 'Proficiency',
  addLang: 'Add Language',
  sectionOrder: 'Section Order',
}

const idLabels = {
  personalInfo: 'Data Pribadi',
  fullName: 'Nama Lengkap',
  fullNamePlaceholder: 'John Doe',
  email: 'Email',
  phone: 'Telepon',
  address: 'Alamat',
  addressPlaceholder: 'Kota, Negara',
  summary: 'Ringkasan Profesional',
  summaryPlaceholder: 'Tulis ringkasan profesional singkat...',
  experience: 'Pengalaman',
  position: 'Posisi',
  positionPlaceholder: 'Software Engineer',
  company: 'Perusahaan',
  companyPlaceholder: 'Nama Perusahaan',
  startDate: 'Tanggal Mulai',
  endDate: 'Tanggal Selesai',
  currentJob: 'Saya masih bekerja di sini',
  bulletPoints: 'Poin Penting',
  bulletPlaceholder: 'Jelaskan pencapaian Anda...',
  addBullet: 'Tambah poin',
  addExperience: 'Tambah Pengalaman',
  education: 'Pendidikan',
  institution: 'Institusi',
  institutionPlaceholder: 'Nama Universitas',
  degree: 'Gelar',
  field: 'Bidang Studi',
  addEducation: 'Tambah Pendidikan',
  skills: 'Keahlian',
  category: 'Kategori',
  addSkill: 'Tambah skill',
  addCategory: 'Tambah kategori',
  certifications: 'Sertifikasi',
  certName: 'Nama',
  issuer: 'Penerbit',
  date: 'Tanggal',
  addCert: 'Tambah Sertifikasi',
  languages: 'Bahasa',
  langName: 'Bahasa',
  proficiency: 'Tingkat',
  addLang: 'Tambah Bahasa',
  sectionOrder: 'Urutan Section',
}
