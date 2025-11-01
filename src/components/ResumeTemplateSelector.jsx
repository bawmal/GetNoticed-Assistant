import { useState } from 'react'
import { Download } from 'lucide-react'
import TwoColumnTemplate from './resume-templates/TwoColumnTemplate'
import ExecutiveTemplate from './resume-templates/ExecutiveTemplate'
import TraditionalTemplate from './resume-templates/TraditionalTemplate'
import CreativeTemplate from './resume-templates/CreativeTemplate'
import MinimalistTemplate from './resume-templates/MinimalistTemplate'
import { 
  generateTraditionalPDF, 
  generateTwoColumnPDF, 
  generateExecutivePDF,
  generateCreativePDF,
  generateMinimalistPDF
} from '../lib/pdfGenerator.jsx'

const TEMPLATES = [
  {
    id: 'traditional',
    name: 'Traditional (Recommended for ATS)',
    description: 'Classic format, 95% ATS-readable, best for applicant tracking systems',
    component: TraditionalTemplate
  },
  {
    id: 'two-column',
    name: 'Professional Two-Column',
    description: 'Clean sidebar layout, perfect for technical roles',
    component: TwoColumnTemplate
  },
  {
    id: 'executive',
    name: 'Executive Highlight',
    description: 'Blue accents, competency tags, senior-focused',
    component: ExecutiveTemplate
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Modern with indigo accents and unique layout',
    component: CreativeTemplate
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Ultra-clean with maximum white space',
    component: MinimalistTemplate
  }
]

export default function ResumeTemplateSelector({ resumeContent, jobTitle, companyName = '' }) {
  const [selectedTemplate, setSelectedTemplate] = useState('traditional')
  const [exporting, setExporting] = useState(false)

  const SelectedTemplateComponent = TEMPLATES.find(t => t.id === selectedTemplate)?.component || TraditionalTemplate

  const handleExportAllTemplates = async () => {
    setExporting(true)
    try {
      await generateTraditionalPDF(resumeContent, jobTitle, companyName)
      await new Promise(resolve => setTimeout(resolve, 500))
      await generateTwoColumnPDF(resumeContent, jobTitle, companyName)
      await new Promise(resolve => setTimeout(resolve, 500))
      await generateExecutivePDF(resumeContent, jobTitle, companyName)
      await new Promise(resolve => setTimeout(resolve, 500))
      await generateCreativePDF(resumeContent, jobTitle, companyName)
      await new Promise(resolve => setTimeout(resolve, 500))
      await generateMinimalistPDF(resumeContent, jobTitle, companyName)
    } catch (error) {
      console.error('Error exporting all templates:', error)
      alert('Failed to export all templates. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Template Selector */}
      <div className="card bg-gray-50">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-900">Choose Resume Template</h4>
          <button
            onClick={handleExportAllTemplates}
            disabled={exporting}
            className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            {exporting ? 'Exporting...' : 'Export All Templates'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`text-left p-3 rounded-lg border-2 transition-all ${
                selectedTemplate === template.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-sm text-gray-900">{template.name}</div>
              <div className="text-xs text-gray-600 mt-1">{template.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Template */}
      <SelectedTemplateComponent resumeContent={resumeContent} jobTitle={jobTitle} companyName={companyName} />
    </div>
  )
}
