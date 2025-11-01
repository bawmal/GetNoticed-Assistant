import { useState } from 'react'
import { Download, Edit2, Save } from 'lucide-react'
import { generateExecutivePDF } from '../../lib/pdfGenerator.jsx'

export default function ExecutiveTemplate({ resumeContent, jobTitle, companyName = '' }) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(resumeContent)

  const handleExportPDF = async () => {
    await generateExecutivePDF(content, jobTitle, companyName)
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

      {/* Resume Content - Executive Style */}
      <div 
        id="resume-executive"
        className="bg-white shadow-lg"
        style={{ 
          width: '8.5in', 
          minHeight: '11in',
          margin: '0 auto',
          padding: '0.75in',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          pageBreakInside: 'auto'
        }}
      >
        <style>{`
          @media print {
            #resume-executive {
              page-break-inside: auto;
            }
            #resume-executive > div {
              page-break-inside: avoid;
            }
            .experience-item {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-bottom: 0.75rem !important;
              padding-bottom: 0 !important;
            }
            .experience-item ul {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-bottom: 0 !important;
            }
            .experience-item > div:last-child {
              margin-bottom: 0 !important;
            }
          }
        `}</style>
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 
                contentEditable={isEditing}
                suppressContentEditableWarning
                className={`text-4xl font-bold text-gray-900 mb-2 ${isEditing ? 'outline-dashed outline-2 outline-blue-300' : ''}`}
                onBlur={(e) => setContent({
                  ...content,
                  personalDetails: { ...content.personalDetails, name: e.target.textContent }
                })}
              >
                {content.personalDetails.name}
              </h1>
              <h2 
                contentEditable={isEditing}
                suppressContentEditableWarning
                className={`text-xl text-blue-600 font-medium ${isEditing ? 'outline-dashed outline-2 outline-blue-300' : ''}`}
                style={{ color: '#2563eb' }}
              >
                {content.personalDetails.title || jobTitle}
              </h2>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div>{content.personalDetails.location}</div>
              <div>{content.personalDetails.phone}</div>
              <div className="text-blue-600">{content.personalDetails.email}</div>
              {content.personalDetails.linkedin && <div className="text-blue-600 text-xs">{content.personalDetails.linkedin}</div>}
              {(content.personalDetails.portfolio || content.personalDetails.github) && <div className="text-blue-600 text-xs">{content.personalDetails.portfolio || content.personalDetails.github}</div>}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
            Summary
          </h3>
          <p 
            contentEditable={isEditing}
            suppressContentEditableWarning
            className={`text-sm text-gray-700 leading-relaxed ${isEditing ? 'outline-dashed outline-2 outline-blue-300 p-2' : ''}`}
            onBlur={(e) => setContent({ ...content, summary: e.target.textContent })}
          >
            {content.summary}
          </p>
        </div>

        <div className="flex gap-6">
          {/* Main Content - 70% */}
          <div className="w-[70%] space-y-6">
            {/* Experience */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                Experience
              </h3>
              
              {(content.experience || []).map((exp, i) => (
                <div key={i} className="mb-3 break-inside-avoid experience-item">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 pr-4">
                      <h4 
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        className={`font-bold text-gray-900 text-base ${isEditing ? 'outline-dashed outline-1 outline-blue-300' : ''}`}
                      >
                        {exp.title}
                      </h4>
                      <div className="text-sm text-gray-600 uppercase tracking-wide font-semibold">
                        {exp.company}
                      </div>
                      <div className="text-xs text-gray-500">
                        {exp.location}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
                      {exp.start_date} - {exp.end_date}
                    </div>
                  </div>
                  
                  <ul className="list-none space-y-2 mt-3">
                    {(exp.achievements || []).map((achievement, j) => (
                      <li key={j} className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1 flex-shrink-0">•</span>
                        <span 
                          contentEditable={isEditing}
                          suppressContentEditableWarning
                          className={`text-sm text-gray-700 leading-relaxed ${isEditing ? 'outline-dashed outline-1 outline-blue-300' : ''}`}
                        >
                          {achievement}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {exp.impact_quote && (
                    <div className="mt-3 pl-4 border-l-2 border-blue-200 bg-blue-50 p-2">
                      <p className="text-xs italic text-gray-700">
                        "{exp.impact_quote}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - 30% */}
          <div className="w-[30%] space-y-6">
            {/* Core Competencies */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                Core Competencies
              </h3>
              <div className="flex flex-wrap gap-1">
                {(content.skills.technical || []).map((skill, i) => (
                  <span 
                    key={i}
                    className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                Education
              </h3>
              {(content.education || []).map((edu, i) => (
                <div key={i} className="mb-3">
                  <div className="text-sm font-semibold text-gray-900 uppercase">
                    {edu.institution}
                  </div>
                  <div className="text-sm text-gray-700">{edu.degree}, {edu.field_of_study}</div>
                  {edu.graduation_date && <div className="text-xs text-gray-600">{edu.graduation_date}</div>}
                </div>
              ))}
            </div>

            {/* Certifications */}
            {content.certifications && content.certifications.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                  Certifications
                </h3>
                <div className="space-y-1">
                  {content.certifications.map((cert, i) => (
                    <div key={i} className="text-xs text-gray-700">
                      {cert}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
