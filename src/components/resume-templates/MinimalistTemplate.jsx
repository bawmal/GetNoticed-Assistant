import { useState } from 'react'
import { Download, Edit2, Save } from 'lucide-react'
import { generateMinimalistPDF } from '../../lib/pdfGenerator.jsx'

export default function MinimalistTemplate({ resumeContent, jobTitle, companyName = '' }) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(resumeContent)

  const handleExportPDF = async () => {
    await generateMinimalistPDF(content, jobTitle, companyName)
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-secondary flex items-center gap-2"
        >
          {isEditing ? <Save size={18} /> : <Edit2 size={18} />}
          {isEditing ? 'Save Changes' : 'Edit Resume'}
        </button>
        <button onClick={handleExportPDF} className="btn-primary flex items-center gap-2">
          <Download size={18} />
          Export PDF
        </button>
      </div>

      {/* Resume Content - Minimalist Style */}
      <div 
        id="resume-minimalist"
        className="bg-white shadow-lg"
        style={{ 
          width: '8.5in', 
          minHeight: '11in',
          margin: '0 auto',
          padding: '0.75in',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}
      >
        {/* Header - Ultra Clean */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-black mb-2 tracking-wider">{content.personalDetails.name.toUpperCase()}</h1>
          <h2 className="text-sm text-gray-600 mb-6 tracking-wide">{content.personalDetails.title || jobTitle}</h2>
          <div className="text-xs text-gray-600 flex gap-6 justify-center flex-wrap">
            <span>{content.personalDetails.email}</span>
            <span>|</span>
            <span>{content.personalDetails.phone}</span>
            <span>|</span>
            <span>{content.personalDetails.location}</span>
            {content.personalDetails.linkedin && (
              <>
                <span>|</span>
                <a href={content.personalDetails.linkedin} className="text-gray-600 hover:underline text-xs">
                  {content.personalDetails.linkedin}
                </a>
              </>
            )}
            {(content.personalDetails.portfolio || content.personalDetails.github) && (
              <>
                <span>|</span>
                <a href={content.personalDetails.portfolio || content.personalDetails.github} className="text-gray-600 hover:underline text-xs">
                  {content.personalDetails.portfolio || content.personalDetails.github}
                </a>
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8">
          <p className="text-sm text-gray-700 leading-relaxed text-justify">{content.summary}</p>
        </div>

        {/* Experience */}
        <div className="mb-8">
          <h3 className="text-xs font-bold mb-4 tracking-widest uppercase border-b border-black pb-1">Experience</h3>
          {(content.experience || []).map((exp, i) => (
            <div key={i} className="mb-5">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold">{exp.title}</h4>
                <span className="text-xs text-gray-600">{exp.start_date} – {exp.end_date}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{exp.company} • {exp.location}</p>
              <ul className="space-y-1">
                {(exp.achievements || []).map((achievement, j) => (
                  <li key={j} className="text-sm text-gray-700 leading-relaxed">• {achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="mb-8">
          <h3 className="text-xs font-bold mb-4 tracking-widest uppercase border-b border-black pb-1">Education</h3>
          {(content.education || []).map((edu, i) => (
            <div key={i} className="mb-3 flex justify-between">
              <div>
                <p className="font-bold text-sm">{edu.degree} in {edu.field_of_study}</p>
                <p className="text-sm text-gray-600">{edu.institution}</p>
              </div>
              {edu.graduation_year && <span className="text-sm text-gray-600">{edu.graduation_year}</span>}
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h3 className="text-xs font-bold mb-4 tracking-widest uppercase border-b border-black pb-1">Skills</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {[...(content.skills.technical || []), ...(content.skills.tools || []), ...(content.skills.soft || [])].join(' • ')}
          </p>
        </div>

        {/* Certifications */}
        {content.certifications && content.certifications.length > 0 && (
          <div>
            <h3 className="text-xs font-bold mb-4 tracking-widest uppercase border-b border-black pb-1">Certifications</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{content.certifications.join(' • ')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
