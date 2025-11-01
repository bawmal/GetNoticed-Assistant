import { useState } from 'react'
import { Download, Edit2, Save } from 'lucide-react'
import { generateCreativePDF } from '../../lib/pdfGenerator.jsx'

export default function CreativeTemplate({ resumeContent, jobTitle, companyName = '' }) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(resumeContent)

  const handleExportPDF = async () => {
    await generateCreativePDF(content, jobTitle, companyName)
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

      {/* Resume Content - Creative Style */}
      <div 
        id="resume-creative"
        className="bg-white shadow-lg"
        style={{ 
          width: '8.5in', 
          minHeight: '11in',
          margin: '0 auto',
          padding: '0.5in',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}
      >
        {/* Header with accent bar */}
        <div className="mb-6">
          <div className="h-1 bg-indigo-500 mb-4"></div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">{content.personalDetails.name}</h1>
          <h2 className="text-lg text-indigo-500 font-semibold mb-4">{content.personalDetails.title || jobTitle}</h2>
          <div className="text-sm text-gray-600 flex gap-4 flex-wrap">
            <span>{content.personalDetails.location}</span>
            <span>•</span>
            <span>{content.personalDetails.phone}</span>
            <span>•</span>
            <span>{content.personalDetails.email}</span>
            {content.personalDetails.linkedin && (
              <>
                <span>•</span>
                <a href={content.personalDetails.linkedin} className="text-blue-600 hover:underline text-xs">
                  {content.personalDetails.linkedin}
                </a>
              </>
            )}
            {(content.personalDetails.portfolio || content.personalDetails.github) && (
              <>
                <span>•</span>
                <a href={content.personalDetails.portfolio || content.personalDetails.github} className="text-blue-600 hover:underline text-xs">
                  {content.personalDetails.portfolio || content.personalDetails.github}
                </a>
              </>
            )}
          </div>
        </div>

        {/* Summary with accent */}
        <div className="mb-6 pl-4 border-l-4 border-indigo-500">
          <h3 className="text-sm font-bold text-indigo-500 mb-2 uppercase">Professional Summary</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{content.summary}</p>
        </div>

        {/* Experience */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-indigo-500 mb-4 uppercase">Experience</h3>
          {(content.experience || []).map((exp, i) => (
            <div key={i} className="mb-4 pl-3 border-l-2 border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900">{exp.title}</h4>
                  <p className="text-sm text-indigo-500 font-semibold">{exp.company}</p>
                  <p className="text-sm text-gray-600">{exp.location}</p>
                </div>
                <span className="text-sm text-gray-600">{exp.start_date} – {exp.end_date}</span>
              </div>
              <ul className="space-y-1">
                {(exp.achievements || []).map((achievement, j) => (
                  <li key={j} className="text-sm text-gray-700 leading-relaxed">• {achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Two Column Layout for Education and Skills */}
        <div className="grid grid-cols-2 gap-6">
          {/* Education */}
          <div>
            <h3 className="text-sm font-bold text-indigo-500 mb-3 uppercase">Education</h3>
            {(content.education || []).map((edu, i) => (
              <div key={i} className="mb-3">
                <p className="font-bold text-sm">{edu.degree} in {edu.field_of_study}</p>
                <p className="text-sm text-gray-600">{edu.institution}</p>
                {edu.graduation_year && <p className="text-sm text-gray-600">{edu.graduation_year}</p>}
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-sm font-bold text-indigo-500 mb-3 uppercase">Skills</h3>
            {content.skills.technical && content.skills.technical.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold mb-1">Technical</p>
                <p className="text-sm text-gray-700 leading-relaxed">{content.skills.technical.join(' • ')}</p>
              </div>
            )}
            {content.skills.tools && content.skills.tools.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold mb-1">Tools</p>
                <p className="text-sm text-gray-700 leading-relaxed">{content.skills.tools.join(' • ')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Certifications */}
        {content.certifications && content.certifications.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-indigo-500 mb-3 uppercase">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {content.certifications.map((cert, i) => (
                <span key={i} className="text-xs bg-purple-50 text-indigo-500 px-3 py-1 rounded-full">{cert}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
