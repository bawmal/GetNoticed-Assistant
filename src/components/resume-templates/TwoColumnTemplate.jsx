import { useState } from 'react'
import { Download, Edit2, Save } from 'lucide-react'
import { generateTwoColumnPDF } from '../../lib/pdfGenerator.jsx'

export default function TwoColumnTemplate({ resumeContent, jobTitle, companyName = '' }) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(resumeContent)

  const handleExportPDF = async () => {
    await generateTwoColumnPDF(content, jobTitle, companyName)
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

      {/* Resume Content - Two Column Layout */}
      <div 
        id="resume-two-column"
        className="bg-white shadow-lg"
        style={{ 
          width: '8.5in', 
          minHeight: '11in',
          margin: '0 auto',
          boxSizing: 'border-box',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}
      >
        <style>{`
          #resume-two-column {
            box-sizing: border-box;
          }
          #resume-two-column * {
            box-sizing: border-box;
          }
          @media print {
            #resume-two-column {
              width: 8.5in !important;
              box-sizing: border-box !important;
            }
            .experience-item {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-bottom: 0.75rem !important;
              padding-bottom: 0 !important;
            }
            .experience-item ul {
              margin-bottom: 0 !important;
            }
            .experience-item > div:last-child {
              margin-bottom: 0 !important;
            }
            .date-range {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              min-width: 100px !important;
              flex-shrink: 0 !important;
            }
            .flex {
              display: flex !important;
            }
            .justify-between {
              justify-content: space-between !important;
            }
          }
        `}</style>
        <div className="flex">
          {/* Left Sidebar - 35% */}
          <div className="w-[35%] bg-gray-50 p-6 space-y-6">
            {/* Header */}
            <div className="border-b border-gray-300 pb-4">
              <h1 
                contentEditable={isEditing}
                suppressContentEditableWarning
                className={`text-3xl font-bold text-gray-900 mb-2 ${isEditing ? 'outline-dashed outline-2 outline-blue-300' : ''}`}
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
                className={`text-base text-gray-600 mb-3 ${isEditing ? 'outline-dashed outline-2 outline-blue-300' : ''}`}
              >
                {content.personalDetails.title || jobTitle}
              </h2>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{content.personalDetails.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span>{content.personalDetails.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✉️</span>
                  <span>{content.personalDetails.email}</span>
                </div>
                {content.personalDetails.linkedin && (
                  <div className="flex items-center gap-2">
                    <span>🔗</span>
                    <span className="text-blue-600 text-xs break-all">
                      {content.personalDetails.linkedin}
                    </span>
                  </div>
                )}
                {(content.personalDetails.portfolio || content.personalDetails.github) && (
                  <div className="flex items-center gap-2">
                    <span>💻</span>
                    <span className="text-blue-600 text-xs break-all">
                      {content.personalDetails.portfolio || content.personalDetails.github}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                Skills
              </h3>
              <div className="space-y-4">
                {Object.entries(content.skills).map(([category, skills]) => (
                  <div key={category}>
                    <h4 className="text-xs font-semibold text-gray-800 mb-2 capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <ul className="space-y-1">
                      {skills.map((skill, i) => (
                        <li key={i} className="text-xs text-gray-700">
                          • {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
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
                  <div className="text-xs font-semibold text-gray-900">
                    {edu.degree}
                  </div>
                  <div className="text-xs text-gray-700">{edu.field_of_study}</div>
                  <div className="text-xs text-gray-600">{edu.institution}</div>
                  {edu.graduation_date && <div className="text-xs text-gray-500">{edu.graduation_date}</div>}
                </div>
              ))}
            </div>

            {/* Certifications */}
            {content.certifications && content.certifications.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                  Certifications
                </h3>
                <ul className="space-y-1">
                  {content.certifications.map((cert, i) => (
                    <li key={i} className="text-xs text-gray-700">
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Content - 65% */}
          <div className="w-[65%] p-6">
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

            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b-2 border-gray-300">
              Experience
            </h3>
            
            {(content.experience || []).map((exp, i) => (
              <div key={i} className="mb-3 break-inside-avoid experience-item">
                <div className="flex justify-between items-start mb-2" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="flex-1 pr-4" style={{ flex: '1', paddingRight: '1rem', maxWidth: 'calc(100% - 120px)' }}>
                    <h4 
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      className={`text-sm font-bold text-gray-900 ${isEditing ? 'outline-dashed outline-1 outline-blue-300' : ''}`}
                    >
                      {exp.title}
                    </h4>
                    <div className="text-xs text-gray-600">
                      <span className="font-semibold">{exp.company}</span> • {exp.location}
                    </div>
                  </div>
                  <div 
                    className="date-range text-xs text-gray-500 text-right whitespace-nowrap flex-shrink-0 min-w-[100px] ml-2"
                    style={{ 
                      minWidth: '110px', 
                      flexShrink: 0, 
                      whiteSpace: 'nowrap',
                      textAlign: 'right',
                      marginLeft: '0.5rem'
                    }}
                  >
                    {exp.start_date} - {exp.end_date}
                  </div>
                </div>
                
                <ul className="space-y-2 mt-3">
                  {(exp.achievements || []).map((achievement, j) => (
                    <li key={j} className="flex items-start text-xs text-gray-700">
                      <span className="text-blue-600 mr-2 mt-0.5">•</span>
                      <span 
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        className={`flex-1 ${isEditing ? 'outline-dashed outline-1 outline-blue-300' : ''}`}
                      >
                        {achievement}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Impact Quote if exists */}
                {exp.impact_quote && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-200">
                    <p className="text-xs italic text-gray-600">
                      "{exp.impact_quote}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
